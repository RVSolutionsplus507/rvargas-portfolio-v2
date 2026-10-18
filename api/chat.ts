// Función serverless de Vercel (Node, ESM): POST /api/chat. La lógica vive en api/_lib/
// (los archivos con prefijo _ no se despliegan como rutas).
import { generateWithGemini } from './_lib/gemini.ts'
import { createHandler } from './_lib/handler.ts'

export default createHandler({ generate: generateWithGemini })
