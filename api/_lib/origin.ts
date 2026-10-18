// Control de origen. Limitación: Origin/Referer solo frenan a sitios de terceros
// que llamen desde un navegador; un cliente no-navegador (curl, scripts) puede
// falsificar la cabecera. El control real contra abuso es el límite de tasa.
// En preview (VERCEL_ENV=preview) también se acepta http://localhost y 127.0.0.1: cualquier
// página local de un tercero podría llamar al preview desde su navegador. Por eso el preview
// debe usar una GEMINI_API_KEY propia con cuota baja y/o Deployment Protection (ver .env.example).

import type { IncomingHttpHeaders } from 'node:http'
import type { ChatEnv } from './types.ts'

const DEFAULT_ORIGINS = ['https://rvargas.dev', 'https://www.rvargas.dev']
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1'])

// En Vercel NODE_ENV es 'production' también en preview: VERCEL_ENV manda si existe
const isProduction = (env: ChatEnv): boolean =>
  env.VERCEL_ENV ? env.VERCEL_ENV === 'production' : env.NODE_ENV === 'production'

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

export function isOriginAllowed(headers: Pick<IncomingHttpHeaders, 'origin' | 'referer'>, env: ChatEnv): boolean {
  // Si viene Origin se usa solo ese; Referer solo cuando Origin no existe
  const raw = headers.origin !== undefined && headers.origin !== '' ? headers.origin : headers.referer
  if (typeof raw !== 'string') return false
  const origin = toOrigin(raw)
  if (!origin) return false

  if (allowedOrigins(env).includes(origin)) return true

  if (!isProduction(env)) {
    const url = new URL(origin)
    return url.protocol === 'http:' && LOCAL_HOSTS.has(url.hostname)
  }
  return false
}
