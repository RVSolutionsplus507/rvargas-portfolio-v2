import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { registerHooks } from 'node:module'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// portfolio.ts importa imágenes con el alias "@/" (las resuelve Vite). Aquí se resuelve el alias y cada
// imagen se sustituye por su URL, para poder cargar el módulo real sin bundler.
const SRC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ASSET_EXTENSION = /\.(svg|png|jpe?g|webp|gif|avif)$/

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      return nextResolve(pathToFileURL(path.join(SRC_DIR, specifier.slice(2))).href, context)
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (ASSET_EXTENSION.test(url)) {
      return { format: 'module', shortCircuit: true, source: `export default ${JSON.stringify(url)};` }
    }
    return nextLoad(url, context)
  },
})

const { TECHS, LAYERS, PROJECTS, OTHER_PROJECTS, getProjectTechs, localized } = await import('./portfolio.ts')

const duplicates = (values: readonly string[]): string[] => values.filter((value, index) => values.indexOf(value) !== index)

test('cada tecnología tiene un icono monocromo (nunca una etiqueta de texto sola)', () => {
  const missing = TECHS.filter((tech) => typeof tech.icon !== 'function').map((tech) => tech.id)
  assert.deepEqual(missing, [])
})

test('los ids de tecnologías y los slugs de proyectos no se repiten', () => {
  assert.deepEqual(duplicates(TECHS.map((tech) => tech.id)), [])
  const projects = [...PROJECTS, ...OTHER_PROJECTS]
  assert.deepEqual(duplicates(projects.map((project) => project.id)), [])
  assert.deepEqual(duplicates(projects.map((project) => project.slug)), [])
})

test('cada tecnología pertenece a una capa existente', () => {
  const layerIds = new Set<string>(LAYERS.map((layer) => layer.id))
  assert.deepEqual(TECHS.filter((tech) => !layerIds.has(tech.layer)).map((tech) => tech.id), [])
})

test('las tecnologías solo referencian proyectos destacados existentes', () => {
  const projectIds = new Set<string>(PROJECTS.map((project) => project.id))
  const broken = TECHS.flatMap((tech) => tech.projects.filter((id) => !projectIds.has(id)).map((id) => `${tech.id}->${id}`))
  assert.deepEqual(broken, [])
})

test('los proyectos del índice solo referencian tecnologías existentes', () => {
  const techIds = new Set<string>(TECHS.map((tech) => tech.id))
  const broken = OTHER_PROJECTS.flatMap((project) =>
    project.techs.filter((id) => !techIds.has(id)).map((id) => `${project.id}->${id}`)
  )
  assert.deepEqual(broken, [])
})

// --- Proyectos: contenido de las fichas ---

const ALL_PROJECTS = [...PROJECTS, ...OTHER_PROJECTS]
const MAX_IMAGE_BYTES = 220 * 1024
const LANGS = ['es', 'en'] as const

// Todo el texto público de una ficha (tarjeta y detalle) en ambos idiomas; `internalOf` queda fuera: solo se ve en el detalle
const publicTexts = (project: (typeof ALL_PROJECTS)[number]): string[] =>
  LANGS.flatMap((lang) => [
    localized(project.name, lang),
    localized(project.kind, lang),
    localized(project.line, lang),
    localized(project.what, lang),
    ...project.how.map((step) => localized(step, lang)),
    ...project.images.map((image) => localized(image.alt, lang)),
  ])

const FORBIDDEN_METRICS = /test|prueba|e2e|cobertura|coverage|punta a punta|\d{4}-\d{2}-\d{2}/i
const FORBIDDEN_CLIENTS = /shelter|semah|mauad|sbm|almacenajes|arbolito|documenta/i

test('todo proyecto tiene qué hace, cómo funciona y tecnologías válidas', () => {
  const incomplete = ALL_PROJECTS.filter((project) => {
    const whatOk = LANGS.every((lang) => localized(project.what, lang).trim().length > 0)
    const howOk = project.how.length >= 3 && project.how.length <= 5
    const howTexts = project.how.every((step) => LANGS.every((lang) => localized(step, lang).trim().length > 0))
    return !(whatOk && howOk && howTexts && getProjectTechs(project).length > 0)
  }).map((project) => project.id)
  assert.deepEqual(incomplete, [])
})

test('las fichas de proyectos no llevan métricas de calidad, fechas ni nombres de clientes', () => {
  const offenders = ALL_PROJECTS.flatMap((project) =>
    publicTexts(project)
      .filter((text) => FORBIDDEN_METRICS.test(text) || FORBIDDEN_CLIENTS.test(text))
      .map((text) => `${project.id}: ${text}`)
  )
  assert.deepEqual(offenders, [])
})

test('RVDesk no menciona pagos (no tiene pasarela)', () => {
  const rvdesk = PROJECTS.find((project) => project.slug === 'rvdesk')
  assert.ok(rvdesk)
  assert.deepEqual(publicTexts(rvdesk).filter((text) => /pago|payment|pasarela|gateway/i.test(text)), [])
})

test('solo RVDesk y Conectando+ son SaaS en vivo; Haus 360 y Ponline son internos, sin URL', () => {
  const access = Object.fromEntries(PROJECTS.map((project) => [project.slug, project.access]))
  assert.deepEqual(access, { rvdesk: 'live', conectando: 'live', 'haus-360': 'internal', ponline: 'internal' })
  for (const project of PROJECTS) {
    if (project.access === 'live') assert.match(project.url ?? '', /^https:\/\//)
    else {
      assert.equal(project.url, undefined)
      assert.ok(project.internalOf)
    }
  }
  assert.equal(OTHER_PROJECTS.filter((project) => project.url).length, 0)
})

test('cada proyecto tiene capturas, logo o icono para su tarjeta', () => {
  const bare = ALL_PROJECTS.filter((project) => project.images.length === 0 && !project.icon && !project.logo)
  assert.deepEqual(bare.map((project) => project.id), [])
})

test('las imágenes existen, pesan menos de 220 KB y llevan alt ES/EN y dimensiones', () => {
  const problems: string[] = []
  for (const project of ALL_PROJECTS) {
    const files = [...project.images.map((image) => image.src), ...(project.logo ? [project.logo.src] : [])]
    for (const src of files) {
      const file = fileURLToPath(src)
      if (!fs.existsSync(file)) problems.push(`${project.id}: falta ${file}`)
      else if (fs.statSync(file).size > MAX_IMAGE_BYTES) problems.push(`${project.id}: ${file} pesa de más`)
    }
    for (const image of project.images) {
      if (!(image.width > 0 && image.height > 0)) problems.push(`${project.id}: sin dimensiones ${image.src}`)
      if (LANGS.some((lang) => localized(image.alt, lang).trim() === '')) problems.push(`${project.id}: alt vacío ${image.src}`)
    }
  }
  assert.deepEqual(problems, [])
})

test('el bento completa filas exactas: 12 columnas en escritorio y 6 en tableta', () => {
  const rowSums = (columns: readonly number[], size: number): number[] => {
    const sums: number[] = []
    let current = 0
    for (const span of columns) {
      if (current + span > size) {
        sums.push(current)
        current = 0
      }
      current += span
    }
    sums.push(current)
    return sums
  }
  assert.deepEqual(rowSums(ALL_PROJECTS.map((project) => project.bento.lg), 12).filter((sum) => sum !== 12), [])
  assert.deepEqual(rowSums(ALL_PROJECTS.map((project) => project.bento.md), 6).filter((sum) => sum !== 6), [])
})

test('las herramientas de prueba solo viven en la capa de herramientas, sin asociarse a proyectos', () => {
  const testing = TECHS.filter((tech) => ['vitest', 'jest'].includes(tech.id))
  assert.equal(testing.length, 2)
  assert.deepEqual(testing.filter((tech) => tech.layer !== 'tools' || tech.projects.length > 0).map((tech) => tech.id), [])
})

test('los enlaces de un proyecto son https, únicos y solo sitios-astro los declara', () => {
  const withLinks = ALL_PROJECTS.filter((project) => project.links)
  assert.deepEqual(withLinks.map((project) => project.slug), ['sitios-astro'])
  const urls = withLinks.flatMap((project) => project.links?.map((link) => link.url) ?? [])
  assert.equal(urls.length, 3)
  assert.equal(new Set(urls).size, urls.length)
  for (const url of urls) assert.match(url, /^https:\/\/[a-z0-9.-]+$/)
})
