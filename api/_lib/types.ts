// Contrato de POST /api/chat y tipos compartidos entre los módulos de api/_lib (solo tipos: sin código en runtime).

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

// Variables del servidor: context.env en Cloudflare Pages, .env en `pnpm run dev`
export interface ChatEnv {
  readonly GEMINI_API_KEY?: string
  readonly GEMINI_MODEL?: string
  readonly GEMINI_DAILY_CAP?: string
  readonly ALLOWED_ORIGINS?: string
  // Hostnames servidos (minúsculas, separados por comas); vacío = sin restricción
  readonly ALLOWED_HOSTS?: string
}

export interface GenerateParams {
  apiKey: string
  model: string
  systemInstruction: string
  messages: readonly ChatMessage[]
}

export type GenerateFn = (params: GenerateParams) => Promise<string>

// Web estándar: la misma función corre en Cloudflare Pages y en el middleware de Vite
export type ChatHandler = (request: Request) => Promise<Response>
