// Llamada al modelo por la API REST de Gemini con fetch (corre igual en Workers y en Node, sin SDK).
// La clave va en la cabecera x-goog-api-key (nunca en la URL) y no se loguea.
import type { ChatMessage, GenerateParams } from './types.ts'
import { isPlainObject } from './validation.ts'

// Los tokens de razonamiento cuentan contra este tope; gemini-3.5-flash-lite razona al nivel mínimo por defecto
export const MAX_OUTPUT_TOKENS = 512
export const TEMPERATURE = 0.6
export const TIMEOUT_MS = 15_000

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

export interface Content {
  role: 'user' | 'model'
  parts: { text: string }[]
}

// El historial va como contents; el prompt va aparte en systemInstruction.
// El modelo exige empezar con turno de usuario: se descartan los turnos iniciales de la asistente.
export function toContents(messages: readonly ChatMessage[]): Content[] {
  const firstUser = messages.findIndex((message) => message.role === 'user')
  return messages.slice(Math.max(firstUser, 0)).map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }))
}

// Igual que `response.text` del SDK: texto del primer candidato, sin las partes de razonamiento
export function extractText(data: unknown): string {
  const candidates: unknown = isPlainObject(data) ? data.candidates : undefined
  const list: unknown[] = Array.isArray(candidates) ? candidates : []
  const first = list[0]
  const content = isPlainObject(first) ? first.content : undefined
  const parts: unknown = isPlainObject(content) ? content.parts : undefined
  if (!Array.isArray(parts)) return ''
  const items: unknown[] = parts
  return items
    .map((part) => (isPlainObject(part) && typeof part.text === 'string' && part.thought !== true ? part.text : ''))
    .join('')
}

export type FetchFn = (url: string, init: RequestInit) => Promise<Response>

export interface GenerateOptions {
  fetchFn?: FetchFn
  timeoutMs?: number
}

export async function generateWithGemini(
  { apiKey, model, systemInstruction, messages }: GenerateParams,
  { fetchFn = (url, init) => fetch(url, init), timeoutMs = TIMEOUT_MS }: GenerateOptions = {},
): Promise<string> {
  // El timeout aborta también la lectura del cuerpo
  const response = await fetchFn(`${API_BASE}/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: toContents(messages),
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: TEMPERATURE },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!response.ok) {
    // Solo el estado: el cuerpo del error no se lee ni se propaga
    await response.body?.cancel()
    throw Object.assign(new Error('UPSTREAM_STATUS'), { status: response.status })
  }
  return extractText(await response.json())
}
