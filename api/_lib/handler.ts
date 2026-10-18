// Handler de POST /api/chat. Fábrica con dependencias inyectadas para probar sin red.
import { isOriginAllowed } from './origin.ts'
import { buildSystemInstruction } from './prompt.ts'
import { createRateLimiter, getClientIp } from './rate-limit.ts'
import type { RateLimiter } from './rate-limit.ts'
import type { ChatEnv, ChatHandler, ChatResponse, ChatResponseBody, GenerateFn } from './types.ts'
import type { ReadBodyResult } from './validation.ts'
import { isJsonContentType, readBody, validateChatBody } from './validation.ts'

// gemini-2.0-flash fue apagado el 2026-06-01; 3.5 Flash-Lite es el estable económico recomendado (verificado 2026-10-17)
export const DEFAULT_MODEL = 'gemini-3.5-flash-lite'
const DEFAULT_DAILY_CAP = 500
const MAX_REPLY_CHARS = 2000

const parseDailyCap = (value: string | undefined): number => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DAILY_CAP
}

// Solo estado/código del error: nunca mensajes del SDK, cuerpo, IP ni clave
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const errorCode = (err: unknown): string => {
  if (!isRecord(err)) return 'unknown'
  if (err.message === 'TIMEOUT') return 'TIMEOUT'
  const code = err.status ?? err.code ?? err.name
  return typeof code === 'number' || typeof code === 'string' ? String(code).slice(0, 40) : 'unknown'
}

export type LogFn = (event: string, info: Record<string, string>) => void

const defaultLog: LogFn = (event, info) => console.error(`[chat] ${event} ${JSON.stringify(info)}`)

function send(
  res: ChatResponse,
  status: number,
  body: ChatResponseBody,
  headers: Record<string, string | number> = {},
): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value)
  res.end(JSON.stringify(body))
}

export interface HandlerDeps {
  generate: GenerateFn
  now?: () => number
  env?: ChatEnv
  rateLimiter?: RateLimiter
  log?: LogFn
}

export function createHandler({
  generate,
  now = Date.now,
  env = process.env,
  rateLimiter = createRateLimiter({ globalDaily: parseDailyCap(env.GEMINI_DAILY_CAP) }),
  log = defaultLog,
}: HandlerDeps): ChatHandler {
  return async function handler(req, res) {
    try {
      if (req.method !== 'POST') {
        return send(res, 405, { error: 'METHOD_NOT_ALLOWED' }, { Allow: 'POST' })
      }

      if (!isOriginAllowed(req.headers, env)) return send(res, 403, { error: 'FORBIDDEN_ORIGIN' })

      if (!isJsonContentType(req.headers['content-type'])) {
        return send(res, 400, { error: 'INVALID_REQUEST' })
      }

      let raw: ReadBodyResult
      try {
        raw = await readBody(req)
      } catch {
        return send(res, 400, { error: 'INVALID_REQUEST' })
      }
      if (!raw.ok) return send(res, 413, { error: 'PAYLOAD_TOO_LARGE' }, { Connection: 'close' })

      let parsed: unknown
      try {
        parsed = JSON.parse(raw.text)
      } catch {
        return send(res, 400, { error: 'INVALID_REQUEST' })
      }
      const valid = validateChatBody(parsed)
      if (!valid.ok) return send(res, 400, { error: 'INVALID_REQUEST' })

      // Solo con cuerpo válido: las peticiones inválidas no crean entradas ni gastan cupo por IP
      const limited = rateLimiter.checkIp(getClientIp(req.headers), now())
      if (!limited.ok) {
        return send(res, 429, { error: 'RATE_LIMITED' }, { 'Retry-After': limited.retryAfterSec })
      }

      const apiKey = env.GEMINI_API_KEY
      if (!apiKey) return send(res, 503, { error: 'NOT_CONFIGURED' })

      const capped = rateLimiter.checkGlobal(now())
      if (!capped.ok) {
        return send(res, 429, { error: 'RATE_LIMITED' }, { 'Retry-After': capped.retryAfterSec })
      }

      const { messages, lang } = valid.data
      let reply: string
      try {
        reply = await generate({
          apiKey,
          model: env.GEMINI_MODEL || DEFAULT_MODEL,
          systemInstruction: buildSystemInstruction(lang),
          messages,
        })
      } catch (err) {
        log('upstream_error', { code: errorCode(err) })
        return send(res, 502, { error: 'UPSTREAM_ERROR' })
      }

      const text = typeof reply === 'string' ? reply.trim().slice(0, MAX_REPLY_CHARS) : ''
      if (!text) {
        log('upstream_error', { code: 'EMPTY_REPLY' })
        return send(res, 502, { error: 'UPSTREAM_ERROR' })
      }
      return send(res, 200, { reply: text })
    } catch (err) {
      log('unexpected_error', { code: errorCode(err) })
      if (!res.headersSent) send(res, 500, { error: 'UPSTREAM_ERROR' })
    }
  }
}
