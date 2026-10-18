import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { DEFAULT_LANG, SEO_ROUTES, routeUrl } from './src/seo-routes.ts'
import { generateWithGemini } from './api/_lib/gemini.ts'
import { createHandler } from './api/_lib/handler.ts'
import { applySeoMeta } from './seo-html.ts'

// Genera dist/<ruta>/index.html con metadatos propios para crawlers que no ejecutan JS.
const seoRoutesPlugin = (): Plugin => {
  let outDir = 'dist'
  return {
    name: 'seo-routes-html',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const baseHtml = readFileSync(path.join(outDir, 'index.html'), 'utf-8')
      for (const [route, langs] of Object.entries(SEO_ROUTES)) {
        const { title, description } = langs[DEFAULT_LANG]
        const url = routeUrl(route)
        const html = applySeoMeta(baseHtml, { title, description, url })
        mkdirSync(path.join(outDir, route), { recursive: true })
        writeFileSync(path.join(outDir, route, 'index.html'), html)
      }
    },
  }
}

// Solo en `vite` (serve): monta /api/chat con el mismo handler que Vercel. Las variables del servidor
// (GEMINI_*, ALLOWED_ORIGINS) se pasan al handler y no se exponen al cliente (no llevan prefijo VITE_).
const chatApiDevPlugin = (): Plugin => ({
  name: 'chat-api-dev',
  apply: 'serve',
  configureServer(server) {
    const loaded = loadEnv(server.config.mode, process.cwd(), '')
    const env: Record<string, string | undefined> = { NODE_ENV: process.env.NODE_ENV }
    for (const [key, value] of Object.entries(loaded)) {
      if (key.startsWith('GEMINI_') || key === 'ALLOWED_ORIGINS') env[key] = value
    }
    const handler = createHandler({ generate: generateWithGemini, env })

    server.middlewares.use((req, res, next) => {
      if (new URL(req.url ?? '', 'http://localhost').pathname !== '/api/chat') return next()
      // En local no hay proxy que ponga la IP del cliente. Se fijan con = (no ??=) las dos cabeceras de
      // mayor confianza de getClientIp para que el cliente no pueda falsearlas en desarrollo
      req.headers['x-vercel-forwarded-for'] = req.socket.remoteAddress
      req.headers['x-real-ip'] = req.socket.remoteAddress
      handler(req, res)
    })
  },
})

export default defineConfig({
  plugins: [react(), tailwindcss(), seoRoutesPlugin(), chatApiDevPlugin()],
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
  resolve: { tsconfigPaths: true },
})
