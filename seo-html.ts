// Inyecta metadatos por ruta en el index.html base (lo usa seoRoutesPlugin en vite.config.ts).
export const escapeAttr = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Los reemplazos usan función para que $&, $1, etc. en título/descripción/URL no se interpreten.
export interface SeoMetaInput {
  title: string
  description: string
  url: string
}

export function applySeoMeta(baseHtml: string, { title, description, url }: SeoMetaInput): string {
  const t = escapeAttr(title)
  const d = escapeAttr(description)
  return baseHtml
    .replace(/<title>[^<]*<\/title>/, () => `<title>${t}</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, (_match: string, head: string) => `${head}${d}"`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, (_match: string, head: string) => `${head}${url}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, (_match: string, head: string) => `${head}${t}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, (_match: string, head: string) => `${head}${d}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, (_match: string, head: string) => `${head}${url}"`)
    .replace(/(<meta name="twitter:title" content=")[^"]*"/, (_match: string, head: string) => `${head}${t}"`)
    .replace(/(<meta name="twitter:description" content=")[^"]*"/, (_match: string, head: string) => `${head}${d}"`)
}
