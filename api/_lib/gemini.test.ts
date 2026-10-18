import test from 'node:test'
import assert from 'node:assert/strict'
import { MAX_OUTPUT_TOKENS, TEMPERATURE, extractText, generateWithGemini, toContents } from './gemini.ts'
import type { FetchFn } from './gemini.ts'
import type { ChatMessage } from './types.ts'

const messages: ChatMessage[] = [
  { role: 'assistant', content: 'Hola, soy Ambar' },
  { role: 'user', content: 'Hola' },
  { role: 'assistant', content: 'En que te ayudo?' },
  { role: 'user', content: 'Cuentame de RVDesk' },
]

const params = { apiKey: 'AIza-secret', model: 'm-1', systemInstruction: 'SYSTEM RULES', messages }

const okReply = (parts: unknown[]): Response =>
  Response.json({ candidates: [{ content: { role: 'model', parts }, finishReason: 'STOP' }] })

interface Captured {
  url: string
  init: RequestInit
}

const fakeFetch = (impl: (init: RequestInit) => Response | Promise<Response>) => {
  const calls: Captured[] = []
  const fetchFn: FetchFn = async (url, init) => {
    calls.push({ url, init })
    return impl(init)
  }
  return { fetchFn, calls }
}

const parseBody = (init: RequestInit): unknown => JSON.parse(String(init.body))

test('toContents maps roles to the model format and drops leading assistant turns', () => {
  assert.deepEqual(toContents(messages), [
    { role: 'user', parts: [{ text: 'Hola' }] },
    { role: 'model', parts: [{ text: 'En que te ayudo?' }] },
    { role: 'user', parts: [{ text: 'Cuentame de RVDesk' }] },
  ])
})

test('posts to generateContent with the key in a header, never in the URL', async () => {
  const { fetchFn, calls } = fakeFetch(() => okReply([{ text: 'respuesta' }]))
  assert.equal(await generateWithGemini(params, { fetchFn }), 'respuesta')
  const [call] = calls
  assert.ok(call)
  assert.equal(call.url, 'https://generativelanguage.googleapis.com/v1beta/models/m-1:generateContent')
  assert.equal(call.url.includes('AIza-secret'), false)
  assert.equal(call.init.method, 'POST')
  const headers = new Headers(call.init.headers)
  assert.equal(headers.get('x-goog-api-key'), 'AIza-secret')
  assert.equal(headers.get('content-type'), 'application/json')
  assert.ok(call.init.signal instanceof AbortSignal)
})

test('sends the system instruction separate from the history, with sane limits', async () => {
  const { fetchFn, calls } = fakeFetch(() => okReply([{ text: 'ok' }]))
  await generateWithGemini(params, { fetchFn })
  const [call] = calls
  assert.ok(call)
  assert.deepEqual(parseBody(call.init), {
    contents: toContents(messages),
    systemInstruction: { parts: [{ text: 'SYSTEM RULES' }] },
    generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: TEMPERATURE },
  })
  assert.ok(MAX_OUTPUT_TOKENS >= 300 && MAX_OUTPUT_TOKENS <= 600)
  assert.ok(TEMPERATURE > 0 && TEMPERATURE <= 1)
})

test('the model id is encoded as a single path segment', async () => {
  const { fetchFn, calls } = fakeFetch(() => okReply([{ text: 'ok' }]))
  await generateWithGemini({ ...params, model: '../x?key=1' }, { fetchFn })
  assert.equal(calls[0]?.url, 'https://generativelanguage.googleapis.com/v1beta/models/..%2Fx%3Fkey%3D1:generateContent')
})

test('an HTTP error rejects with only the status (no upstream body)', async () => {
  const { fetchFn } = fakeFetch(() => Response.json({ error: { message: 'quota exceeded for project 123' } }, { status: 429 }))
  await assert.rejects(generateWithGemini(params, { fetchFn }), (err: unknown) => {
    assert.ok(err instanceof Error)
    assert.equal(Reflect.get(err, 'status'), 429)
    assert.equal(err.message.includes('quota'), false)
    return true
  })
})

test('aborts and rejects when the model takes longer than the timeout', async () => {
  const { fetchFn } = fakeFetch(
    (init) =>
      new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => reject(init.signal?.reason))
      }),
  )
  await assert.rejects(generateWithGemini(params, { fetchFn, timeoutMs: 20 }))
})

test('extractText joins the text parts of the first candidate and skips thoughts', () => {
  const data = {
    candidates: [
      { content: { parts: [{ text: 'pensando', thought: true }, { text: 'Hola ' }, { inlineData: {} }, { text: 'mundo' }] } },
      { content: { parts: [{ text: 'otra' }] } },
    ],
  }
  assert.equal(extractText(data), 'Hola mundo')
})

test('extractText returns an empty string for blocked or malformed replies', () => {
  for (const data of [null, 'x', {}, { candidates: [] }, { candidates: [{}] }, { candidates: [{ content: { parts: 'x' } }] }, { promptFeedback: { blockReason: 'SAFETY' } }]) {
    assert.equal(extractText(data), '', JSON.stringify(data))
  }
})

test('returns an empty string when the model returns no text', async () => {
  const { fetchFn } = fakeFetch(() => okReply([]))
  assert.equal(await generateWithGemini(params, { fetchFn }), '')
})
