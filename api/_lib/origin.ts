// Control de origen. Limitación: Origin/Referer solo frenan a sitios de terceros
// que llamen desde un navegador; un cliente no-navegador (curl, scripts) puede
// falsificar la cabecera. El control real contra abuso es el límite de tasa.
// Se acepta el propio origen de la petición (dominio, *.pages.dev de producción y previews,
// localhost en `pnpm run dev`): en Cloudflare solo llegan aquí los hosts asociados al proyecto.

import type { ChatEnv } from './types.ts'

const DEFAULT_ORIGINS = ['https://rvargas.dev', 'https://www.rvargas.dev']

const toOrigin = (value: string): string | null => {
  try {
    const url = new URL(value)
    return url.origin === 'null' ? null : url.origin
  } catch {
    return null
  }
}

const allowedOrigins = (env: ChatEnv): string[] => {
  const configured = String(env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((entry) => toOrigin(entry.trim()))
    .filter((origin): origin is string => origin !== null)
  return configured.length > 0 ? configured : DEFAULT_ORIGINS
}

export function isOriginAllowed(request: Request, env: ChatEnv): boolean {
  // Si viene Origin se usa solo ese; Referer solo cuando Origin no existe
  const raw = request.headers.get('origin') || request.headers.get('referer')
  if (!raw) return false
  const origin = toOrigin(raw)
  if (!origin) return false
  return origin === toOrigin(request.url) || allowedOrigins(env).includes(origin)
}
