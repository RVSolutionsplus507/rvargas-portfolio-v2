import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSystemInstruction } from './prompt.ts'

const langs = ['es', 'en']

test('both prompts are non-trivial and differ by language', () => {
  const es = buildSystemInstruction('es')
  const en = buildSystemInstruction('en')
  assert.ok(es.length > 1500)
  assert.ok(en.length > 1500)
  assert.notEqual(es, en)
})

test('unknown language falls back to Spanish', () => {
  assert.equal(buildSystemInstruction('fr'), buildSystemInstruction('es'))
})

test('both prompts carry the contact destinations and the verified projects', () => {
  for (const lang of langs) {
    const prompt = buildSystemInstruction(lang)
    for (const needle of ['/contact', 'https://wa.me/50761083193', 'Ambar', 'RVDesk', 'Haus 360', 'Ponline', 'Conectando+']) {
      assert.ok(prompt.includes(needle), `${lang}: ${needle}`)
    }
  }
})

test('prompts exclude claims that are not backed by the verified sheet', () => {
  const banned = [/7\+/, /mongo/i, /fintech/i, /salud/i, /health/i, /gobierno/i, /government/i, /gemini/i, /google/i, /openrouter/i, /almacenajes/i, /semusa/i]
  for (const lang of langs) {
    const prompt = buildSystemInstruction(lang)
    for (const pattern of banned) assert.equal(pattern.test(prompt), false, `${lang}: ${pattern}`)
  }
})

test('prompts keep the rules separate from the context data block', () => {
  for (const lang of langs) {
    const prompt = buildSystemInstruction(lang)
    const rulesAt = prompt.search(/RULES|REGLAS/)
    const dataAt = prompt.search(/CONTEXT DATA|DATOS DE CONTEXTO/)
    assert.ok(rulesAt >= 0 && dataAt >= 0 && rulesAt !== dataAt)
  }
})

test('both prompts carry the new positioning and the integrations the business may already use', () => {
  assert.ok(buildSystemInstruction('es').includes('Arquitecto de Soluciones Tecnológicas'))
  assert.ok(buildSystemInstruction('en').includes('Technology Solutions Architect'))
  for (const lang of langs) {
    const prompt = buildSystemInstruction(lang)
    for (const needle of ['https://rvdesk.app', 'https://conectando-mas.com', 'Zoho', 'QuickBooks', 'Xero', 'SAP', 'ERP']) {
      assert.ok(prompt.includes(needle), `${lang}: ${needle}`)
    }
  }
})

test('prompts drop the old positioning, dates, test figures and any model provider name', () => {
  const banned = [
    /consultor/i,
    /consultant/i,
    /punta a punta/i,
    /end-to-end/i,
    /\b(19|20)\d{2}\b/,
    /\d[\d.,]*\s*(tests?|pruebas|casos|cases|archivos|files)\b/i,
    /\b(184|12[.,]687|1[.,]041|1[.,]577)\b/,
    /gemini|google|openrouter|openai|anthropic|claude|gpt|\bllama\b|mistral/i,
    /cero any|zero any/i,
  ]
  for (const lang of langs) {
    const prompt = buildSystemInstruction(lang)
    for (const pattern of banned) assert.equal(pattern.test(prompt), false, `${lang}: ${pattern}`)
  }
})

test('RVDesk is described without a payments gateway', () => {
  for (const lang of langs) {
    const line = buildSystemInstruction(lang)
      .split('\n')
      .find((row) => row.includes('RVDesk (https://rvdesk.app)'))
    assert.ok(line, `${lang}: RVDesk line`)
    assert.equal(/pago|payment|pasarela|gateway/i.test(line), false, `${lang}: payments in RVDesk`)
  }
})

test('prompts ask for a natural conversation with follow-up questions and no option lists', () => {
  assert.ok(/pregunta de seguimiento/i.test(buildSystemInstruction('es')))
  assert.ok(/follow-up question/i.test(buildSystemInstruction('en')))
  assert.ok(/120/.test(buildSystemInstruction('es')) && /120/.test(buildSystemInstruction('en')))
})

test('prompts tell her to say "can connect to" instead of claiming experience with every brand', () => {
  assert.ok(/puede conectarse a/i.test(buildSystemInstruction('es')))
  assert.ok(/can connect to/i.test(buildSystemInstruction('en')))
})
