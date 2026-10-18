import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { applySeoMeta, escapeAttr } from './seo-html.ts'
import { SEO_ROUTES } from './src/seo-routes.ts'

const base = [
  '<title>Base</title>',
  '<meta name="description" content="base">',
  '<link rel="canonical" href="https://x.test/">',
  '<meta property="og:title" content="base">',
  '<meta property="og:description" content="base">',
  '<meta property="og:url" content="https://x.test/">',
  '<meta name="twitter:title" content="base">',
  '<meta name="twitter:description" content="base">',
].join('\n')

test('escapeAttr escapes & " < and >', () => {
  assert.equal(escapeAttr('a & "b" <c>'), 'a &amp; &quot;b&quot; &lt;c&gt;')
})

test('applySeoMeta fills title, description and url in every tag', () => {
  const html = applySeoMeta(base, { title: 'T', description: 'D', url: 'https://x.test/p' })
  assert.ok(html.includes('<title>T</title>'))
  assert.equal((html.match(/content="D"/g) ?? []).length, 3)
  assert.ok(html.includes('<link rel="canonical" href="https://x.test/p">'))
  assert.ok(html.includes('<meta property="og:url" content="https://x.test/p">'))
})

test('applySeoMeta treats $ patterns literally and escapes angle brackets', () => {
  const html = applySeoMeta(base, { title: 'Cost $& $1 <b>', description: 'D', url: 'https://x.test/$&' })
  assert.ok(html.includes('<title>Cost $&amp; $1 &lt;b&gt;</title>'))
  assert.ok(html.includes('href="https://x.test/$&"'))
  assert.equal(html.includes('<b>'), false)
})

test('el copy SEO y el manifest no arrastran el posicionamiento anterior', () => {
  const manifest = fs.readFileSync(new URL('./public/manifest.webmanifest', import.meta.url), 'utf8')
  const copy = JSON.stringify(SEO_ROUTES) + manifest
  assert.doesNotMatch(copy, /proof points|pruebas públicas|Desarrollador Full Stack|Full Stack Developer/i)
  assert.match(manifest, /Arquitecto de Soluciones Tecnológicas/)
})
