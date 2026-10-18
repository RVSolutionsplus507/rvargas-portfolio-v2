import test from 'node:test'
import assert from 'node:assert/strict'
import { createRateLimiter, getClientIp } from './rate-limit.ts'

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR
// 2026-10-17 01:00 UTC: lejos de un cambio de día UTC
const T0 = Date.UTC(2026, 9, 17, 1, 0, 0)

test('allows 8 requests per minute and blocks the 9th with Retry-After', () => {
  const limiter = createRateLimiter()
  for (let i = 0; i < 8; i++) assert.equal(limiter.checkIp('1.2.3.4', T0 + i * 1000).ok, true)
  const blocked = limiter.checkIp('1.2.3.4', T0 + 10_000)
  assert.equal(blocked.ok, false)
  assert.ok(Number.isInteger(blocked.retryAfterSec))
  assert.ok(blocked.retryAfterSec >= 1 && blocked.retryAfterSec <= 60)
})

test('the minute window reopens after 60 seconds', () => {
  const limiter = createRateLimiter()
  for (let i = 0; i < 8; i++) limiter.checkIp('1.2.3.4', T0)
  assert.equal(limiter.checkIp('1.2.3.4', T0 + 1000).ok, false)
  assert.equal(limiter.checkIp('1.2.3.4', T0 + MIN + 1).ok, true)
})

test('blocked attempts do not extend the block', () => {
  const limiter = createRateLimiter()
  for (let i = 0; i < 8; i++) limiter.checkIp('1.2.3.4', T0)
  for (let i = 0; i < 50; i++) limiter.checkIp('1.2.3.4', T0 + 30_000)
  assert.equal(limiter.checkIp('1.2.3.4', T0 + MIN + 1).ok, true)
})

test('allows 60 requests per day and blocks the 61st until the next UTC day', () => {
  const limiter = createRateLimiter()
  let now = T0
  for (let i = 0; i < 60; i++) {
    assert.equal(limiter.checkIp('1.2.3.4', now).ok, true, `request ${i + 1}`)
    now += MIN + 1000
  }
  const blocked = limiter.checkIp('1.2.3.4', now)
  assert.equal(blocked.ok, false)
  const nextMidnight = (Math.floor(now / DAY) + 1) * DAY
  assert.equal(blocked.retryAfterSec, Math.ceil((nextMidnight - now) / 1000))
  assert.equal(limiter.checkIp('1.2.3.4', nextMidnight + 1000).ok, true)
})

test('different IPs have independent buckets', () => {
  const limiter = createRateLimiter()
  for (let i = 0; i < 8; i++) limiter.checkIp('1.1.1.1', T0)
  assert.equal(limiter.checkIp('1.1.1.1', T0).ok, false)
  assert.equal(limiter.checkIp('2.2.2.2', T0).ok, true)
})

test('requests without IP share one strict bucket', () => {
  const limiter = createRateLimiter()
  for (let i = 0; i < 3; i++) assert.equal(limiter.checkIp(null, T0).ok, true)
  assert.equal(limiter.checkIp(null, T0).ok, false)
  assert.equal(limiter.checkIp(undefined, T0).ok, false)
})

test('global daily cap blocks after the configured number of model calls', () => {
  const limiter = createRateLimiter({ globalDaily: 3 })
  for (let i = 0; i < 3; i++) assert.equal(limiter.checkGlobal(T0 + i).ok, true)
  const blocked = limiter.checkGlobal(T0 + 10)
  assert.equal(blocked.ok, false)
  assert.ok(blocked.retryAfterSec >= 1)
  assert.equal(limiter.checkGlobal(T0 + DAY).ok, true)
})

test('global cap defaults to 500', () => {
  const limiter = createRateLimiter()
  for (let i = 0; i < 500; i++) assert.equal(limiter.checkGlobal(T0).ok, true)
  assert.equal(limiter.checkGlobal(T0).ok, false)
})

test('stale entries are swept so the map does not grow unbounded', () => {
  const limiter = createRateLimiter()
  for (let i = 0; i < 100; i++) limiter.checkIp(`10.0.0.${i}`, T0)
  assert.equal(limiter.size(), 100)
  limiter.checkIp('9.9.9.9', T0 + DAY + HOUR)
  assert.equal(limiter.size(), 1)
})

test('when the map is full, a new IP evicts the oldest entry instead of falling into the shared bucket', () => {
  const limiter = createRateLimiter({ maxEntries: 5 })
  for (let i = 0; i < 5; i++) assert.equal(limiter.checkIp(`10.0.0.${i}`, T0).ok, true)
  for (let i = 0; i < 8; i++) assert.equal(limiter.checkIp(`10.0.1.${i}`, T0).ok, true)
  assert.equal(limiter.size(), 5)
})

test('eviction removes the oldest entry and keeps the newer ones', () => {
  const limiter = createRateLimiter({ maxEntries: 3 })
  for (let i = 0; i < 8; i++) limiter.checkIp('10.0.0.1', T0) // la más antigua, agotada
  limiter.checkIp('10.0.0.2', T0)
  limiter.checkIp('10.0.0.3', T0)
  limiter.checkIp('10.0.0.4', T0) // desaloja a 10.0.0.1
  assert.equal(limiter.size(), 3)
  assert.equal(limiter.checkIp('10.0.0.1', T0).ok, true) // vuelve con cupo nuevo (desalojada)
  // 10.0.0.3 y 10.0.0.4 siguen con su contador: 10.0.0.2 fue desalojada al reingresar 10.0.0.1
  for (let i = 0; i < 7; i++) limiter.checkIp('10.0.0.4', T0)
  assert.equal(limiter.checkIp('10.0.0.4', T0).ok, false)
})

test('eviction never removes the shared bucket', () => {
  const limiter = createRateLimiter({ maxEntries: 2 })
  for (let i = 0; i < 3; i++) limiter.checkIp(null, T0)
  limiter.checkIp('10.0.0.1', T0)
  limiter.checkIp('10.0.0.2', T0)
  limiter.checkIp('10.0.0.3', T0)
  assert.equal(limiter.checkIp(null, T0).ok, false)
})

const ip = (value: string | undefined, extra: Record<string, string> = {}): string | null =>
  getClientIp(new Headers(value === undefined ? extra : { ...extra, 'cf-connecting-ip': value }))

test('getClientIp trusts only cf-connecting-ip and ignores forwarding headers the client can forge', () => {
  const forged = { 'x-forwarded-for': '198.51.100.1, 10.0.0.1', 'x-real-ip': '192.0.2.9', 'x-vercel-forwarded-for': '192.0.2.10' }
  assert.equal(ip('203.0.113.5', forged), '203.0.113.5')
  assert.equal(ip(undefined, forged), null)
  assert.equal(ip(undefined, { 'x-forwarded-for': '198.51.100.1' }), null)
  assert.equal(ip(undefined, { 'x-real-ip': '192.0.2.9' }), null)
})

test('getClientIp returns null when missing or not an IP', () => {
  for (const bad of ['', '   ', 'not-an-ip', '<script>', '1.2.3', '256.1.1.1', '01.2.3.4', '1:::2', '12345::', '::1]@x', '[::1]', '::1]:80/[']) {
    assert.equal(ip(bad), null, bad)
  }
})

test('getClientIp groups IPv6 addresses by /64 and unwraps IPv4-mapped', () => {
  const a = ip('2001:db8:1:2:aaaa:bbbb:cccc:dddd')
  const b = ip('2001:0DB8:0001:0002::1')
  const c = ip('2001:db8:1:3::1')
  assert.equal(a, '2001:0db8:0001:0002::/64')
  assert.equal(a, b)
  assert.notEqual(a, c)
  assert.equal(ip('::1'), '0000:0000:0000:0000::/64')
  assert.equal(ip('fe80::1%eth0'), 'fe80:0000:0000:0000::/64')
  assert.equal(ip('::ffff:203.0.113.5'), '203.0.113.5')
  assert.equal(ip('::FFFF:cb00:7105'), '203.0.113.5')
  assert.equal(ip(' 203.0.113.5 '), '203.0.113.5')
})
