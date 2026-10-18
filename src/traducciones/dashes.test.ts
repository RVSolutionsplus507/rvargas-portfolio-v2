import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FORBIDDEN = /[—–]| -- /

const textFiles = (): string[] => {
  const files = [path.join(SRC_DIR, 'data', 'portfolio.ts')]
  for (const lang of fs.readdirSync(import.meta.dirname)) {
    const dir = path.join(import.meta.dirname, lang)
    if (fs.statSync(dir).isDirectory()) files.push(...fs.readdirSync(dir).map((file) => path.join(dir, file)))
  }
  return files
}

test('los textos visibles no llevan rayas largas ni " -- " como separador', () => {
  const offenders = textFiles().filter((file) => FORBIDDEN.test(fs.readFileSync(file, 'utf8')))
  assert.deepEqual(offenders.map((file) => path.relative(SRC_DIR, file)), [])
})
