import test from 'node:test'
import assert from 'node:assert/strict'
import { isOriginAllowed } from './origin.ts'

const prodEnv = { VERCEL_ENV: 'production', NODE_ENV: 'production' }
const devEnv = { NODE_ENV: 'development' }

test('allows the default production origins via Origin header', () => {
  assert.equal(isOriginAllowed({ origin: 'https://rvargas.dev' }, prodEnv), true)
  assert.equal(isOriginAllowed({ origin: 'https://www.rvargas.dev' }, prodEnv), true)
})

test('falls back to Referer when Origin is absent', () => {
  assert.equal(isOriginAllowed({ referer: 'https://rvargas.dev/projects?x=1' }, prodEnv), true)
  assert.equal(isOriginAllowed({ referer: 'https://evil.example/https://rvargas.dev/' }, prodEnv), false)
})

test('rejects when neither Origin nor Referer is present', () => {
  assert.equal(isOriginAllowed({}, prodEnv), false)
})

test('rejects foreign, null, malformed and lookalike origins', () => {
  const bad = [
    'https://evil.example',
    'null',
    'not a url',
    '',
    'https://rvargas.dev.evil.example',
    'https://evilrvargas.dev',
    'http://rvargas.dev',
    'https://rvargas.dev:8443',
    'https://user@rvargas.dev.evil.example',
  ]
  for (const origin of bad) {
    assert.equal(isOriginAllowed({ origin }, prodEnv), false, origin)
  }
})

test('does not fall back to Referer when a bad Origin is present', () => {
  assert.equal(
    isOriginAllowed({ origin: 'https://evil.example', referer: 'https://rvargas.dev/' }, prodEnv),
    false,
  )
})

test('allows localhost and 127.0.0.1 on any port outside production', () => {
  assert.equal(isOriginAllowed({ origin: 'http://localhost:5173' }, devEnv), true)
  assert.equal(isOriginAllowed({ origin: 'http://127.0.0.1:5188' }, devEnv), true)
  assert.equal(isOriginAllowed({ origin: 'http://localhost' }, devEnv), true)
  assert.equal(isOriginAllowed({ origin: 'https://localhost.evil.example' }, devEnv), false)
  assert.equal(isOriginAllowed({ origin: 'http://localhost.evil.example:3000' }, devEnv), false)
})

test('a Vercel preview is not production, so localhost stays allowed there', () => {
  assert.equal(
    isOriginAllowed({ origin: 'http://localhost:3000' }, { VERCEL_ENV: 'preview', NODE_ENV: 'production' }),
    true,
  )
})

test('blocks localhost in production', () => {
  assert.equal(isOriginAllowed({ origin: 'http://localhost:5173' }, prodEnv), false)
  assert.equal(isOriginAllowed({ origin: 'http://localhost:5173' }, { NODE_ENV: 'production' }), false)
})

test('ALLOWED_ORIGINS replaces the defaults and tolerates spaces and empties', () => {
  const env = { ...prodEnv, ALLOWED_ORIGINS: ' https://example.com , ,https://app.example.com/ ' }
  assert.equal(isOriginAllowed({ origin: 'https://example.com' }, env), true)
  assert.equal(isOriginAllowed({ origin: 'https://app.example.com' }, env), true)
  assert.equal(isOriginAllowed({ origin: 'https://rvargas.dev' }, env), false)
})

test('an empty ALLOWED_ORIGINS falls back to the defaults', () => {
  assert.equal(isOriginAllowed({ origin: 'https://rvargas.dev' }, { ...prodEnv, ALLOWED_ORIGINS: '  ' }), true)
})
