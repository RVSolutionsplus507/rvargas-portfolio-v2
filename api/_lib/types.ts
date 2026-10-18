// Contrato de POST /api/chat y tipos compartidos entre los módulos de api/_lib (solo tipos: sin código en runtime).
import type { IncomingHttpHeaders } from 'node:http'

export type ChatLang = 'es' | 'en'
export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatRequestBody {
  messages: ChatMessage[]
  lang: ChatLang
}

export type ErrorCode =
  | 'INVALID_REQUEST'
  | 'FORBIDDEN_ORIGIN'
  | 'RATE_LIMITED'
  | 'UPSTREAM_ERROR'
  | 'NOT_CONFIGURED'
  | 'METHOD_NOT_ALLOWED'
  | 'PAYLOAD_TOO_LARGE'

export type ChatResponseBody = { reply: string } | { error: ErrorCode }

export type ChatEnv = Readonly<Record<string, string | undefined>>

// Forma mínima que el handler usa de IncomingMessage / ServerResponse (los satisfacen tal cual,
// también los de Vercel y los de Connect en Vite; los tests pasan dobles sin casts).
export interface ChatRequest extends AsyncIterable<Uint8Array> {
  readonly method?: string
  readonly headers: IncomingHttpHeaders
}

export interface ChatResponse {
  statusCode: number
  readonly headersSent?: boolean
  setHeader(name: string, value: string | number): unknown
  end(chunk?: string): unknown
}

export interface GenerateParams {
  apiKey: string
  model: string
  systemInstruction: string
  messages: readonly ChatMessage[]
}

export type GenerateFn = (params: GenerateParams) => Promise<string>

export type ChatHandler = (req: ChatRequest, res: ChatResponse) => Promise<void>
