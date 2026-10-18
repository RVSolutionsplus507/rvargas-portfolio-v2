// Límite de tasa en memoria. Limitaciones: en Cloudflare el estado vive en cada isolate
// (uno o varios por data center, reciclados sin aviso), así que NO es un límite global exacto:
// es una primera barrera. El control real es externo: regla de Rate Limiting/WAF de Cloudflare
// sobre POST /api/chat + cuota/presupuesto en Google (ver README). El handler consulta checkIp
// solo con cuerpo ya validado, y checkGlobal solo justo antes de llamar al modelo.

const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE
const SHARED = '__shared__'

const dayKeyOf = (now: number): number => Math.floor(now / DAY)
const secondsUntilNextDay = (now: number): number => Math.max(1, Math.ceil(((dayKeyOf(now) + 1) * DAY - now) / 1000))

const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/

// Agrupa IPv6 por /64 (un cliente suele controlar todo su /64) y desenvuelve IPv4 mapeada.
// Sin node:net para correr igual en Workers y en Node: el parser de URL valida y canoniza la IPv6.
function normalizeIp(raw: string): string | null {
  const [ip = ''] = raw.trim().split('%')
  if (IPV4.test(ip)) return ip
  if (!/^[\da-f:.]+$/i.test(ip)) return null

  let host: string
  try {
    host = new URL(`http://[${ip}]`).hostname.slice(1, -1)
  } catch {
    return null
  }
  const [head = '', tail = ''] = host.split('::')
  const headGroups = head === '' ? [] : head.split(':')
  const tailGroups = tail === '' ? [] : tail.split(':')
  const fill = host.includes('::') ? 8 - headGroups.length - tailGroups.length : 0
  const groups = [...headGroups, ...Array<string>(fill).fill('0'), ...tailGroups]

  const [g6 = '0', g7 = '0'] = groups.slice(6)
  if (groups.slice(0, 5).every((g) => g === '0') && groups[5] === 'ffff') {
    const hi = Number.parseInt(g6, 16)
    const lo = Number.parseInt(g7, 16)
    return `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`
  }
  return `${groups.slice(0, 4).map((g) => g.padStart(4, '0')).join(':')}::/64`
}

// En Cloudflare, cf-connecting-ip la fija el borde con la IP real y el cliente no puede falsearla;
// x-forwarded-for no sirve (Cloudflare conserva lo que mande el cliente y agrega la IP al final).
// Sin cabecera o con un valor que no es IP: null (cubeta compartida estricta).
export function getClientIp(headers: Headers): string | null {
  const value = headers.get('cf-connecting-ip')
  return value?.trim() ? normalizeIp(value) : null
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number }

export interface RateLimiterOptions {
  perMinute?: number
  perDay?: number
  sharedPerMinute?: number
  sharedPerDay?: number
  globalDaily?: number
  maxEntries?: number
}

export interface RateLimiter {
  checkIp(ip: string | null | undefined, now: number): RateLimitResult
  checkGlobal(now: number): RateLimitResult
  size(): number
}

interface Entry {
  minuteStart: number
  minuteCount: number
  dayKey: number
  dayCount: number
}

export function createRateLimiter({
  perMinute = 8,
  perDay = 60,
  sharedPerMinute = 3,
  sharedPerDay = 20,
  globalDaily = 500,
  maxEntries = 10_000,
}: RateLimiterOptions = {}): RateLimiter {
  const entries = new Map<string, Entry>()
  let lastSweep = 0
  let globalDay = -1
  let globalCount = 0

  const sweep = (now: number): void => {
    lastSweep = now
    for (const [key, entry] of entries) {
      if (now - entry.minuteStart >= MINUTE && entry.dayKey !== dayKeyOf(now)) entries.delete(key)
    }
  }

  return {
    checkIp(ip, now) {
      if (now - lastSweep >= MINUTE) sweep(now)

      const key = ip ?? SHARED
      if (key !== SHARED && !entries.has(key) && entries.size >= maxEntries) {
        // Mapa lleno: desaloja la entrada más antigua (orden de inserción), sin tocar la compartida
        for (const oldest of entries.keys()) {
          if (oldest === SHARED) continue
          entries.delete(oldest)
          break
        }
      }
      const shared = key === SHARED
      const limitMinute = shared ? sharedPerMinute : perMinute
      const limitDay = shared ? sharedPerDay : perDay

      let entry = entries.get(key)
      if (!entry) {
        entry = { minuteStart: now, minuteCount: 0, dayKey: dayKeyOf(now), dayCount: 0 }
        entries.set(key, entry)
      }
      if (now - entry.minuteStart >= MINUTE) {
        entry.minuteStart = now
        entry.minuteCount = 0
      }
      if (entry.dayKey !== dayKeyOf(now)) {
        entry.dayKey = dayKeyOf(now)
        entry.dayCount = 0
      }

      if (entry.dayCount >= limitDay) return { ok: false, retryAfterSec: secondsUntilNextDay(now) }
      if (entry.minuteCount >= limitMinute) {
        return { ok: false, retryAfterSec: Math.max(1, Math.ceil((entry.minuteStart + MINUTE - now) / 1000)) }
      }
      entry.minuteCount += 1
      entry.dayCount += 1
      return { ok: true }
    },

    checkGlobal(now) {
      if (globalDay !== dayKeyOf(now)) {
        globalDay = dayKeyOf(now)
        globalCount = 0
      }
      if (globalCount >= globalDaily) return { ok: false, retryAfterSec: secondsUntilNextDay(now) }
      globalCount += 1
      return { ok: true }
    },

    size: () => entries.size,
  }
}
