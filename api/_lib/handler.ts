// Handler de POST /api/chat. Fábrica con dependencias inyectadas para probar sin red.
import { isOriginAllowed } from './origin.ts'
import { buildSystemInstruction } from './prompt.ts'
import { createRateLimiter, getClientIp } from './rate-limit.ts'
import type { RateLimiter } from './rate-limit.ts'
import type { ChatEnv, ChatHandler, ChatResponseBody, GenerateFn } from './types.ts'
import type { ReadBodyResult } from './validation.ts'
import { isJsonContentType, isPlainObject, readBody, validateChatBody } from './validation.ts'

// gemini-2.0-flash fue apagado el 2026-06-01; 3.5 Flash-Lite es el estable económico recomendado (verificado 2026-10-17)
export const DEFAULT_MODEL = 'gemini-3.5-flash-lite'
const DEFAULT_DAILY_CAP = 500
const MAX_REPLY_CHARS = 2000
const MODEL_PATTERN = /^[a-z0-9][a-z0-9.-]{0,63}$/

const DEFAULT_HOSTS = ['rvargas.dev', 'www.rvargas.dev', 'localhost', '127.0.0.1', '[::1]']

// Falla cerrado: lista vacía = DEFAULT_HOSTS; '*' quita la restricción (solo Preview)
const parseAllowedHosts = (value: string | undefined): string[] | '*' => {
  const hosts = (value ?? '').split(',').map((host) => host.trim().toLowerCase()).filter(Boolean)
  if (hosts.includes('*')) return '*'
  return hosts.length > 0 ? hosts : DEFAULT_HOSTS
}

const parseDailyCap = (value: string | undefined): number => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DAILY_CAP
}

// Solo estado/código del error: nunca mensajes del proveedor, cuerpo, IP ni clave
const errorCode = (err: unknown): string => {
  if (!isPlainObject(err)) return 'unknown'
  if (err.name === 'TimeoutError') return 'TIMEOUT'
  const code = err.status ?? err.code ?? err.name
  return typeof code === 'number' || typeof code === 'string' ? String(code).slice(0, 40) : 'unknown'
}

export type LogFn = (event: string, info: Record<string, string>) => void

const defaultLog: LogFn = (event, info) => console.error(`[chat] ${event} ${JSON.stringify(info)}`)

function send(status: number, body: ChatResponseBody, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      'Cross-Origin-Resource-Policy': 'same-origin',
      ...headers,
    },
  })
}

export interface HandlerDeps {
  generate: GenerateFn
  env: ChatEnv
  now?: () => number
  rateLimiter?: RateLimiter
  log?: LogFn
}

export function createHandler({
  generate,
  env,
  now = Date.now,
  rateLimiter = createRateLimiter({ globalDaily: parseDailyCap(env.GEMINI_DAILY_CAP) }),
  log = defaultLog,
}: HandlerDeps): ChatHandler {
  const allowedHosts = parseAllowedHosts(env.ALLOWED_HOSTS)

  return async function handler(request) {
    try {
      if (request.method !== 'POST') {
        return send(405, { error: 'METHOD_NOT_ALLOWED' }, { Allow: 'POST' })
      }

      if (allowedHosts !== '*' && !allowedHosts.includes(new URL(request.url).hostname.toLowerCase())) {
        return send(403, { error: 'FORBIDDEN_ORIGIN' })
      }

      if (!isOriginAllowed(request, env)) return send(403, { error: 'FORBIDDEN_ORIGIN' })

      if (!isJsonContentType(request.headers.get('content-type'))) {
        return send(400, { error: 'INVALID_REQUEST' })
      }

      let raw: ReadBodyResult
      try {
        raw = await readBody(request)
      } catch {
        return send(400, { error: 'INVALID_REQUEST' })
      }
      if (!raw.ok) return send(413, { error: 'PAYLOAD_TOO_LARGE' })

      let parsed: unknown
      try {
        parsed = JSON.parse(raw.text)
      } catch {
        return send(400, { error: 'INVALID_REQUEST' })
      }
      const valid = validateChatBody(parsed)
      if (!valid.ok) return send(400, { error: 'INVALID_REQUEST' })

      // Solo con cuerpo válido: las peticiones inválidas no crean entradas ni gastan cupo por IP
      const limited = rateLimiter.checkIp(getClientIp(request.headers), now())
      if (!limited.ok) {
        return send(429, { error: 'RATE_LIMITED' }, { 'Retry-After': String(limited.retryAfterSec) })
      }

      const apiKey = env.GEMINI_API_KEY
      if (!apiKey) return send(503, { error: 'NOT_CONFIGURED' })

      const model = env.GEMINI_MODEL || DEFAULT_MODEL
      if (!MODEL_PATTERN.test(model)) return send(503, { error: 'NOT_CONFIGURED' })

      const capped = rateLimiter.checkGlobal(now())
      if (!capped.ok) {
        return send(429, { error: 'RATE_LIMITED' }, { 'Retry-After': String(capped.retryAfterSec) })
      }

      const { messages, lang } = valid.data
      let reply: string
      try {
        reply = await generate({
          apiKey,
          model,
          systemInstruction: buildSystemInstruction(lang),
          messages,
        })
      } catch (err) {
        log('upstream_error', { code: errorCode(err) })
        return send(502, { error: 'UPSTREAM_ERROR' })
      }

      const text = typeof reply === 'string' ? reply.trim().slice(0, MAX_REPLY_CHARS) : ''
      if (!text) {
        log('upstream_error', { code: 'EMPTY_REPLY' })
        return send(502, { error: 'UPSTREAM_ERROR' })
      }
      return send(200, { reply: text })
    } catch (err) {
      log('unexpected_error', { code: errorCode(err) })
      return send(500, { error: 'UPSTREAM_ERROR' })
    }
  }
}
