import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { Translate } from './i18n-helpers.ts'
import { isRecord, isStringArray, tArray, tList, tObject, tText } from './i18n-helpers.ts'

// Simula a i18next: sin returnObjects un objeto/arreglo se queda en texto de aviso; si falta la clave devuelve la clave
const fakeT =
  (dictionary: Record<string, unknown>): Translate =>
  (key, options) => {
    if (!(key in dictionary)) return key
    const value = dictionary[key]
    if (typeof value === 'object' && value !== null && options?.returnObjects !== true) {
      return `key '${key}' returned an object instead of string.`
    }
    return value
  }

const t = fakeT({
  title: 'Hola',
  tech: ['React', 'Node.js'],
  mixed: ['React', 3],
  profile: { name: 'Ana', level: 'Senior' },
  empty: [],
})

const isProfile = (value: unknown): value is { name: string; level: string } =>
  isRecord(value) && typeof value.name === 'string' && typeof value.level === 'string'

test('isRecord and isStringArray accept only the right shapes', () => {
  assert.equal(isRecord({}), true)
  assert.equal(isRecord([]), false)
  assert.equal(isRecord(null), false)
  assert.equal(isStringArray(['a', 'b']), true)
  assert.equal(isStringArray([]), true)
  assert.equal(isStringArray(['a', 1]), false)
  assert.equal(isStringArray('a'), false)
})

test('tText returns the string, and the key when the value is not a string', () => {
  assert.equal(tText(t, 'title'), 'Hola')
  assert.equal(tText(t, 'missing'), 'missing')
  assert.equal(tText(fakeT({ n: 5 }), 'n'), 'n')
})

test('tArray returns the strings and falls back to [] on any other shape', () => {
  assert.deepEqual(tArray(t, 'tech'), ['React', 'Node.js'])
  assert.deepEqual(tArray(t, 'empty'), [])
  assert.deepEqual(tArray(t, 'mixed'), [])
  assert.deepEqual(tArray(t, 'title'), [])
  assert.deepEqual(tArray(t, 'profile'), [])
  assert.deepEqual(tArray(t, 'missing'), [])
})

test('tList validates every element with the guard', () => {
  const rows = fakeT({ rows: [{ name: 'A', level: 'x' }], bad: [{ name: 'A' }] })
  assert.deepEqual(tList(rows, 'rows', isProfile), [{ name: 'A', level: 'x' }])
  assert.deepEqual(tList(rows, 'bad', isProfile), [])
})

test('tObject returns the object only when the guard accepts it', () => {
  assert.deepEqual(tObject(t, 'profile', isProfile), { name: 'Ana', level: 'Senior' })
  assert.equal(tObject(t, 'title', isProfile), null)
  assert.equal(tObject(t, 'missing', isProfile), null)
})

test('helpers forward interpolation options and force returnObjects for structures', () => {
  const seen: unknown[] = []
  const spy: Translate = (_key, options) => {
    seen.push(options)
    return []
  }
  tArray(spy, 'k', { count: 2 })
  tText(spy, 'k', { count: 2 })
  assert.deepEqual(seen, [{ count: 2, returnObjects: true }, { count: 2 }])
})
