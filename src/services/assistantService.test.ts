import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { ChatMessage, ConversationEntry, FetchInit, FetchLike } from './assistantService.ts'
import {
  CHAT_ENDPOINT,
  MAX_CONTENT_CHARS,
  MAX_MESSAGES,
  MAX_TOTAL_CHARS,
  buildPayload,
  cleanContent,
  detectConsultIntent,
  formatWait,
  mapFailure,
  redactPersonalData,
  requestReply,
  resolveNotice,
  splitLinks,
} from './assistantService.ts'

const user = (content: string): ChatMessage => ({ role: 'user', content })
const bot = (content: string): ChatMessage => ({ role: 'assistant', content })

const jsonResponse = (status: number, body: unknown, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } })

test('cleanContent strips control chars, trims and caps at 500', () => {
  assert.equal(cleanContent('  hola\u0000\u0007 mundo \n'), 'hola mundo')
  assert.equal(cleanContent('a'.repeat(900)).length, MAX_CONTENT_CHARS)
  assert.equal(cleanContent('uno\ndos'), 'uno\ndos')
})

test('redactPersonalData masks emails and phone numbers but keeps dates and short numbers', () => {
  assert.equal(redactPersonalData('escríbeme a ana@correo.com ya'), 'escríbeme a [email] ya')
  assert.equal(redactPersonalData('mi cel es +507 6108-3193 gracias'), 'mi cel es [phone] gracias')
  assert.equal(redactPersonalData('el 2026-10-05 tuvimos 184 pruebas'), 'el 2026-10-05 tuvimos 184 pruebas')
})

test('buildPayload keeps the last 8 messages, all within 500 chars', () => {
  const entries = Array.from({ length: 12 }, (_, i) => (i % 2 === 0 ? user(`q${i}`) : bot(`a${i}`)))
  entries.push(user('x'.repeat(800)))
  const payload = buildPayload(entries, 'es-PA')
  assert.ok(payload)
  assert.equal(payload.lang, 'es')
  assert.ok(payload.messages.length <= MAX_MESSAGES)
  assert.ok(payload.messages.every((m) => m.content.length <= MAX_CONTENT_CHARS))
  assert.equal(payload.messages.at(-1)?.role, 'user')
  assert.deepEqual(Object.keys(payload).sort(), ['lang', 'messages'])
})

test('buildPayload resolves lang to es or en', () => {
  assert.equal(buildPayload([user('hi')], 'en-US')?.lang, 'en')
  assert.equal(buildPayload([user('hi')], 'fr')?.lang, 'es')
  assert.equal(buildPayload([user('hi')], undefined)?.lang, 'es')
})

test('buildPayload drops the oldest messages to stay under the 2000 total', () => {
  const big = 'y'.repeat(MAX_CONTENT_CHARS)
  const entries = [user(big), bot(big), user(big), bot(big), user(big), bot(big), user(big)]
  const payload = buildPayload(entries, 'es')
  assert.ok(payload)
  const total = payload.messages.reduce((sum, m) => sum + m.content.length, 0)
  assert.ok(total <= MAX_TOTAL_CHARS)
  assert.equal(payload.messages.at(-1)?.role, 'user')
})

test('buildPayload ignores notices and local-only entries, and returns null without a final user message', () => {
  const entries: ConversationEntry[] = [user('hola'), { role: 'notice', content: 'error' }, bot('respuesta')]
  assert.equal(buildPayload(entries, 'es'), null)
  const ok = buildPayload([user('hola'), { role: 'notice', content: 'x' }], 'es')
  assert.deepEqual(ok?.messages, [user('hola')])
  assert.equal(buildPayload([], 'es'), null)
  assert.equal(buildPayload([user('\u0000\u0001')], 'es'), null)
})

test('buildPayload never sends personal data typed in the chat', () => {
  const payload = buildPayload([user('soy ana@correo.com, llámame al 6108 3193 por favor')], 'es')
  const sent = payload?.messages[0]?.content ?? ''
  assert.ok(sent.length > 0)
  assert.ok(!sent.includes('@'))
  assert.ok(!/6108/.test(sent))
})

test('buildPayload only redacts what the visitor typed, not the links in Ambar replies', () => {
  const reply = 'Escríbele por https://wa.me/50761083193 o en /contact'
  const payload = buildPayload([user('hola'), bot(reply), user('gracias')], 'es')
  assert.equal(payload?.messages[1]?.content, reply)
})

test('mapFailure maps 429 to rate_limited using Retry-After', () => {
  assert.deepEqual(mapFailure(429, { error: 'RATE_LIMITED' }, '37'), { kind: 'rate_limited', retryAfterSec: 37 })
})

test('mapFailure clamps and defaults a bad Retry-After', () => {
  const waitFor = (header: string | null): number | undefined => {
    const failure = mapFailure(429, null, header)
    return failure.kind === 'rate_limited' ? failure.retryAfterSec : undefined
  }
  assert.equal(waitFor('abc'), 60)
  assert.equal(waitFor(null), 60)
  assert.equal(waitFor('0'), 1)
  assert.equal(waitFor('999999'), 3600)
})

test('mapFailure flags NOT_CONFIGURED so the UI can explain it in development', () => {
  assert.deepEqual(mapFailure(503, { error: 'NOT_CONFIGURED' }, null), { kind: 'not_configured' })
})

test('mapFailure maps every other server failure to the fallback', () => {
  const cases: [number, string | undefined][] = [
    [502, 'UPSTREAM_ERROR'],
    [403, 'FORBIDDEN_ORIGIN'],
    [400, 'INVALID_REQUEST'],
    [413, 'PAYLOAD_TOO_LARGE'],
    [405, 'METHOD_NOT_ALLOWED'],
    [500, undefined],
  ]
  for (const [status, error] of cases) {
    assert.deepEqual(mapFailure(status, { error }, null), { kind: 'fallback' })
  }
})

test('resolveNotice explains the missing key only in development and falls back in production', () => {
  assert.deepEqual(resolveNotice({ kind: 'not_configured' }, true), { kind: 'dev_not_configured' })
  assert.deepEqual(resolveNotice({ kind: 'not_configured' }, false), { kind: 'fallback' })
  assert.deepEqual(resolveNotice({ kind: 'fallback' }, true), { kind: 'fallback' })
  assert.deepEqual(resolveNotice({ kind: 'rate_limited', retryAfterSec: 9 }, false), { kind: 'rate_limited', retryAfterSec: 9 })
})

test('the local opening message from Ambar never travels to the model', async () => {
  const opening = bot('Hola, soy Ambar. Cuéntame qué quieres resolver en tu negocio.')
  assert.equal(buildPayload([opening], 'es'), null)
  assert.deepEqual(buildPayload([opening, user('tengo una bodega')], 'es')?.messages, [user('tengo una bodega')])
  let called = false
  const fetchImpl: FetchLike = async () => {
    called = true
    return jsonResponse(200, { reply: 'x' })
  }
  assert.deepEqual(await requestReply([opening], 'es', { fetchImpl }), { ok: false, kind: 'fallback' })
  assert.equal(called, false)
})

test('formatWait speaks in seconds, then minutes, in both languages', () => {
  assert.equal(formatWait(1, 'es'), '1 segundo')
  assert.equal(formatWait(30, 'es'), '30 segundos')
  assert.equal(formatWait(61, 'es'), '2 minutos')
  assert.equal(formatWait(60, 'es'), '1 minuto')
  assert.equal(formatWait(1, 'en'), '1 second')
  assert.equal(formatWait(45, 'en'), '45 seconds')
  assert.equal(formatWait(120, 'en'), '2 minutes')
})

test('detectConsultIntent opens the form only on explicit scheduling phrases', () => {
  assert.equal(detectConsultIntent('Quiero agendar una consulta'), true)
  assert.equal(detectConsultIntent('necesito una reunión con Roberto'), true)
  assert.equal(detectConsultIntent('I want to schedule a call'), true)
  assert.equal(detectConsultIntent('Can I book a meeting?'), true)
  assert.equal(detectConsultIntent('¿Cuánto cuesta una consulta?'), false)
  assert.equal(detectConsultIntent('Cuéntame de RVDesk'), false)
  assert.equal(detectConsultIntent('What stack do you use?'), false)
  assert.equal(detectConsultIntent(''), false)
})

test('splitLinks isolates https links and leaves trailing punctuation as text', () => {
  const parts = splitLinks('Escríbele: https://wa.me/50761083193. Gracias')
  assert.deepEqual(parts, [
    { type: 'text', value: 'Escríbele: ' },
    { type: 'link', value: 'https://wa.me/50761083193' },
    { type: 'text', value: '. Gracias' },
  ])
  assert.deepEqual(splitLinks('sin enlaces'), [{ type: 'text', value: 'sin enlaces' }])
  assert.deepEqual(splitLinks('http://inseguro.test y javascript:alert(1)'), [
    { type: 'text', value: 'http://inseguro.test y javascript:alert(1)' },
  ])
})

test('splitLinks only links allowlisted https hosts and their subdomains', () => {
  const text = 'https://wa.me/1 https://app.rvdesk.app/x https://evil.com https://rvargas.dev.evil.com https://evilrvdesk.app https://conectando-mas.com'
  const links = splitLinks(text).filter((part) => part.type === 'link').map((part) => part.value)
  assert.deepEqual(links, ['https://wa.me/1', 'https://app.rvdesk.app/x', 'https://conectando-mas.com'])
})

test('splitLinks rejects credentials in the URL and subdomains of wa.me', () => {
  const text = 'https://evil.com@rvargas.dev/ https://user:pw@rvargas.dev/ https://sub.wa.me/1 https://wa.me/1 https://rvargas.dev/x'
  const links = splitLinks(text).filter((part) => part.type === 'link').map((part) => part.value)
  assert.deepEqual(links, ['https://wa.me/1', 'https://rvargas.dev/x'])
})

test('requestReply posts only to /api/chat and returns the reply', async () => {
  const calls: { url: string; init: FetchInit }[] = []
  const fetchImpl: FetchLike = async (url, init) => {
    calls.push({ url, init })
    return jsonResponse(200, { reply: '  Hola, soy Ambar.  ' })
  }
  const result = await requestReply([user('hola')], 'es', { fetchImpl })
  assert.deepEqual(result, { ok: true, reply: 'Hola, soy Ambar.' })
  const [call] = calls
  assert.ok(call)
  assert.equal(call.url, CHAT_ENDPOINT)
  assert.equal(call.init.method, 'POST')
  assert.deepEqual(JSON.parse(call.init.body), { messages: [user('hola')], lang: 'es' })
})

test('requestReply reports NOT_CONFIGURED as its own kind', async () => {
  const fetchImpl: FetchLike = async () => jsonResponse(503, { error: 'NOT_CONFIGURED' })
  assert.deepEqual(await requestReply([user('hola')], 'es', { fetchImpl }), { ok: false, kind: 'not_configured' })
})

test('requestReply surfaces a 429 with its wait time', async () => {
  const fetchImpl: FetchLike = async () => jsonResponse(429, { error: 'RATE_LIMITED' }, { 'Retry-After': '42' })
  assert.deepEqual(await requestReply([user('hola')], 'es', { fetchImpl }), {
    ok: false,
    kind: 'rate_limited',
    retryAfterSec: 42,
  })
})

test('requestReply degrades to the fallback on 503, 502, network errors and bad bodies', async () => {
  const cases: FetchLike[] = [
    async () => jsonResponse(502, { error: 'UPSTREAM_ERROR' }),
    async () => {
      throw new TypeError('Failed to fetch')
    },
    async () => jsonResponse(200, { reply: '   ' }),
    async () => jsonResponse(200, { nope: true }),
    async () => new Response('<html>', { status: 200 }),
  ]
  for (const fetchImpl of cases) {
    assert.deepEqual(await requestReply([user('hola')], 'en', { fetchImpl }), { ok: false, kind: 'fallback' })
  }
})

test('requestReply aborts after the timeout and falls back', async () => {
  const fetchImpl: FetchLike = (_url, { signal }) =>
    new Promise<Response>((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
    })
  const started = Date.now()
  const result = await requestReply([user('hola')], 'es', { fetchImpl, timeoutMs: 40 })
  assert.deepEqual(result, { ok: false, kind: 'fallback' })
  assert.ok(Date.now() - started < 1000)
})

test('requestReply reports an external abort so the UI can ignore it', async () => {
  const controller = new AbortController()
  const fetchImpl: FetchLike = (_url, { signal }) =>
    new Promise<Response>((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
    })
  const pending = requestReply([user('hola')], 'es', { fetchImpl, signal: controller.signal, timeoutMs: 5000 })
  controller.abort()
  assert.deepEqual(await pending, { ok: false, kind: 'aborted' })
})

test('requestReply never calls fetch when there is nothing valid to send', async () => {
  let called = false
  const fetchImpl: FetchLike = async () => {
    called = true
    return jsonResponse(200, { reply: 'x' })
  }
  assert.deepEqual(await requestReply([], 'es', { fetchImpl }), { ok: false, kind: 'fallback' })
  assert.equal(called, false)
})
