import test from 'node:test'
import assert from 'node:assert/strict'
import { isOriginAllowed } from './origin.ts'

const SITE = 'https://rvargas.dev/api/chat'

const req = (headers: Record<string, string>, url = SITE): Request => new Request(url, { method: 'POST', headers })

test('allows the default production origins via Origin header', () => {
  assert.equal(isOriginAllowed(req({ origin: 'https://rvargas.dev' }), {}), true)
  assert.equal(isOriginAllowed(req({ origin: 'https://www.rvargas.dev' }), {}), true)
})

test('falls back to Referer when Origin is absent', () => {
  assert.equal(isOriginAllowed(req({ referer: 'https://rvargas.dev/projects?x=1' }), {}), true)
  assert.equal(isOriginAllowed(req({ referer: 'https://evil.example/https://rvargas.dev/' }), {}), false)
})

test('rejects when neither Origin nor Referer is present', () => {
  assert.equal(isOriginAllowed(req({}), {}), false)
})

test('rejects foreign, null, malformed and lookalike origins', () => {
  const bad = [
    'https://evil.example',
    'null',
    'not a url',
    'https://rvargas.dev.evil.example',
    'https://evilrvargas.dev',
    'http://rvargas.dev',
    'https://rvargas.dev:8443',
    'https://user@rvargas.dev.evil.example',
  ]
  for (const origin of bad) {
    assert.equal(isOriginAllowed(req({ origin }), {}), false, origin)
  }
})

test('does not fall back to Referer when a bad Origin is present', () => {
  assert.equal(isOriginAllowed(req({ origin: 'https://evil.example', referer: 'https://rvargas.dev/' }), {}), false)
})

test('a same-origin request is allowed on any host serving the function (previews, local dev)', () => {
  const preview = 'https://3f2a1b.rvs-portfolio.pages.dev/api/chat'
  assert.equal(isOriginAllowed(req({ origin: 'https://3f2a1b.rvs-portfolio.pages.dev' }, preview), {}), true)
  assert.equal(isOriginAllowed(req({ referer: 'https://3f2a1b.rvs-portfolio.pages.dev/contact' }, preview), {}), true)
  assert.equal(isOriginAllowed(req({ origin: 'https://other.rvs-portfolio.pages.dev' }, preview), {}), false)
  const local = 'http://localhost:5173/api/chat'
  assert.equal(isOriginAllowed(req({ origin: 'http://localhost:5173' }, local), {}), true)
})

test('localhost is never allowed cross-origin, whatever the environment', () => {
  assert.equal(isOriginAllowed(req({ origin: 'http://localhost:5173' }), {}), false)
  assert.equal(isOriginAllowed(req({ origin: 'http://127.0.0.1:5188' }), {}), false)
})

test('ALLOWED_ORIGINS replaces the defaults and tolerates spaces and empties', () => {
  const env = { ALLOWED_ORIGINS: ' https://example.com , ,https://app.example.com/ ' }
  assert.equal(isOriginAllowed(req({ origin: 'https://example.com' }), env), true)
  assert.equal(isOriginAllowed(req({ origin: 'https://app.example.com' }), env), true)
  assert.equal(isOriginAllowed(req({ origin: 'https://www.rvargas.dev' }), env), false)
})

test('an empty ALLOWED_ORIGINS falls back to the defaults', () => {
  assert.equal(isOriginAllowed(req({ origin: 'https://www.rvargas.dev' }), { ALLOWED_ORIGINS: '  ' }), true)
})
