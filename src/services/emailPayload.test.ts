import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LIMITS, buildEmailPayload } from './emailPayload.ts'

test('el payload usa las variables estándar de EmailJS y ninguna de destinatario', () => {
  const payload = buildEmailPayload({ name: 'Ana', email: 'ana@example.com', phone: '+507 6000-0000', message: 'Hola', source: 'rvargas.dev' })
  assert.deepEqual(payload, {
    from_name: 'Ana',
    reply_to: 'ana@example.com',
    subject: 'Consulta desde rvargas.dev: Ana',
    name: 'Ana',
    email: 'ana@example.com',
    phone: '+507 6000-0000',
    message: 'Hola',
    source: 'rvargas.dev',
  })
  const forbidden = ['to', 'to_email', 'to_name', 'recipient', 'cc', 'bcc', 'reply_to_email']
  assert.deepEqual(Object.keys(payload).filter((key) => forbidden.includes(key)), [])
})

test('los campos vacíos reciben valores por defecto', () => {
  const payload = buildEmailPayload({})
  assert.equal(payload.name, 'Sin nombre')
  assert.equal(payload.message, 'Sin mensaje')
  assert.equal(payload.source, 'rvargas.dev')
  assert.equal(payload.subject, 'Consulta desde rvargas.dev: Sin nombre')
})

test('los campos de cabecera no llevan CR/LF ni caracteres de control', () => {
  const payload = buildEmailPayload({
    name: 'Ana\r\nBcc: x@evil.com',
    email: 'ana@example.com\nCc: y@evil.com',
    phone: '123\r456',
    source: 'a\u0000b\nc',
  })
  for (const field of ['from_name', 'reply_to', 'subject', 'name', 'email', 'phone', 'source'] as const) {
    assert.equal([...payload[field]].some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127), false, field)
  }
})

test('aplica límites de longitud y el asunto no pasa de 100 caracteres', () => {
  const payload = buildEmailPayload({ name: 'n'.repeat(500), email: 'e'.repeat(500), phone: '1'.repeat(500), message: 'm'.repeat(10000), source: 's'.repeat(500) })
  assert.equal(payload.name.length, LIMITS.name)
  assert.equal(payload.email.length, LIMITS.email)
  assert.equal(payload.phone.length, LIMITS.phone)
  assert.equal(payload.source.length, LIMITS.source)
  assert.equal(payload.message.length, LIMITS.message)
  assert.ok(payload.subject.length <= LIMITS.subject)
})

test('el mensaje conserva los saltos de línea, normaliza CRLF y quita controles', () => {
  const payload = buildEmailPayload({ message: 'Línea 1\r\nLínea 2\u0000\u0007\n\nLínea 4' })
  assert.equal(payload.message, 'Línea 1\nLínea 2\n\nLínea 4')
})

test('una consulta agendada conserva fecha/hora de Panamá e idioma en el mensaje', () => {
  const message = ['SOLICITUD DE CONSULTA (desde Ambar)', 'Fecha preferida: lunes', 'Hora preferida (hora de Panamá): 10:00', 'Idioma del visitante: es'].join('\n')
  const payload = buildEmailPayload({ name: 'Ana', email: 'a@b.co', message })
  assert.match(payload.message, /hora de Panamá\): 10:00/)
  assert.match(payload.message, /Idioma del visitante: es/)
})

test('el nombre pierde <, >, " y @ en from_name y subject', () => {
  const payload = buildEmailPayload({ name: 'Ana <x@evil.com> "Pro"', email: 'a@b.co', message: 'Hola' })
  assert.equal(payload.from_name, 'Ana xevil.com Pro')
  assert.equal(payload.subject, 'Consulta desde rvargas.dev: Ana xevil.com Pro')
})

test('reply_to queda vacío si el email no cumple EMAIL_PATTERN', () => {
  for (const email of ['no-es-email', 'ana@example', undefined, 'a@b.co\nBcc: x@evil.com']) {
    assert.equal(buildEmailPayload({ email }).reply_to, '', String(email))
  }
  assert.equal(buildEmailPayload({ email: 'ana@example.com' }).reply_to, 'ana@example.com')
})

test('quita controles C1 y caracteres bidi de los campos de una línea y del mensaje', () => {
  const payload = buildEmailPayload({ name: 'An\u0085a‮b⁦c⁩', message: 'Hola\u0090‪ mundo‮' })
  assert.equal(payload.name, 'An a b c')
  assert.equal(payload.message, 'Hola mundo')
})
