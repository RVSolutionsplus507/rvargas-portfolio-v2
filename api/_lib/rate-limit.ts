// Límite de tasa en memoria. Limitaciones: el estado es por instancia de la función
// y se pierde en cada cold start, así que NO es un límite global exacto: cada instancia
// concurrente lleva su propio contador. Es una primera barrera; el control real es
// externo: regla de rate limit del Firewall de Vercel + cuota/presupuesto en Google
// (ver .env.example). El handler consulta checkIp solo con cuerpo ya validado, y
// checkGlobal solo justo antes de llamar al modelo.
import type { IncomingHttpHeaders } from 'node:http'
import { isIP } from 'node:net'

const MINUTE = 60_000
const DAY = 24 * 60 * MINUTE
const SHARED = '__shared__'

const dayKeyOf = (now: number): number => Math.floor(now / DAY)
const secondsUntilNextDay = (now: number): number => Math.max(1, Math.ceil(((dayKeyOf(now) + 1) * DAY - now) / 1000))

// Agrupa IPv6 por /64 (un cliente suele controlar todo su /64) y desenvuelve IPv4 mapeada
function normalizeIp(raw: string): string | null {
  const [ip = ''] = raw.trim().split('%')
  const family = isIP(ip)
  if (family === 4) return ip
  if (family !== 6) return null

  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip)
  const mappedV4 = mapped?.[1]
  if (mappedV4 !== undefined && isIP(mappedV4) === 4) return mappedV4

  const [head = '', tail = ''] = ip.split('::')
  const toGroups = (part: string): string[] => {
    const groups = part === '' ? [] : part.split(':')
    const last = groups.at(-1)
    if (last?.includes('.')) {
      const [a = 0, b = 0, c = 0, d = 0] = last.split('.').map(Number)
      groups.splice(-1, 1, ((a << 8) | b).toString(16), ((c << 8) | d).toString(16))
    }
    return groups
  }
  const headGroups = toGroups(head)
  const tailGroups = ip.includes('::') ? toGroups(tail) : []
  const fill = ip.includes('::') ? 8 - headGroups.length - tailGroups.length : 0
  const groups = [...headGroups, ...Array(Math.max(fill, 0)).fill('0'), ...tailGroups]
  return `${groups.slice(0, 4).map((g) => g.padStart(4, '0').toLowerCase()).join(':')}::/64`
}

const firstValue = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value

// Orden de confianza (docs de Vercel, "Request headers", verificado 2026-10-17):
// x-vercel-forwarded-for es idéntico a x-forwarded-for pero NO lo sobrescribe un proxy
// delante de Vercel; luego el primer valor de x-forwarded-for; luego x-real-ip.
// Se usa la primera cabecera presente: si trae basura NO se cae a la siguiente y el
// resultado es null (cubeta compartida estricta).
export function getClientIp(headers: IncomingHttpHeaders): string | null {
  const candidates: (string | string[] | undefined)[] = [
    firstValue(headers['x-vercel-forwarded-for']),
    firstValue(headers['x-forwarded-for'])?.split(','),
    firstValue(headers['x-real-ip']),
  ]
  for (const candidate of candidates) {
    const value = Array.isArray(candidate) ? candidate[0] : candidate
    if (typeof value === 'string' && value.trim()) return normalizeIp(value)
  }
  return null
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
