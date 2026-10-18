// Pages Function de Cloudflare: /api/chat. La lógica vive en api/_lib/ (la misma que sirve `pnpm run dev`).
import { generateWithGemini } from '../../api/_lib/gemini.ts'
import { createHandler } from '../../api/_lib/handler.ts'
import type { ChatEnv, ChatHandler } from '../../api/_lib/types.ts'

// Subconjunto del EventContext de Pages que se usa (sin @cloudflare/workers-types)
interface PagesContext {
  request: Request
  env: ChatEnv
}

// El env solo llega con cada petición; el handler y su límite en memoria duran lo que dure el isolate
let handler: ChatHandler | undefined

// onRequest y no onRequestPost: con onRequestPost, GET cae al HTML estático (404) y el resto recibe
// un 405 de Pages sin Allow. Así el handler responde 405 JSON con Allow: POST a todo método no POST.
export const onRequest = (context: PagesContext): Promise<Response> => {
  handler ??= createHandler({ generate: generateWithGemini, env: context.env })
  return handler(context.request)
}
