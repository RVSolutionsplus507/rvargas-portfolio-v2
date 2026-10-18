import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, KeyboardEvent, RefObject, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { detectConsultIntent, MAX_CONTENT_CHARS, requestReply, resolveNotice } from "@/services/assistantService";
import type { ChatMessage, LocalNotice, NoticeFailure } from "@/services/assistantService";
import { OPEN_ASSISTANT_EVENT } from "@/lib/assistantEvents";
import type { OpenAssistantEvent } from "@/lib/assistantEvents";

export type AssistantView = "chat" | "consult";

interface EntryId {
  id: number;
}

// Mensaje de Ambar que ofrece, dentro del texto, abrir el formulario de consulta
type ConsultOffer = { action?: "consult" };

/** Entrada del historial: mensaje del visitante o de Ambar, o aviso local (error o límite) con su motivo. */
export type ChatEntry = (EntryId & ChatMessage & ConsultOffer) | (EntryId & LocalNotice & NoticeFailure);

// Lo que se necesita para crear una entrada: el id lo asigna el hook
type NewEntry = (ChatMessage & ConsultOffer) | (LocalNotice & NoticeFailure);

export interface UseVirtualAssistant {
  isOpen: boolean;
  /** `opener` es el elemento que abre el diálogo; recibe el foco al cerrar. */
  open: (opener?: Element | null) => void;
  close: () => void;
  greetingVisible: boolean;
  pauseGreeting: () => void;
  resumeGreeting: () => void;
  restoreFocus: () => void;
  view: AssistantView;
  showConsult: () => void;
  showChat: () => void;
  draft: string;
  setDraft: Dispatch<SetStateAction<string>>;
  entries: ChatEntry[];
  /** Id del mensaje de Ambar que se está revelando palabra a palabra; null si no hay ninguno. */
  revealingId: number | null;
  finishReveal: (id: number) => void;
  isProcessing: boolean;
  send: (raw: string) => Promise<void>;
  retry: () => Promise<void>;
  handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

const GREETING_DELAY_MS = 2000;
const GREETING_VISIBLE_MS = 6000;
// Al retomar tras una pausa, el saludo se queda al menos este tiempo para que pueda leerse
const GREETING_MIN_RESUME_MS = 1500;
const GREETED_KEY = "ambar:greeted";

// sessionStorage puede no estar disponible (modo privado): sin él, el saludo se repite en cada carga
const hasGreeted = (): boolean => {
  try {
    return sessionStorage.getItem(GREETED_KEY) === "1";
  } catch {
    return false;
  }
};
const markGreeted = (): void => {
  try {
    sessionStorage.setItem(GREETED_KEY, "1");
  } catch {
    // sin almacenamiento no se recuerda
  }
};

// launcherRef lo crea el contenedor: es el botón al que vuelve el foco si no hay otro disparador
const useVirtualAssistant = (launcherRef: RefObject<HTMLButtonElement | null>): UseVirtualAssistant => {
  const { t, i18n } = useTranslation("virtualassistant");

  const [isOpen, setIsOpen] = useState(false);
  const [greetingVisible, setGreetingVisible] = useState(false);
  const [view, setView] = useState<AssistantView>("chat");
  const [draft, setDraft] = useState("");
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [revealingId, setRevealingId] = useState<number | null>(null);

  // El historial vive solo en memoria: nada en localStorage y nada de datos personales hacia el modelo
  const entriesRef = useRef<ChatEntry[]>([]);
  const processingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const idRef = useRef(0);
  const openerRef = useRef<HTMLElement | null>(null);
  // Temporizador del saludo: se pausa mientras el cursor o el foco están sobre él (WCAG 2.2.1)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideStartedAtRef = useRef(0);
  const hideRemainingRef = useRef(GREETING_VISIBLE_MS);
  const hidePausedRef = useRef(false);

  const commitEntries = useCallback((next: ChatEntry[]) => {
    entriesRef.current = next;
    setEntries(next);
  }, []);

  const makeEntry = useCallback((entry: NewEntry): ChatEntry => ({ id: ++idRef.current, ...entry }), []);

  const startHideTimer = useCallback((ms: number) => {
    clearTimeout(hideTimerRef.current ?? undefined);
    hideStartedAtRef.current = Date.now();
    hideRemainingRef.current = ms;
    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null;
      setGreetingVisible(false);
    }, ms);
  }, []);

  const clearHideTimer = useCallback(() => {
    clearTimeout(hideTimerRef.current ?? undefined);
    hideTimerRef.current = null;
    hidePausedRef.current = false;
  }, []);

  const pauseGreeting = useCallback(() => {
    if (hideTimerRef.current === null) return;
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
    hidePausedRef.current = true;
    hideRemainingRef.current = Math.max(hideRemainingRef.current - (Date.now() - hideStartedAtRef.current), 0);
  }, []);

  const resumeGreeting = useCallback(() => {
    if (!hidePausedRef.current) return;
    hidePausedRef.current = false;
    startHideTimer(Math.max(hideRemainingRef.current, GREETING_MIN_RESUME_MS));
  }, [startHideTimer]);

  // Saludo: una vez por sesión, ~2 s tras cargar, visible ~6 s
  useEffect(() => {
    if (hasGreeted()) return undefined;
    const showTimer = setTimeout(() => {
      if (hasGreeted()) return;
      markGreeted();
      setGreetingVisible(true);
      startHideTimer(GREETING_VISIBLE_MS);
    }, GREETING_DELAY_MS);
    return () => {
      clearTimeout(showTimer);
      clearHideTimer();
    };
  }, [startHideTimer, clearHideTimer]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const finishReveal = useCallback((id: number) => {
    setRevealingId((current) => (current === id ? null : current));
  }, []);

  const open = useCallback((opener?: Element | null) => {
    openerRef.current = opener instanceof HTMLElement ? opener : null;
    markGreeted();
    clearHideTimer();
    setGreetingVisible(false);
    setIsOpen(true);

    // Ambar rompe el hielo: es un mensaje local, nunca viaja al modelo (buildPayload descarta los turnos iniciales suyos)
    if (entriesRef.current.length === 0) {
      const opening = makeEntry({ role: "assistant", content: t("dialog.firstMessage") });
      commitEntries([opening]);
      setRevealingId(opening.id);
    }
  }, [clearHideTimer, commitEntries, makeEntry, t]);

  const close = useCallback(() => {
    setIsOpen(false);
    setView("chat");
  }, []);

  // Cualquier parte del sitio puede abrir a Ambar con openAssistant()
  useEffect(() => {
    const onOpen = (event: OpenAssistantEvent) => open(event.detail?.opener);
    window.addEventListener(OPEN_ASSISTANT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, onOpen);
  }, [open]);

  // Devuelve el foco a quien abrió el diálogo; si ya no existe, al lanzador
  const restoreFocus = useCallback(() => {
    const target = openerRef.current?.isConnected ? openerRef.current : launcherRef.current;
    target?.focus();
    openerRef.current = null;
  }, [launcherRef]);

  const ask = useCallback(
    async (conversation: ChatEntry[]) => {
      processingRef.current = true;
      setIsProcessing(true);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Un aborto (desmontaje o una pregunta nueva que reemplaza a esta) no libera: lo hace quien la aborta
      let aborted = false;
      try {
        const result = await requestReply(conversation, i18n.language, { signal: controller.signal });
        if (!result.ok && result.kind === "aborted") {
          aborted = true;
          return;
        }
        const entry: NewEntry = result.ok
          ? { role: "assistant", content: result.reply }
          : { role: "notice", content: "", ...resolveNotice(result, import.meta.env.DEV) };
        const created = makeEntry(entry);
        commitEntries([...entriesRef.current, created]);
        if (result.ok) setRevealingId(created.id);
      } finally {
        if (!aborted) {
          processingRef.current = false;
          setIsProcessing(false);
        }
      }
    },
    [commitEntries, i18n.language, makeEntry]
  );

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, MAX_CONTENT_CHARS);
      if (!text || processingRef.current) return;
      setDraft("");

      const userEntry = makeEntry({ role: "user", content: text });
      if (detectConsultIntent(text)) {
        commitEntries([
          ...entriesRef.current,
          userEntry,
          makeEntry({ role: "assistant", content: t("consult.intro"), action: "consult" }),
        ]);
        return;
      }

      const conversation = [...entriesRef.current, userEntry];
      commitEntries(conversation);
      await ask(conversation);
    },
    [ask, commitEntries, makeEntry, t]
  );

  // Reintenta la última pregunta sin duplicarla: retira el aviso y vuelve a pedir
  const retry = useCallback(async () => {
    if (processingRef.current) return;
    const withoutNotice = entriesRef.current.filter((entry) => entry.role !== "notice");
    commitEntries(withoutNotice);
    await ask(withoutNotice);
  }, [ask, commitEntries]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send(draft);
    }
  };

  return {
    isOpen,
    open,
    close,
    greetingVisible,
    pauseGreeting,
    resumeGreeting,
    restoreFocus,
    view,
    showConsult: () => setView("consult"),
    showChat: () => setView("chat"),
    draft,
    setDraft,
    entries,
    revealingId,
    finishReveal,
    isProcessing,
    send,
    retry,
    handleKeyDown,
  };
};

export default useVirtualAssistant;
