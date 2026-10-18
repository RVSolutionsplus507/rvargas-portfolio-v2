// Llamada al modelo con @google/genai. La clave llega por parámetro, nunca se loguea.
import type { Content, GenerateContentResponse } from '@google/genai'
import type { ChatMessage, GenerateParams } from './types.ts'

// Los tokens de razonamiento cuentan contra este tope; gemini-3.5-flash-lite razona al nivel mínimo por defecto
export const MAX_OUTPUT_TOKENS = 512
export const TEMPERATURE = 0.6
export const TIMEOUT_MS = 15_000

// El historial va como contents; el prompt va aparte en systemInstruction.
// El modelo exige empezar con turno de usuario: se descartan los turnos iniciales de la asistente.
export function toContents(messages: readonly ChatMessage[]): Content[] {
  const firstUser = messages.findIndex((message) => message.role === 'user')
  return messages.slice(Math.max(firstUser, 0)).map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }))
}

// Subconjunto del SDK que se usa; GoogleGenAI lo satisface y los tests inyectan un doble.
export interface GeminiRequest {
  model: string
  contents: Content[]
  config: {
    systemInstruction: string
    maxOutputTokens: number
    temperature: number
    abortSignal: AbortSignal
  }
}

export type GeminiResponse = Pick<GenerateContentResponse, 'text'>

export interface GeminiClient {
  models: { generateContent(request: GeminiRequest): Promise<GeminiResponse> }
}

export interface GenerateOptions {
  createClient?: (apiKey: string) => GeminiClient | Promise<GeminiClient>
  timeoutMs?: number
}

const defaultCreateClient = async (apiKey: string): Promise<GeminiClient> => {
  const { GoogleGenAI } = await import('@google/genai')
  return new GoogleGenAI({ apiKey })
}

export async function generateWithGemini(
  { apiKey, model, systemInstruction, messages }: GenerateParams,
  { createClient = defaultCreateClient, timeoutMs = TIMEOUT_MS }: GenerateOptions = {},
): Promise<string> {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      reject(new Error('TIMEOUT'))
    }, timeoutMs)
  })

  try {
    const call = (async () => {
      const client = await createClient(apiKey)
      return client.models.generateContent({
        model,
        contents: toContents(messages),
        config: {
          systemInstruction,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
          temperature: TEMPERATURE,
          abortSignal: controller.signal,
        },
      })
    })()
    call.catch(() => {}) // evita rechazo no manejado si gana el timeout
    const response = await Promise.race([call, timeout])
    return response.text ?? ''
  } finally {
    clearTimeout(timer)
    timeout.catch(() => {})
  }
}
