import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_MODEL, createHandler } from './handler.ts'
import { createRateLimiter } from './rate-limit.ts'
import type { RateLimiter } from './rate-limit.ts'
import type { ChatEnv, ChatHandler, GenerateFn, GenerateParams } from './types.ts'

const NOW = Date.UTC(2026, 9, 17, 12, 0, 0)
const API_KEY = 'AIza-test-key-should-never-leak'

const baseEnv: ChatEnv = { GEMINI_API_KEY: API_KEY }
const goodBody = { messages: [{ role: 'user', content: 'Hola, ¿qué proyectos tienes?' }], lang: 'es' }

interface ReqOptions {
  method?: string
  url?: string
  headers?: Record<string, string | undefined>
  body?: unknown
}

const fakeReq = ({ method = 'POST', url = 'https://rvargas.dev/api/chat', headers = {}, body }: ReqOptions = {}): Request => {
  const raw = body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body)
  const h = new Headers()
  const all = { origin: 'https://rvargas.dev', 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.7', ...headers }
  for (const [name, value] of Object.entries(all)) if (value !== undefined) h.set(name, value)
  return new Request(url, { method, headers: h, body: raw })
}

const parse = (text: string): unknown => JSON.parse(text)

interface Overrides {
  generate?: GenerateFn
  env?: ChatEnv
  rateLimiter?: RateLimiter
}

const setup = (overrides: Overrides = {}) => {
  const calls: GenerateParams[] = []
  const logs: unknown[][] = []
  const generate: GenerateFn = overrides.generate ?? (async (args) => {
    calls.push(args)
    return '  Hola, soy Ambar.  '
  })
  const handler = createHandler({
    generate,
    now: () => NOW,
    env: overrides.env ?? baseEnv,
    rateLimiter: overrides.rateLimiter,
    log: (...args) => logs.push(args),
  })
  return { handler, calls, logs }
}

const callAt = (calls: GenerateParams[], index: number): GenerateParams => {
  const call = calls[index]
  assert.ok(call)
  return call
}

const run = async (handler: ChatHandler, reqOptions?: ReqOptions | Request) => {
  const res = await handler(reqOptions instanceof Request ? reqOptions : fakeReq(reqOptions))
  const body = await res.text()
  return { statusCode: res.status, headers: Object.fromEntries(res.headers), body, json: () => parse(body) }
}

test('happy path returns 200 { reply } and calls the model with separated system instruction', async () => {
  const { handler, calls } = setup()
  const res = await run(handler, { body: goodBody })
  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.json(), { reply: 'Hola, soy Ambar.' })
  assert.equal(res.headers['content-type'], 'application/json; charset=utf-8')
  assert.equal(res.headers['cache-control'], 'no-store')
  assert.equal(calls.length, 1)
  assert.equal(callAt(calls, 0).apiKey, API_KEY)
  assert.equal(callAt(calls, 0).model, DEFAULT_MODEL)
  assert.equal(typeof callAt(calls, 0).systemInstruction, 'string')
  assert.ok(callAt(calls, 0).systemInstruction.length > 200)
  assert.deepEqual(callAt(calls, 0).messages, goodBody.messages)
})

test('GEMINI_MODEL overrides the default model', async () => {
  const { handler, calls } = setup({ env: { ...baseEnv, GEMINI_MODEL: 'gemini-test-model' } })
  await run(handler, { body: goodBody })
  assert.equal(callAt(calls, 0).model, 'gemini-test-model')
})

test('system instruction follows the requested language', async () => {
  const { handler, calls } = setup()
  await run(handler, { body: { ...goodBody, lang: 'en' } })
  await run(handler, { body: goodBody, headers: { 'cf-connecting-ip': '203.0.113.8' } })
  assert.notEqual(callAt(calls, 0).systemInstruction, callAt(calls, 1).systemInstruction)
})

test('non-POST methods get 405 with Allow header', async () => {
  const { handler, calls } = setup()
  for (const method of ['GET', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH']) {
    const res = await run(handler, { method })
    assert.equal(res.statusCode, 405, method)
    assert.deepEqual(res.json(), { error: 'METHOD_NOT_ALLOWED' })
    assert.equal(res.headers.allow, 'POST')
  }
  assert.equal(calls.length, 0)
})

test('foreign or missing origin gets 403 FORBIDDEN_ORIGIN and never reaches the model', async () => {
  const { handler, calls } = setup()
  const foreign = await run(handler, { body: goodBody, headers: { origin: 'https://evil.example' } })
  assert.equal(foreign.statusCode, 403)
  assert.deepEqual(foreign.json(), { error: 'FORBIDDEN_ORIGIN' })
  const missing = await run(handler, { body: goodBody, headers: { origin: undefined } })
  assert.equal(missing.statusCode, 403)
  assert.equal(calls.length, 0)
})

test('Referer from an allowed host is accepted when Origin is absent', async () => {
  const { handler } = setup()
  const res = await run(handler, {
    body: goodBody,
    headers: { origin: undefined, referer: 'https://rvargas.dev/projects' },
  })
  assert.equal(res.statusCode, 200)
})

test('wrong content type gets 400 INVALID_REQUEST', async () => {
  const { handler } = setup()
  const res = await run(handler, { body: goodBody, headers: { 'content-type': 'text/plain' } })
  assert.equal(res.statusCode, 400)
  assert.deepEqual(res.json(), { error: 'INVALID_REQUEST' })
})

test('malformed JSON and invalid payloads get 400 without echoing input', async () => {
  const { handler, calls } = setup()
  const secret = 'ECHO-CANARY-9931'
  const payloads = [
    '{not json ' + secret,
    JSON.stringify({ messages: [{ role: 'system', content: secret }], lang: 'es' }),
    JSON.stringify({ ...goodBody, extra: secret }),
    JSON.stringify({ messages: [{ role: 'assistant', content: secret }], lang: 'es' }),
    'null',
  ]
  for (const body of payloads) {
    const res = await run(handler, { body })
    assert.equal(res.statusCode, 400)
    assert.deepEqual(res.json(), { error: 'INVALID_REQUEST' })
    assert.equal(res.body.includes(secret), false)
  }
  assert.equal(calls.length, 0)
})

test('oversized body gets 413 PAYLOAD_TOO_LARGE', async () => {
  const { handler, calls } = setup()
  const res = await run(handler, { body: 'x'.repeat(9 * 1024) })
  assert.equal(res.statusCode, 413)
  assert.deepEqual(res.json(), { error: 'PAYLOAD_TOO_LARGE' })
  assert.equal(calls.length, 0)
})

test('the 8 KB cap is measured in bytes, also when streamed without content-length', async () => {
  const { handler, calls } = setup()
  // 3000 caracteres de 3 bytes: 9000 bytes, por debajo de 8 KB si se contaran caracteres
  const content = '€'.repeat(3000)
  const bytes = new TextEncoder().encode(JSON.stringify({ messages: [{ role: 'user', content }], lang: 'es' }))
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (let i = 0; i < bytes.length; i += 1000) controller.enqueue(bytes.slice(i, i + 1000))
      controller.close()
    },
  })
  const headers = { origin: 'https://rvargas.dev', 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.7' }
  const request = new Request('https://rvargas.dev/api/chat', { method: 'POST', headers, body, duplex: 'half' })
  const res = await run(handler, request)
  assert.equal(res.statusCode, 413)
  assert.equal(calls.length, 0)
})

test('a declared content-length over the cap gets 413 before reading the body', async () => {
  const { handler } = setup()
  const res = await run(handler, { body: goodBody, headers: { 'content-length': String(9 * 1024) } })
  assert.equal(res.statusCode, 413)
})

test('same-origin requests are allowed on any deployment host (Pages previews)', async () => {
  const { handler } = setup({ env: { ...baseEnv, ALLOWED_HOSTS: '*' } })
  const url = 'https://3f2a1b.rvs-portfolio.pages.dev/api/chat'
  const same = await run(handler, { url, body: goodBody, headers: { origin: 'https://3f2a1b.rvs-portfolio.pages.dev' } })
  assert.equal(same.statusCode, 200)
  const other = await run(handler, { url, body: goodBody, headers: { origin: 'https://evil.pages.dev' } })
  assert.equal(other.statusCode, 403)
})

test('the client IP comes only from cf-connecting-ip: spoofed forwarding headers do not reset the limit', async () => {
  const { handler } = setup()
  const statuses = []
  for (let i = 0; i < 9; i++) {
    const spoofed = { 'x-forwarded-for': `198.51.100.${i}`, 'x-real-ip': `192.0.2.${i}`, 'x-vercel-forwarded-for': `192.0.2.${i}` }
    statuses.push((await run(handler, { body: goodBody, headers: spoofed })).statusCode)
  }
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 200, 200, 200, 429])
})

test('missing GEMINI_API_KEY gets 503 NOT_CONFIGURED without details', async () => {
  const { handler, calls } = setup({ env: {} })
  const res = await run(handler, { body: goodBody })
  assert.equal(res.statusCode, 503)
  assert.deepEqual(res.json(), { error: 'NOT_CONFIGURED' })
  assert.equal(calls.length, 0)
})

test('validation errors take precedence over NOT_CONFIGURED', async () => {
  const { handler } = setup({ env: {} })
  const res = await run(handler, { body: '{}' })
  assert.equal(res.statusCode, 400)
})

test('upstream errors get a generic 502 and leak neither message nor key', async () => {
  const leak = `boom ${API_KEY} quota exceeded for project 12345`
  const { handler, logs } = setup({
    generate: async () => {
      throw Object.assign(new Error(leak), { status: 429 })
    },
  })
  const res = await run(handler, { body: goodBody })
  assert.equal(res.statusCode, 502)
  assert.deepEqual(res.json(), { error: 'UPSTREAM_ERROR' })
  assert.equal(res.body.includes('quota'), false)
  assert.equal(res.body.includes(API_KEY), false)
  const logged = JSON.stringify(logs)
  assert.equal(logged.includes(API_KEY), false)
  assert.equal(logged.includes('quota'), false)
  assert.equal(logged.includes('Hola'), false)
  assert.equal(logged.includes('203.0.113.7'), false)
  assert.ok(logged.includes('429'))
})

test('an empty model reply is treated as an upstream error', async () => {
  const { handler } = setup({ generate: async () => '   ' })
  const res = await run(handler, { body: goodBody })
  assert.equal(res.statusCode, 502)
  assert.deepEqual(res.json(), { error: 'UPSTREAM_ERROR' })
})

test('per-IP rate limit returns 429 RATE_LIMITED with Retry-After', async () => {
  const { handler, calls } = setup()
  for (let i = 0; i < 8; i++) assert.equal((await run(handler, { body: goodBody })).statusCode, 200)
  const res = await run(handler, { body: goodBody })
  assert.equal(res.statusCode, 429)
  assert.deepEqual(res.json(), { error: 'RATE_LIMITED' })
  assert.ok(Number(res.headers['retry-after']) >= 1)
  assert.equal(calls.length, 8)
  const other = await run(handler, { body: goodBody, headers: { 'cf-connecting-ip': '203.0.113.99' } })
  assert.equal(other.statusCode, 200)
})

test('invalid requests do not spend IP quota or create limiter entries', async () => {
  const rateLimiter = createRateLimiter()
  const { handler } = setup({ rateLimiter })
  for (let i = 0; i < 20; i++) {
    const res = await run(handler, { body: '{}', headers: { 'cf-connecting-ip': '203.0.113.50' } })
    assert.equal(res.statusCode, 400)
  }
  assert.equal(rateLimiter.size(), 0)
  const ok = await run(handler, { body: goodBody, headers: { 'cf-connecting-ip': '203.0.113.50' } })
  assert.equal(ok.statusCode, 200)
  assert.equal(rateLimiter.size(), 1)
})

test('10000 invalid requests from distinct IPs do not push 30 legitimate IPs into the shared bucket', async () => {
  const rateLimiter = createRateLimiter({ maxEntries: 10 })
  const { handler } = setup({ rateLimiter })
  for (let i = 0; i < 10_000; i++) {
    const ip = `198.51.${(i >> 8) & 255}.${i & 255}`
    await handler(fakeReq({ body: '{}', headers: { 'cf-connecting-ip': ip } }))
  }
  assert.equal(rateLimiter.size(), 0)
  for (let i = 0; i < 30; i++) {
    const res = await run(handler, { body: goodBody, headers: { 'cf-connecting-ip': `203.0.113.${100 + i}` } })
    assert.equal(res.statusCode, 200, `legit IP ${i}`)
  }
  assert.equal(rateLimiter.size(), 10)
})

test('IP-limited requests do not consume the global cap (only real model calls do)', async () => {
  const { handler, calls } = setup({ env: { ...baseEnv, GEMINI_DAILY_CAP: '9' } })
  for (let i = 0; i < 8; i++) assert.equal((await run(handler, { body: goodBody })).statusCode, 200)
  for (let i = 0; i < 5; i++) assert.equal((await run(handler, { body: goodBody })).statusCode, 429)
  const other = await run(handler, { body: goodBody, headers: { 'cf-connecting-ip': '203.0.113.60' } })
  assert.equal(other.statusCode, 200)
  assert.equal(calls.length, 9)
  const capped = await run(handler, { body: goodBody, headers: { 'cf-connecting-ip': '203.0.113.61' } })
  assert.equal(capped.statusCode, 429)
  assert.equal(calls.length, 9)
})

test('requests without any IP header use the strict shared bucket', async () => {
  const { handler } = setup()
  const statuses = []
  for (let i = 0; i < 4; i++) {
    statuses.push((await run(handler, { body: goodBody, headers: { 'cf-connecting-ip': undefined } })).statusCode)
  }
  assert.deepEqual(statuses, [200, 200, 200, 429])
})

test('global daily cap from GEMINI_DAILY_CAP blocks model calls with 429', async () => {
  const { handler, calls } = setup({ env: { ...baseEnv, GEMINI_DAILY_CAP: '2' } })
  const statuses = []
  for (let i = 0; i < 4; i++) {
    statuses.push((await run(handler, { body: goodBody, headers: { 'cf-connecting-ip': `203.0.113.${20 + i}` } })).statusCode)
  }
  assert.deepEqual(statuses, [200, 200, 429, 429])
  assert.equal(calls.length, 2)
})

test('invalid GEMINI_DAILY_CAP falls back to 500', async () => {
  const { handler } = setup({ env: { ...baseEnv, GEMINI_DAILY_CAP: 'abc' } })
  const res = await run(handler, { body: goodBody })
  assert.equal(res.statusCode, 200)
})

test('rejected requests do not consume the global cap', async () => {
  const { handler, calls } = setup({ env: { ...baseEnv, GEMINI_DAILY_CAP: '1' } })
  await run(handler, { body: '{}', headers: { 'cf-connecting-ip': '203.0.113.30' } })
  await run(handler, { body: goodBody, headers: { origin: 'https://evil.example' } })
  const res = await run(handler, { body: goodBody, headers: { 'cf-connecting-ip': '203.0.113.31' } })
  assert.equal(res.statusCode, 200)
  assert.equal(calls.length, 1)
})

const PAGES_URL = 'https://rvs-portfolio.pages.dev/api/chat'
const pagesHeaders = { origin: 'https://rvs-portfolio.pages.dev' }

test('ALLOWED_HOSTS: allowed host passes, foreign host (pages.dev) gets 403 without reaching the model', async () => {
  const env = { ...baseEnv, ALLOWED_HOSTS: 'rvargas.dev,www.rvargas.dev' }
  const { handler, calls } = setup({ env })
  const ok = await run(handler, { body: goodBody })
  assert.equal(ok.statusCode, 200)
  const denied = await run(handler, { url: PAGES_URL, headers: pagesHeaders, body: goodBody })
  assert.equal(denied.statusCode, 403)
  assert.deepEqual(denied.json(), { error: 'FORBIDDEN_ORIGIN' })
  assert.equal(calls.length, 1)
})

test('ALLOWED_HOSTS: host comparison is case-insensitive', async () => {
  const { handler } = setup({ env: { ...baseEnv, ALLOWED_HOSTS: 'rvargas.dev' } })
  const res = await run(handler, { url: 'https://RVargas.DEV/api/chat', body: goodBody })
  assert.equal(res.statusCode, 200)
})

test('ALLOWED_HOSTS: empty, blank or unset list falls back to defaults (fail closed)', async () => {
  for (const ALLOWED_HOSTS of [undefined, '', '  ', ' , ,']) {
    const { handler, calls } = setup({ env: { ...baseEnv, ALLOWED_HOSTS } })
    const denied = await run(handler, { url: PAGES_URL, headers: pagesHeaders, body: goodBody })
    assert.equal(denied.statusCode, 403, JSON.stringify(ALLOWED_HOSTS))
    assert.deepEqual(denied.json(), { error: 'FORBIDDEN_ORIGIN' })
    assert.equal(calls.length, 0)
    for (const host of ['rvargas.dev', 'www.rvargas.dev', 'localhost', '127.0.0.1', '[::1]']) {
      const ok = await run(handler, { url: `http://${host}/api/chat`, headers: { origin: `http://${host}` }, body: goodBody })
      assert.equal(ok.statusCode, 200, host)
    }
  }
})

test('ALLOWED_HOSTS: "*" lifts the restriction (previews only)', async () => {
  for (const ALLOWED_HOSTS of ['*', 'rvargas.dev, *']) {
    const { handler } = setup({ env: { ...baseEnv, ALLOWED_HOSTS } })
    const res = await run(handler, { url: PAGES_URL, headers: pagesHeaders, body: goodBody })
    assert.equal(res.statusCode, 200, ALLOWED_HOSTS)
  }
})

test('ALLOWED_HOSTS: tolerates spaces and empty entries', async () => {
  const { handler } = setup({ env: { ...baseEnv, ALLOWED_HOSTS: ' , rvargas.dev , ,WWW.rvargas.dev ' } })
  assert.equal((await run(handler, { body: goodBody })).statusCode, 200)
  const denied = await run(handler, { url: PAGES_URL, headers: pagesHeaders, body: goodBody })
  assert.equal(denied.statusCode, 403)
})

test('ALLOWED_HOSTS does not change 405 for non-POST methods', async () => {
  const { handler } = setup({ env: { ...baseEnv, ALLOWED_HOSTS: 'rvargas.dev' } })
  const res = await run(handler, { method: 'GET', url: PAGES_URL })
  assert.equal(res.statusCode, 405)
})

test('responses carry CSP and CORP headers and no Connection header', async () => {
  const { handler } = setup()
  const ok = await run(handler, { body: goodBody })
  assert.equal(ok.headers['content-security-policy'], "default-src 'none'; frame-ancestors 'none'")
  assert.equal(ok.headers['cross-origin-resource-policy'], 'same-origin')
  const big = await run(handler, { body: { messages: [{ role: 'user', content: 'x'.repeat(200_000) }], lang: 'es' } })
  assert.equal(big.statusCode, 413)
  assert.equal(big.headers.connection, undefined)
  assert.equal(big.headers['content-security-policy'], "default-src 'none'; frame-ancestors 'none'")
})

test('invalid GEMINI_MODEL is treated as NOT_CONFIGURED without calling the model', async () => {
  for (const GEMINI_MODEL of ['../x', 'Gemini', 'a b', 'a/b?key=1', '-x', 'a'.repeat(65)]) {
    const { handler, calls } = setup({ env: { ...baseEnv, GEMINI_MODEL } })
    const res = await run(handler, { body: goodBody })
    assert.equal(res.statusCode, 503, GEMINI_MODEL)
    assert.deepEqual(res.json(), { error: 'NOT_CONFIGURED' })
    assert.equal(calls.length, 0)
  }
})
