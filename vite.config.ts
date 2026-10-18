import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { DEFAULT_LANG, SEO_ROUTES, routeUrl } from './src/seo-routes.ts'
import { generateWithGemini } from './api/_lib/gemini.ts'
import { createHandler } from './api/_lib/handler.ts'
import { applySeoMeta } from './seo-html.ts'

// Genera dist/<ruta>.html con metadatos propios para crawlers que no ejecutan JS. Cloudflare Pages sirve
// /aboutme desde aboutme.html (aboutme/index.html lo redirigiría a /aboutme/ y no coincidiría con el canonical).
// 404.html hace que Pages responda 404 real a rutas inexistentes (sin él, fallback SPA con 200);
// por eso cada ruta del router debe estar en SEO_ROUTES.
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
        writeFileSync(path.join(outDir, `${route}.html`), html)
      }
      // Sin canonical (apuntaría a /aboutme) y fuera de los buscadores
      const notFound = baseHtml
        .replace(/\s*<link rel="canonical"[^>]*>/, '')
        .replace(/(<meta name="robots" content=")[^"]*"/, '$1noindex"')
      writeFileSync(path.join(outDir, '404.html'), notFound)
    },
  }
}

const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])

// Solo en `vite` (serve): monta /api/chat con el mismo handler que la Pages Function. Las variables del servidor
// (GEMINI_*, ALLOWED_ORIGINS) se pasan al handler y no se exponen al cliente (no llevan prefijo VITE_).
const chatApiDevPlugin = (): Plugin => ({
  name: 'chat-api-dev',
  apply: 'serve',
  configureServer(server) {
    const env = loadEnv(server.config.mode, process.cwd(), ['GEMINI_', 'ALLOWED_'])
    const handler = createHandler({ generate: generateWithGemini, env })

    server.middlewares.use((req, res, next) => {
      const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
      if (url.pathname !== '/api/chat') return next()

      // Con --host la clave no debe quedar al alcance de la LAN
      if (!LOOPBACK.has(req.socket.remoteAddress ?? '')) {
        res.statusCode = 403
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        return res.end(JSON.stringify({ error: 'FORBIDDEN_ORIGIN' }))
      }

      const headers = new Headers()
      for (const [name, value] of Object.entries(req.headers)) {
        if (typeof value === 'string') headers.set(name, value)
        else value?.forEach((item) => headers.append(name, item))
      }
      // En local no hay Cloudflare: se fija la IP del socket y se pisa cualquier cf-connecting-ip del cliente
      headers.set('cf-connecting-ip', req.socket.remoteAddress ?? '')
      const hasBody = req.method !== 'GET' && req.method !== 'HEAD'

      Promise.resolve()
        .then(() => handler(new Request(url, { method: req.method, headers, body: hasBody ? req : undefined, duplex: 'half' })))
        .then(async (response) => {
          res.statusCode = response.status
          response.headers.forEach((value, name) => res.setHeader(name, value))
          res.end(await response.text())
        })
        .catch(next)
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
