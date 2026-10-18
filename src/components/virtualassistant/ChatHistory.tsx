import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { FiRefreshCw } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import Whatsapp from "@/components/whatsapp";
import { cn } from "@/lib/utils";
import type { ChatEntry } from "@/hooks/useVirtualAssistant";
import type { ChatLang } from "@/services/assistantService";
import { formatWait, splitLinks } from "@/services/assistantService";
import { AmbarAvatar } from "./AssistantIcon";

const BUBBLE = "max-w-[85%] whitespace-pre-line break-words rounded-2xl px-3.5 py-2.5 text-meta";
const ACTION = "min-h-11 px-4 text-sm";

const TYPING_DOT_DELAYS_MS = [0, 150, 300];

const REVEAL_TICK_MS = 40;
// Una respuesta larga tarda como máximo esto en aparecer entera
const REVEAL_TARGET_MS = 2400;

// Aviso solo para desarrollo: en producción la constante es null y el texto no entra al bundle
const DEV_NOTICES: Record<ChatLang, string> | null = import.meta.env.DEV
  ? {
      es: "Ambar necesita GEMINI_API_KEY en tu .env (solo en desarrollo); en producción responde con el modelo.",
      en: "Ambar needs GEMINI_API_KEY in your .env (development only); in production she answers with the model.",
    }
  : null;

// Posición (en caracteres) donde termina cada palabra
const wordEnds = (text: string): number[] =>
  Array.from(text.matchAll(/\S+\s*/g), (match) => (match.index ?? 0) + match[0].length);

// El texto completo está en el DOM desde el inicio (lectores de pantalla); solo se oculta visualmente lo que falta por mostrar
function MessageText({ text, visibleChars = text.length }: { text: string; visibleChars?: number }) {
  let offset = 0;
  return splitLinks(text).map((part, index) => {
    const start = offset;
    offset += part.value.length;
    if (part.type === "link") {
      const hidden = offset > visibleChars;
      return (
        <a
          key={index}
          href={part.value}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={hidden ? -1 : undefined}
          className={cn("break-all font-semibold text-primary underline underline-offset-2", hidden && "opacity-0")}
        >
          {part.value}
        </a>
      );
    }
    const cut = Math.min(Math.max(visibleChars - start, 0), part.value.length);
    return (
      <Fragment key={index}>
        {part.value.slice(0, cut)}
        {cut < part.value.length && <span className="opacity-0">{part.value.slice(cut)}</span>}
      </Fragment>
    );
  });
}

interface AssistantTextProps {
  text: string;
  reveal: boolean;
  onRevealDone: () => void;
}

// Efecto de escritura rápido por palabras; con prefers-reduced-motion el texto sale completo
function AssistantText({ text, reveal, onRevealDone }: AssistantTextProps) {
  const reduceMotion = useReducedMotion();
  const animate = reveal && !reduceMotion;
  const ends = useMemo(() => wordEnds(text), [text]);
  const [words, setWords] = useState(0);
  const done = !animate || words >= ends.length;

  useEffect(() => {
    if (!animate) return undefined;
    const perTick = Math.max(1, Math.ceil(ends.length / (REVEAL_TARGET_MS / REVEAL_TICK_MS)));
    const timer = setInterval(() => setWords((current) => Math.min(current + perTick, ends.length)), REVEAL_TICK_MS);
    return () => clearInterval(timer);
  }, [animate, ends.length]);

  useEffect(() => {
    if (reveal && done) onRevealDone();
  }, [reveal, done, onRevealDone]);

  return <MessageText text={text} visibleChars={done ? text.length : (ends[words - 1] ?? 0)} />;
}

type NoticeEntry = Extract<ChatEntry, { role: "notice" }>;

interface NoticeProps {
  entry: NoticeEntry;
  isLast: boolean;
  lang: ChatLang;
  onRetry: () => void | Promise<void>;
  onNavigate: () => void;
}

function Notice({ entry, isLast, lang, onRetry, onNavigate }: NoticeProps) {
  const { t } = useTranslation("virtualassistant");
  const limited = entry.kind === "rate_limited";

  return (
    <li className="flex items-start gap-2">
      <AmbarAvatar size="sm" alt="" />
      <div className="flex max-w-[85%] flex-col gap-3">
        <p className={cn(BUBBLE, "max-w-full border border-border border-l-4 border-l-live bg-card text-card-foreground")}>
          <span className="sr-only">{t("dialog.assistant")}: </span>
          {entry.kind === "rate_limited"
            ? t("errors.rateLimited", { wait: formatWait(entry.retryAfterSec, lang) })
            : entry.kind === "dev_not_configured"
              ? (DEV_NOTICES?.[lang] ?? t("errors.fallback"))
              : t("errors.fallback")}
        </p>
        {isLast && entry.kind !== "dev_not_configured" && (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className={ACTION} onClick={onRetry}>
              <FiRefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              {t("errors.retry")}
            </Button>
            {!limited && (
              <>
                <Button asChild variant="outline" className={ACTION}>
                  <Link to="/contact" onClick={onNavigate}>
                    {t("errors.contactLink")}
                  </Link>
                </Button>
                <Whatsapp className={cn(ACTION, "h-auto gap-2 px-4")}>{t("errors.whatsapp")}</Whatsapp>
              </>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

interface ChatHistoryProps {
  entries: ChatEntry[];
  isProcessing: boolean;
  revealingId: number | null;
  onRevealDone: (id: number) => void;
  onConsult: () => void;
  onRetry: () => void | Promise<void>;
  onNavigate: () => void;
  lang: ChatLang;
}

const ChatHistory = ({ entries, isProcessing, revealingId, onRevealDone, onConsult, onRetry, onNavigate, lang }: ChatHistoryProps) => {
  const { t } = useTranslation("virtualassistant");
  const reduceMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || entries.length === 0) return;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [entries, isProcessing, reduceMotion]);

  const lastIndex = entries.length - 1;

  return (
    // role="log": los mensajes nuevos se anuncian con cortesía; el contenedor existe desde el inicio
    <div
      ref={scrollerRef}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label={t("dialog.log")}
      tabIndex={0}
      className="min-h-0 flex-1 overflow-y-auto px-4 py-4 scrollbar-green"
    >
      <p className="mb-4 text-caption text-muted-foreground">{t("dialog.disclaimer")}</p>

      <ol className="space-y-3">
        {entries.map((entry, index) => {
          if (entry.role === "notice") {
            return (
              <Notice
                key={entry.id}
                entry={entry}
                isLast={index === lastIndex && !isProcessing}
                lang={lang}
                onRetry={onRetry}
                onNavigate={onNavigate}
              />
            );
          }
          if (entry.role === "user") {
            return (
              <li key={entry.id} className="flex justify-end">
                <p className={cn(BUBBLE, "rounded-br-sm bg-primary text-primary-foreground")}>
                  <span className="sr-only">{t("dialog.you")}: </span>
                  {entry.content}
                </p>
              </li>
            );
          }
          return (
            <li key={entry.id} className="flex items-end gap-2">
              <AmbarAvatar size="sm" alt="" />
              <p className={cn(BUBBLE, "rounded-bl-sm border border-border bg-card text-card-foreground")}>
                <span className="sr-only">{t("dialog.assistant")}: </span>
                <AssistantText
                  text={entry.content}
                  reveal={entry.id === revealingId}
                  onRevealDone={() => onRevealDone(entry.id)}
                />
                {entry.action === "consult" && (
                  <>
                    {" "}
                    <button
                      type="button"
                      onClick={onConsult}
                      className="inline-block rounded-sm py-1 font-semibold text-primary underline underline-offset-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {t("consult.openLink")}
                    </button>
                  </>
                )}
              </p>
            </li>
          );
        })}
        {isProcessing && (
          <li className="flex items-end gap-2">
            <AmbarAvatar size="sm" alt="" />
            <p className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3.5">
              <span className="sr-only">{t("dialog.typing")}</span>
              {TYPING_DOT_DELAYS_MS.map((delay) => (
                <span
                  key={delay}
                  aria-hidden="true"
                  style={{ animationDelay: `${delay}ms` }}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground motion-reduce:animate-none"
                />
              ))}
            </p>
          </li>
        )}
      </ol>
    </div>
  );
};

export default ChatHistory;
