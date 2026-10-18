import { EMAIL_PATTERN } from '../lib/contact.ts'

// Datos del formulario de consulta. Todos opcionales: los que falten se rellenan con un valor por defecto.
export interface CustomEmailData {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
}

// Variables de la plantilla de EmailJS. Sin campo de destinatario: "To Email" es fijo en la plantilla.
export type EmailPayload = {
  from_name: string;
  reply_to: string;
  subject: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
};

export const SOURCE_DEFAULT = 'rvargas.dev';
export const SUBJECT_PREFIX = 'Consulta desde rvargas.dev';

export const LIMITS = {
  name: 100,
  email: 254,
  phone: 30,
  source: 50,
  subject: 100,
  message: 4000,
} as const;

// C0, DEL, C1, separadores de línea y caracteres bidi (embeddings, overrides e isolates)
const isControl = (code: number): boolean =>
  code < 32 ||
  (code >= 127 && code <= 159) ||
  code === 0x2028 ||
  code === 0x2029 ||
  (code >= 0x202a && code <= 0x202e) ||
  (code >= 0x2066 && code <= 0x2069);

// Campos de una sola línea (acaban en cabeceras): sin CR/LF ni caracteres de control
const toSingleLine = (value: string | undefined, max: number, fallback: string): string => {
  const clean = Array.from(value ?? '', (char) => (isControl(char.charCodeAt(0)) ? ' ' : char))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
    .trim();
  return clean || fallback;
};

// El cuerpo conserva los saltos de línea, pero normaliza CRLF y quita el resto de controles
const toBody = (value: string | undefined, max: number, fallback: string): string => {
  const clean = Array.from((value ?? '').replace(/\r\n?/g, '\n'))
    .filter((char) => char === '\n' || char === '\t' || !isControl(char.charCodeAt(0)))
    .join('')
    .trim()
    .slice(0, max)
    .trim();
  return clean || fallback;
};

// Sin email válido se envía vacío: la plantilla no debe recibir texto arbitrario como Reply-To
const toReplyTo = (email: string): string => (EMAIL_PATTERN.test(email) ? email : '');

export const buildEmailPayload = (data: CustomEmailData): EmailPayload => {
  const name = toSingleLine(data.name?.replace(/[<>"@]/g, ''), LIMITS.name, 'Sin nombre');
  const email = toSingleLine(data.email, LIMITS.email, 'Sin email');
  return {
    from_name: name,
    reply_to: toReplyTo(email),
    subject: toSingleLine(`${SUBJECT_PREFIX}: ${name}`, LIMITS.subject, SUBJECT_PREFIX),
    name,
    email,
    phone: toSingleLine(data.phone, LIMITS.phone, 'Sin teléfono'),
    message: toBody(data.message, LIMITS.message, 'Sin mensaje'),
    source: toSingleLine(data.source, LIMITS.source, SOURCE_DEFAULT),
  };
};
