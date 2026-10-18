import test from 'node:test'
import assert from 'node:assert/strict'
import type { ChatRequest } from './types.ts'
import { MAX_BODY_BYTES, isJsonContentType, readBody, validateChatBody } from './validation.ts'

const valid = () => ({
  messages: [{ role: 'user', content: 'Hola' }],
  lang: 'es',
})

test('accepts a minimal valid body and trims content', () => {
  const result = validateChatBody({ ...valid(), messages: [{ role: 'user', content: '   Hola   ' }] })
  assert.equal(result.ok, true)
  assert.deepEqual(result.data, { messages: [{ role: 'user', content: 'Hola' }], lang: 'es' })
})

test('accepts up to 8 alternating messages ending with user', () => {
  const messages = Array.from({ length: 8 }, (_, i) => ({
    role: i % 2 === 0 ? 'assistant' : 'user',
    content: `m${i}`,
  }))
  assert.equal(validateChatBody({ messages, lang: 'en' }).ok, true)
})

test('rejects non-object bodies', () => {
  for (const value of [null, undefined, [], 'text', 42, true]) {
    assert.equal(validateChatBody(value).ok, false)
  }
})

test('rejects extra or missing top-level keys', () => {
  assert.equal(validateChatBody({ ...valid(), extra: 1 }).ok, false)
  assert.equal(validateChatBody({ messages: valid().messages }).ok, false)
  assert.equal(validateChatBody({ lang: 'es' }).ok, false)
})

test('rejects a __proto__ own key (prototype pollution probe)', () => {
  const body = JSON.parse('{"messages":[{"role":"user","content":"x"}],"lang":"es","__proto__":{"a":1}}')
  assert.equal(validateChatBody(body).ok, false)
})

test('rejects invalid lang', () => {
  for (const lang of ['fr', 'ES', '', null, 1]) {
    assert.equal(validateChatBody({ ...valid(), lang }).ok, false)
  }
})

test('rejects messages that are not a 1..8 array', () => {
  assert.equal(validateChatBody({ ...valid(), messages: [] }).ok, false)
  assert.equal(validateChatBody({ ...valid(), messages: 'hola' }).ok, false)
  assert.equal(validateChatBody({ ...valid(), messages: {} }).ok, false)
  const nine = Array.from({ length: 9 }, () => ({ role: 'user', content: 'x' }))
  assert.equal(validateChatBody({ ...valid(), messages: nine }).ok, false)
})

test('rejects bad message shape and roles', () => {
  const cases = [
    [{ role: 'system', content: 'x' }],
    [{ role: 'model', content: 'x' }],
    [{ role: 'user' }],
    [{ content: 'x' }],
    [{ role: 'user', content: 'x', extra: true }],
    [{ role: 'user', content: 123 }],
    [{ role: 'user', content: ['x'] }],
    [null],
    ['x'],
  ]
  for (const messages of cases) {
    assert.equal(validateChatBody({ ...valid(), messages }).ok, false)
  }
})

test('rejects an unknown role even when the last message is from the user', () => {
  for (const role of ['system', 'model', 'USER', '']) {
    const messages = [
      { role, content: 'x' },
      { role: 'user', content: 'hola' },
    ]
    assert.equal(validateChatBody({ ...valid(), messages }).ok, false, role)
  }
})

test('enforces content length 1..500 after trim', () => {
  const build = (content: string) => ({ ...valid(), messages: [{ role: 'user', content }] })
  assert.equal(validateChatBody(build('')).ok, false)
  assert.equal(validateChatBody(build('   \n  ')).ok, false)
  assert.equal(validateChatBody(build('a'.repeat(500))).ok, true)
  assert.equal(validateChatBody(build('a'.repeat(501))).ok, false)
  assert.equal(validateChatBody(build(`  ${'a'.repeat(500)}  `)).ok, true)
})

test('rejects control characters but allows common whitespace', () => {
  const build = (content: string) => ({ ...valid(), messages: [{ role: 'user', content }] })
  for (const bad of ['a\u0000b', 'a\u0007b', 'a\u001bb', 'a\u007fb', 'a\u0085b', 'a\u009fb']) {
    assert.equal(validateChatBody(build(bad)).ok, false)
  }
  assert.equal(validateChatBody(build('linea 1\nlinea 2\tok')).ok, true)
})

test('enforces the 2000 character total', () => {
  const four = [
    { role: 'assistant', content: 'a'.repeat(500) },
    { role: 'user', content: 'b'.repeat(500) },
    { role: 'assistant', content: 'c'.repeat(500) },
    { role: 'user', content: 'd'.repeat(500) },
  ]
  // 2000 exactos: pasa
  assert.equal(validateChatBody({ ...valid(), messages: four }).ok, true)
  // 2001: falla
  const five = [...four, { role: 'user', content: 'e' }]
  assert.equal(validateChatBody({ ...valid(), messages: five }).ok, false)
})

test('requires the last message to be from the user', () => {
  const messages = [
    { role: 'user', content: 'hola' },
    { role: 'assistant', content: 'hola, soy Ambar' },
  ]
  assert.equal(validateChatBody({ ...valid(), messages }).ok, false)
})

test('failure result carries no echo of the input', () => {
  const secret = 'SECRET-PAYLOAD-123'
  const result = validateChatBody({ messages: [{ role: 'system', content: secret }], lang: 'es' })
  assert.equal(result.ok, false)
  assert.equal(JSON.stringify(result).includes(secret), false)
})

test('isJsonContentType accepts application/json with optional charset only', () => {
  assert.equal(isJsonContentType('application/json'), true)
  assert.equal(isJsonContentType('Application/JSON; charset=utf-8'), true)
  assert.equal(isJsonContentType('text/plain'), false)
  assert.equal(isJsonContentType('application/x-www-form-urlencoded'), false)
  assert.equal(isJsonContentType('application/jsonp'), false)
  assert.equal(isJsonContentType(undefined), false)
  assert.equal(isJsonContentType(''), false)
})

const fakeReq = (chunks: string[], headers: Record<string, string> = {}): ChatRequest => ({
  headers,
  async *[Symbol.asyncIterator]() {
    for (const chunk of chunks) yield Buffer.from(chunk)
  },
})

test('readBody returns the text when under the cap', async () => {
  const result = await readBody(fakeReq(['{"a":', '1}']))
  assert.deepEqual(result, { ok: true, text: '{"a":1}' })
})

test('readBody flags bodies over the cap while streaming', async () => {
  const big = 'x'.repeat(MAX_BODY_BYTES)
  const result = await readBody(fakeReq([big, 'y']))
  assert.deepEqual(result, { ok: false })
})

test('readBody counts bytes, not characters', async () => {
  const text = 'ñ'.repeat(MAX_BODY_BYTES / 2 + 1)
  assert.deepEqual(await readBody(fakeReq([text])), { ok: false })
})

test('readBody rejects early when content-length exceeds the cap', async () => {
  let consumed = false
  const req = {
    headers: { 'content-length': String(MAX_BODY_BYTES + 1) },
    async *[Symbol.asyncIterator]() {
      consumed = true
      yield Buffer.from('x')
    },
  }
  assert.deepEqual(await readBody(req), { ok: false })
  assert.equal(consumed, false)
})
