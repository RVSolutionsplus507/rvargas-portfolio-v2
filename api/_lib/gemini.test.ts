import test from 'node:test'
import assert from 'node:assert/strict'
import { generateWithGemini, toContents } from './gemini.ts'
import type { GeminiRequest, GeminiResponse } from './gemini.ts'
import type { ChatMessage } from './types.ts'

const messages: ChatMessage[] = [
  { role: 'assistant', content: 'Hola, soy Ambar' },
  { role: 'user', content: 'Hola' },
  { role: 'assistant', content: 'En que te ayudo?' },
  { role: 'user', content: 'Cuentame de RVDesk' },
]

test('toContents maps roles to the model format and drops leading assistant turns', () => {
  assert.deepEqual(toContents(messages), [
    { role: 'user', parts: [{ text: 'Hola' }] },
    { role: 'model', parts: [{ text: 'En que te ayudo?' }] },
    { role: 'user', parts: [{ text: 'Cuentame de RVDesk' }] },
  ])
})

const fakeClientFactory = (impl: (request: GeminiRequest) => GeminiResponse | Promise<GeminiResponse>) => {
  const requests: GeminiRequest[] = []
  const createClient = (apiKey: string) => ({
    apiKey,
    models: {
      generateContent: async (request: GeminiRequest) => {
        requests.push(request)
        return impl(request)
      },
    },
  })
  return { createClient, requests }
}

test('sends the system instruction separate from the history, with sane limits', async () => {
  const { createClient, requests } = fakeClientFactory(() => ({ text: 'respuesta' }))
  const reply = await generateWithGemini(
    { apiKey: 'k', model: 'm-1', systemInstruction: 'SYSTEM RULES', messages },
    { createClient },
  )
  assert.equal(reply, 'respuesta')
  const [request] = requests
  assert.ok(request)
  assert.equal(request.model, 'm-1')
  assert.equal(request.config.systemInstruction, 'SYSTEM RULES')
  assert.equal(JSON.stringify(request.contents).includes('SYSTEM RULES'), false)
  assert.equal(request.contents.at(-1)?.role, 'user')
  assert.ok(request.config.maxOutputTokens >= 300 && request.config.maxOutputTokens <= 600)
  assert.ok(request.config.temperature > 0 && request.config.temperature <= 1)
  assert.ok(request.config.abortSignal instanceof AbortSignal)
})

test('aborts and rejects when the model takes longer than the timeout', async () => {
  const { createClient } = fakeClientFactory(
    (request) =>
      new Promise<GeminiResponse>((_resolve, reject) => {
        request.config.abortSignal.addEventListener('abort', () => reject(new Error('aborted')))
      }),
  )
  await assert.rejects(
    generateWithGemini(
      { apiKey: 'k', model: 'm', systemInstruction: 's', messages },
      { createClient, timeoutMs: 20 },
    ),
  )
})

test('rejects on timeout even if the client ignores the abort signal', async () => {
  const { createClient } = fakeClientFactory(() => new Promise<GeminiResponse>(() => {}))
  await assert.rejects(
    generateWithGemini(
      { apiKey: 'k', model: 'm', systemInstruction: 's', messages },
      { createClient, timeoutMs: 20 },
    ),
  )
})

test('returns an empty string when the model returns no text', async () => {
  const { createClient } = fakeClientFactory(() => ({ text: undefined }))
  const reply = await generateWithGemini(
    { apiKey: 'k', model: 'm', systemInstruction: 's', messages },
    { createClient },
  )
  assert.equal(reply, '')
})
