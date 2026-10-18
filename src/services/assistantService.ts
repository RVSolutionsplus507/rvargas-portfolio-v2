// Cliente de Ambar: habla SOLO con POST /api/chat. La clave del modelo vive en el servidor, nunca aquí.
// Las funciones son puras (o reciben fetch por parámetro) para poder probarlas con node:test.

export type ChatRole = "user" | "assistant";
export type ChatLang = "es" | "en";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// Aviso local de la UI (error, límite): nunca viaja al modelo
export interface LocalNotice {
  role: "notice";
  content: string;
}

export type ConversationEntry = ChatMessage | LocalNotice;

// Cuerpo de POST /api/chat (el servidor exige exactamente estas dos claves)
export interface ChatPayload {
  messages: ChatMessage[];
  lang: ChatLang;
}

// Códigos de error del contrato de /api/chat (api/_lib/handler.ts)
export const ASSISTANT_ERROR_CODES = [
  "METHOD_NOT_ALLOWED",
  "FORBIDDEN_ORIGIN",
  "INVALID_REQUEST",
  "PAYLOAD_TOO_LARGE",
  "RATE_LIMITED",
  "NOT_CONFIGURED",
  "UPSTREAM_ERROR",
] as const;

export type AssistantErrorCode = (typeof ASSISTANT_ERROR_CODES)[number];

// Estado de UI al que se traduce un fallo HTTP; nunca expone el código crudo del servidor
export type ChatFailure =
  | { kind: "rate_limited"; retryAfterSec: number }
  | { kind: "fallback" }
  // El servidor no tiene la clave del modelo: la UI solo lo explica en desarrollo
  | { kind: "not_configured" };

// Lo que muestra la UI al visitante: en producción un "no configurado" se ve como un fallo normal
export type NoticeFailure =
  | { kind: "rate_limited"; retryAfterSec: number }
  | { kind: "fallback" }
  | { kind: "dev_not_configured" };

export type RequestReplyResult =
  | { ok: true; reply: string }
  | ({ ok: false } & ChatFailure)
  | { ok: false; kind: "aborted" };

export interface FetchInit {
  method: string;
  headers: Record<string, string>;
  body: string;
  signal: AbortSignal;
}

// Subconjunto de fetch que usa el cliente; permite inyectar uno falso en las pruebas
export type FetchLike = (url: string, init: FetchInit) => Promise<Response>;

export interface RequestReplyOptions {
  fetchImpl?: FetchLike;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export type LinkPart = { type: "text" | "link"; value: string };

export const CHAT_ENDPOINT = "/api/chat";
export const MAX_MESSAGES = 8;
export const MAX_CONTENT_CHARS = 500;
export const MAX_TOTAL_CHARS = 2000;
export const REQUEST_TIMEOUT_MS = 20_000;

const DEFAULT_RETRY_AFTER_SEC = 60;
const MAX_RETRY_AFTER_SEC = 3600;
const MAX_REPLY_CHARS = 2000;

// Mismo conjunto que rechaza el servidor (api/_lib/validation.ts): C0 salvo \t \n \r, DEL y C1
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const EMAIL = /[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+/g;
const PHONE_LIKE = /\+?\d[\d\s().-]{5,}\d/g;
const ISO_DATE = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/;
const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

export const resolveChatLang = (lang?: string | null): ChatLang => (String(lang ?? "").toLowerCase().startsWith("en") ? "en" : "es");

// El modelo no necesita correos ni teléfonos: se enmascaran antes de salir del navegador
export function redactPersonalData(text: string): string {
  return text
    .replace(EMAIL, "[email]")
    .replace(PHONE_LIKE, (match) => {
      const digits = match.replace(/\D/g, "").length;
      if (ISO_DATE.test(match.trim()) || digits < MIN_PHONE_DIGITS || digits > MAX_PHONE_DIGITS) return match;
      return "[phone]";
    });
}

// Solo lo que escribe el visitante se enmascara; las respuestas de Ambar conservan sus enlaces (wa.me/...)
export function cleanContent(text: string, { redact = true }: { redact?: boolean } = {}): string {
  const stripped = text.replace(CONTROL_CHARS, "");
  return (redact ? redactPersonalData(stripped) : stripped).trim().slice(0, MAX_CONTENT_CHARS).trim();
}

// entries: mensajes y avisos en orden cronológico.
// Los avisos locales (error, límite) y los turnos iniciales de Ambar nunca viajan al modelo.
export function buildPayload(entries: readonly ConversationEntry[], lang?: string | null): ChatPayload | null {
  const turns = entries.filter((entry): entry is ChatMessage => entry.role === "user" || entry.role === "assistant");
  // El mensaje inicial de Ambar es local: el modelo exige empezar por un turno del visitante
  const firstUser = turns.findIndex((entry) => entry.role === "user");
  if (firstUser === -1) return null;

  const conversation = turns
    .slice(firstUser)
    .map((entry): ChatMessage => ({ role: entry.role, content: cleanContent(entry.content, { redact: entry.role === "user" }) }))
    .filter((entry) => entry.content.length > 0)
    .slice(-MAX_MESSAGES);

  if (conversation.at(-1)?.role !== "user") return null;

  let total = conversation.reduce((sum, entry) => sum + entry.content.length, 0);
  while (total > MAX_TOTAL_CHARS && conversation.length > 1) {
    total -= conversation.shift()?.content.length ?? 0;
  }
  return { messages: conversation, lang: resolveChatLang(lang) };
}

export const isAssistantErrorCode = (value: unknown): value is AssistantErrorCode =>
  ASSISTANT_ERROR_CODES.some((code) => code === value);

// El cuerpo de error viene de la red: se estrecha sin asumir su forma
function readErrorCode(body: unknown): AssistantErrorCode | null {
  if (typeof body !== "object" || body === null || !("error" in body)) return null;
  return isAssistantErrorCode(body.error) ? body.error : null;
}

function parseRetryAfter(header: string | null): number {
  const seconds = Number.parseInt(header ?? "", 10);
  if (!Number.isFinite(seconds)) return DEFAULT_RETRY_AFTER_SEC;
  return Math.min(Math.max(seconds, 1), MAX_RETRY_AFTER_SEC);
}

// Traduce la respuesta HTTP a un estado de UI; nunca expone el código crudo del servidor
export function mapFailure(status: number, body: unknown, retryAfterHeader: string | null): ChatFailure {
  if (status === 429 || readErrorCode(body) === "RATE_LIMITED") {
    return { kind: "rate_limited", retryAfterSec: parseRetryAfter(retryAfterHeader) };
  }
  if (readErrorCode(body) === "NOT_CONFIGURED") return { kind: "not_configured" };
  return { kind: "fallback" };
}

// isDev llega por parámetro (import.meta.env.DEV) para que esta función siga siendo pura y probable
export function resolveNotice(failure: ChatFailure, isDev: boolean): NoticeFailure {
  if (failure.kind !== "not_configured") return failure;
  return isDev ? { kind: "dev_not_configured" } : { kind: "fallback" };
}

export function formatWait(seconds: number, lang?: string | null): string {
  const en = resolveChatLang(lang) === "en";
  if (seconds < 60) {
    const unit = en ? (seconds === 1 ? "second" : "seconds") : seconds === 1 ? "segundo" : "segundos";
    return `${seconds} ${unit}`;
  }
  const minutes = Math.ceil(seconds / 60);
  const unit = en ? (minutes === 1 ? "minute" : "minutes") : minutes === 1 ? "minuto" : "minutos";
  return `${minutes} ${unit}`;
}

// Regla local sin modelo: solo abre el formulario ante una petición explícita de agendar
const CONSULT_PATTERNS = [
  /\b(agendar|agendame|reservar|programar|solicitar|pedir)\b.*\b(consult|cita|reunion|llamada|videollamada)/,
  /\b(quiero|quisiera|necesito|me gustaria)\b.*\b(consulta|consultoria|cita|reunion|llamada)/,
  /\b(schedule|book|set up|arrange|request)\b.*\b(consult|call|meeting|appointment)/,
  /\b(i want|i need|i'd like|i would like)\b.*\b(consultation|call|meeting|appointment)/,
];

export function detectConsultIntent(text: string): boolean {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return CONSULT_PATTERNS.some((pattern) => pattern.test(normalized));
}

// Separa enlaces https para renderizarlos como <a>; el resto se queda como texto plano
const URL_PATTERN = /(https:\/\/[^\s<>"]+)/g;
const TRAILING_PUNCTUATION = /[.,;:!?)\]]+$/;

const LINK_HOSTS = ["rvargas.dev", "rvdesk.app", "conectando-mas.com"];
// wa.me solo acepta el host exacto: sus subdominios no son de WhatsApp
const EXACT_LINK_HOSTS = ["wa.me"];

const isAllowedLink = (value: string): boolean => {
  try {
    const { protocol, hostname, username, password } = new URL(value);
    if (protocol !== "https:" || username || password) return false;
    return (
      EXACT_LINK_HOSTS.includes(hostname) ||
      LINK_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))
    );
  } catch {
    return false;
  }
};

export function splitLinks(text: string): LinkPart[] {
  const parts: LinkPart[] = [];
  const push = (type: LinkPart["type"], value: string): void => {
    if (value) parts.push({ type, value });
  };
  text
    .split(URL_PATTERN)
    .forEach((chunk, index) => {
      if (index % 2 === 0) return push("text", chunk);
      const trailing = chunk.match(TRAILING_PUNCTUATION)?.[0] ?? "";
      const url = chunk.slice(0, chunk.length - trailing.length);
      push(isAllowedLink(url) ? "link" : "text", url);
      push("text", trailing);
    });

  // Une los trozos de texto contiguos (p. ej. "http://" no es enlace y queda dentro del texto)
  return parts.reduce<LinkPart[]>((merged, part) => {
    const last = merged.at(-1);
    if (last && last.type === "text" && part.type === "text") last.value += part.value;
    else merged.push({ ...part });
    return merged;
  }, []);
}

/** Pide una respuesta a /api/chat; el resultado cubre éxito, límite, degradación y aborto. */
export async function requestReply(
  entries: readonly ConversationEntry[],
  lang?: string | null,
  { fetchImpl = globalThis.fetch, timeoutMs = REQUEST_TIMEOUT_MS, signal }: RequestReplyOptions = {}
): Promise<RequestReplyResult> {
  const payload = buildPayload(entries, lang);
  if (!payload) return { ok: false, kind: "fallback" };

  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort);
  const timer = setTimeout(abort, timeoutMs);

  try {
    const response = await fetchImpl(CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body: unknown = await response.json().catch(() => null);
      return { ok: false, ...mapFailure(response.status, body, response.headers.get("Retry-After")) };
    }

    const data: unknown = await response.json();
    const reply =
      typeof data === "object" && data !== null && "reply" in data && typeof data.reply === "string"
        ? data.reply.trim().slice(0, MAX_REPLY_CHARS)
        : "";
    return reply ? { ok: true, reply } : { ok: false, kind: "fallback" };
  } catch {
    return { ok: false, kind: signal?.aborted ? "aborted" : "fallback" };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
