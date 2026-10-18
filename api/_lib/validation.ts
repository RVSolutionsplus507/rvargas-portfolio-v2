// Validación manual del cuerpo de POST /api/chat. Sin dependencias.
import type { ChatLang, ChatMessage, ChatRequest, ChatRequestBody, ChatRole } from './types.ts'

export const MAX_BODY_BYTES = 8 * 1024
const MAX_MESSAGES = 8
const MAX_CONTENT_CHARS = 500
const MAX_TOTAL_CHARS = 2000

const isRole = (value: unknown): value is ChatRole => value === 'user' || value === 'assistant'
const isLang = (value: unknown): value is ChatLang => value === 'es' || value === 'en'

// Controles C0 (salvo \t \n \r), DEL y controles C1
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const hasExactKeys = (value: object, keys: readonly string[]): boolean => {
  const own = Object.keys(value)
  return own.length === keys.length && keys.every((key) => own.includes(key))
}

export function isJsonContentType(header: string | undefined): boolean {
  if (typeof header !== 'string') return false
  const [mediaType = ''] = header.split(';')
  return mediaType.trim().toLowerCase() === 'application/json'
}

// Lee el stream con tope duro. Si se pasa del tope sigue drenando un poco
// (para poder responder 413 sin cortar el socket) y luego corta.
export type ReadBodyResult = { ok: true; text: string } | { ok: false }

export async function readBody(req: ChatRequest, maxBytes = MAX_BODY_BYTES): Promise<ReadBodyResult> {
  const declared = Number.parseInt(req.headers['content-length'] ?? '', 10)
  if (Number.isFinite(declared) && declared > maxBytes) return { ok: false }

  const chunks: Uint8Array[] = []
  let size = 0
  let exceeded = false
  for await (const chunk of req) {
    size += chunk.length
    if (size > maxBytes) exceeded = true
    if (size > maxBytes * 4) break
    if (!exceeded) chunks.push(chunk)
  }
  if (exceeded) return { ok: false }
  return { ok: true, text: Buffer.concat(chunks).toString('utf8') }
}

// Devuelve { ok: true, data } con el contenido ya recortado, o { ok: false } sin eco del input.
export type ValidationResult = { ok: true; data: ChatRequestBody } | { ok: false }

export function validateChatBody(body: unknown): ValidationResult {
  if (!isPlainObject(body) || !hasExactKeys(body, ['messages', 'lang'])) return { ok: false }
  const { lang } = body
  if (!isLang(lang)) return { ok: false }

  const messages: unknown = body.messages
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > MAX_MESSAGES) {
    return { ok: false }
  }
  const items: unknown[] = messages

  const clean: ChatMessage[] = []
  let total = 0
  for (const message of items) {
    if (!isPlainObject(message) || !hasExactKeys(message, ['role', 'content'])) return { ok: false }
    if (!isRole(message.role) || typeof message.content !== 'string') return { ok: false }
    if (CONTROL_CHARS.test(message.content)) return { ok: false }
    const content = message.content.trim()
    if (content.length < 1 || content.length > MAX_CONTENT_CHARS) return { ok: false }
    total += content.length
    clean.push({ role: message.role, content })
  }

  if (total > MAX_TOTAL_CHARS) return { ok: false }
  if (clean.at(-1)?.role !== 'user') return { ok: false }
  return { ok: true, data: { messages: clean, lang } }
}
