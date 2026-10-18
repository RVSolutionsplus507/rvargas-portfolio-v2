import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cn, decodeHashId } from './utils.ts'

test('cn keeps a custom font size and a text color together', () => {
  assert.equal(cn('text-meta text-primary-foreground'), 'text-meta text-primary-foreground')
  assert.equal(cn('text-caption text-muted-foreground'), 'text-caption text-muted-foreground')
})

test('cn lets the last custom font size win over another size', () => {
  assert.equal(cn('text-body text-meta'), 'text-meta')
  assert.equal(cn('text-sm text-display-sm'), 'text-display-sm')
})

test('cn resolves conflicts between plain utilities', () => {
  assert.equal(cn('p-2 p-4'), 'p-4')
  assert.equal(cn('rounded-md', false, undefined, 'rounded-lg'), 'rounded-lg')
})

test('decodeHashId decodes valid hashes and returns null for malformed ones', () => {
  assert.equal(decodeHashId('#rvdesk'), 'rvdesk')
  assert.equal(decodeHashId('#a%20b'), 'a b')
  assert.equal(decodeHashId('#%E0%A4%A'), null)
  assert.equal(decodeHashId(''), null)
})
