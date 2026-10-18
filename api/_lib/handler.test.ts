import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_MODEL, createHandler } from './handler.ts'
import { createRateLimiter } from './rate-limit.ts'
import type { RateLimiter } from './rate-limit.ts'
import type { ChatEnv, ChatHandler, ChatRequest, ChatResponse, GenerateFn, GenerateParams } from './types.ts'

const NOW = Date.UTC(2026, 9, 17, 12, 0, 0)
const API_KEY = 'AIza-test-key-should-never-leak'

const baseEnv: ChatEnv = { GEMINI_API_KEY: API_KEY, VERCEL_ENV: 'production', NODE_ENV: 'production' }
const goodBody = { messages: [{ role: 'user', content: 'Hola, ¿qué proyectos tienes?' }], lang: 'es' }

interface ReqOptions {
  method?: string
  headers?: Record<string, string | undefined>
  body?: unknown
}

const fakeReq = ({ method = 'POST', headers = {}, body }: ReqOptions = {}): ChatRequest => {
  const raw = body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body)
  const h = { origin: 'https://rvargas.dev', 'content-type': 'application/json', 'x-real-ip': '203.0.113.7', ...headers }
  return {
    method,
    headers: h,
    async *[Symbol.asyncIterator]() {
      if (raw) yield Buffer.from(raw)
    },
  }
}

class FakeRes implements ChatResponse {
  statusCode = 200
  headers: Record<string, string> = {}
  body = ''
  setHeader(name: string, value: string | number): void {
    this.headers[name.toLowerCase()] = String(value)
  }
  end(chunk = ''): void {
    this.body += chunk
  }
  json(): unknown {
    return JSON.parse(this.body)
  }
}

const fakeRes = () => new FakeRes()

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

const run = async (handler: ChatHandler, reqOptions?: ReqOptions) => {
  const res = fakeRes()
  await handler(fakeReq(reqOptions), res)
  return res
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
  await run(handler, { body: goodBody, headers: { 'x-real-ip': '203.0.113.8' } })
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

test('missing GEMINI_API_KEY gets 503 NOT_CONFIGURED without details', async () => {
  const { handler, calls } = setup({ env: { VERCEL_ENV: 'production' } })
  const res = await run(handler, { body: goodBody })
  assert.equal(res.statusCode, 503)
  assert.deepEqual(res.json(), { error: 'NOT_CONFIGURED' })
  assert.equal(calls.length, 0)
})

test('validation errors take precedence over NOT_CONFIGURED', async () => {
  const { handler } = setup({ env: { VERCEL_ENV: 'production' } })
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
  const other = await run(handler, { body: goodBody, headers: { 'x-real-ip': '203.0.113.99' } })
  assert.equal(other.statusCode, 200)
})

test('invalid requests do not spend IP quota or create limiter entries', async () => {
  const rateLimiter = createRateLimiter()
  const { handler } = setup({ rateLimiter })
  for (let i = 0; i < 20; i++) {
    const res = await run(handler, { body: '{}', headers: { 'x-real-ip': '203.0.113.50' } })
    assert.equal(res.statusCode, 400)
  }
  assert.equal(rateLimiter.size(), 0)
  const ok = await run(handler, { body: goodBody, headers: { 'x-real-ip': '203.0.113.50' } })
  assert.equal(ok.statusCode, 200)
  assert.equal(rateLimiter.size(), 1)
})

test('10000 invalid requests from distinct IPs do not push 30 legitimate IPs into the shared bucket', async () => {
  const rateLimiter = createRateLimiter({ maxEntries: 10 })
  const { handler } = setup({ rateLimiter })
  for (let i = 0; i < 10_000; i++) {
    const ip = `198.51.${(i >> 8) & 255}.${i & 255}`
    await handler(fakeReq({ body: '{}', headers: { 'x-real-ip': ip } }), fakeRes())
  }
  assert.equal(rateLimiter.size(), 0)
  for (let i = 0; i < 30; i++) {
    const res = await run(handler, { body: goodBody, headers: { 'x-real-ip': `203.0.113.${100 + i}` } })
    assert.equal(res.statusCode, 200, `legit IP ${i}`)
  }
  assert.equal(rateLimiter.size(), 10)
})

test('IP-limited requests do not consume the global cap (only real model calls do)', async () => {
  const { handler, calls } = setup({ env: { ...baseEnv, GEMINI_DAILY_CAP: '9' } })
  for (let i = 0; i < 8; i++) assert.equal((await run(handler, { body: goodBody })).statusCode, 200)
  for (let i = 0; i < 5; i++) assert.equal((await run(handler, { body: goodBody })).statusCode, 429)
  const other = await run(handler, { body: goodBody, headers: { 'x-real-ip': '203.0.113.60' } })
  assert.equal(other.statusCode, 200)
  assert.equal(calls.length, 9)
  const capped = await run(handler, { body: goodBody, headers: { 'x-real-ip': '203.0.113.61' } })
  assert.equal(capped.statusCode, 429)
  assert.equal(calls.length, 9)
})

test('requests without any IP header use the strict shared bucket', async () => {
  const { handler } = setup()
  const statuses = []
  for (let i = 0; i < 4; i++) {
    statuses.push((await run(handler, { body: goodBody, headers: { 'x-real-ip': undefined } })).statusCode)
  }
  assert.deepEqual(statuses, [200, 200, 200, 429])
})

test('global daily cap from GEMINI_DAILY_CAP blocks model calls with 429', async () => {
  const { handler, calls } = setup({ env: { ...baseEnv, GEMINI_DAILY_CAP: '2' } })
  const statuses = []
  for (let i = 0; i < 4; i++) {
    statuses.push((await run(handler, { body: goodBody, headers: { 'x-real-ip': `203.0.113.${20 + i}` } })).statusCode)
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
  await run(handler, { body: '{}', headers: { 'x-real-ip': '203.0.113.30' } })
  await run(handler, { body: goodBody, headers: { origin: 'https://evil.example' } })
  const res = await run(handler, { body: goodBody, headers: { 'x-real-ip': '203.0.113.31' } })
  assert.equal(res.statusCode, 200)
  assert.equal(calls.length, 1)
})
