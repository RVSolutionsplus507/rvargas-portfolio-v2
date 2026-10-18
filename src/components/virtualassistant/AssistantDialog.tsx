import { lazy, Suspense, useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { FiCalendar } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { Dialog, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import type { UseVirtualAssistant } from "@/hooks/useVirtualAssistant";
import { resolveChatLang } from "@/services/assistantService";
import { AmbarAvatar } from "./AssistantIcon";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";

// El formulario arrastra el calendario (react-day-picker + date-fns): se descarga solo al pedir una consulta
const ConsultForm = lazy(() => import("./ConsultForm"));

const COARSE_POINTER = "(pointer: coarse)";

// En móvil el teclado achica el viewport visual: el diálogo sigue esa altura para no tapar el input
function useVisualViewportFit(element: HTMLElement | null): void {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!element || !viewport) return undefined;
    const apply = () => {
      element.style.setProperty("--vv-height", `${viewport.height}px`);
      element.style.setProperty("--vv-top", `${viewport.offsetTop}px`);
    };
    apply();
    viewport.addEventListener("resize", apply);
    viewport.addEventListener("scroll", apply);
    return () => {
      viewport.removeEventListener("resize", apply);
      viewport.removeEventListener("scroll", apply);
    };
  }, [element]);
}

interface AssistantDialogProps {
  assistant: UseVirtualAssistant;
}

const AssistantDialog = ({ assistant }: AssistantDialogProps) => {
  const { t, i18n } = useTranslation("virtualassistant");
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  useVisualViewportFit(content);

  const { isOpen, close, view, restoreFocus } = assistant;

  // En pantalla táctil no se enfoca el input al abrir: el teclado taparía el primer mensaje de Ambar
  const handleOpenAutoFocus = (event: Event): void => {
    event.preventDefault();
    const coarse = window.matchMedia(COARSE_POINTER).matches;
    const target = coarse ? content : content?.querySelector<HTMLElement>("[data-autofocus]");
    (target ?? content)?.focus();
  };

  const handleCloseAutoFocus = (event: Event): void => {
    event.preventDefault();
    restoreFocus();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogPortal>
        <DialogOverlay className="bg-outer/70 motion-reduce:animate-none!" />
        <DialogPrimitive.Content
          ref={setContent}
          tabIndex={-1}
          onOpenAutoFocus={handleOpenAutoFocus}
          onCloseAutoFocus={handleCloseAutoFocus}
          className="fixed inset-x-0 top-0 z-50 flex motion-reduce:animate-none! h-[100dvh] flex-col overflow-hidden border border-border bg-background text-foreground shadow-2xl focus:outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 max-md:top-[var(--vv-top,0px)] max-md:h-[var(--vv-height,100dvh)] md:inset-auto md:bottom-6 md:right-6 md:h-[min(36rem,calc(100dvh-3rem))] md:w-[24rem] md:rounded-2xl md:data-[state=closed]:slide-out-to-bottom-4 md:data-[state=open]:slide-in-from-bottom-4"
        >
          <header className="flex shrink-0 items-center gap-3 border-b border-border py-3 pl-4 pr-2">
            <AmbarAvatar size="md" />
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-layer-sm font-bold leading-tight tracking-normal">
                {t("dialog.title")}
              </DialogTitle>
              <p aria-hidden="true" className="text-caption leading-tight text-muted-foreground">
                {t("dialog.subtitle")}
              </p>
              <DialogDescription className="sr-only">{t("dialog.description")}</DialogDescription>
            </div>
            {view === "chat" && (
              <button
                type="button"
                onClick={assistant.showConsult}
                aria-label={t("dialog.consultButton")}
                title={t("dialog.consultButton")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                <FiCalendar className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
            <DialogPrimitive.Close
              aria-label={t("dialog.close")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              <Cross2Icon className="h-5 w-5" aria-hidden="true" />
            </DialogPrimitive.Close>
          </header>

          {view === "chat" ? (
            <>
              <ChatHistory
                entries={assistant.entries}
                isProcessing={assistant.isProcessing}
                revealingId={assistant.revealingId}
                onRevealDone={assistant.finishReveal}
                onConsult={assistant.showConsult}
                onRetry={assistant.retry}
                onNavigate={close}
                lang={resolveChatLang(i18n.language)}
              />
              <ChatInput
                draft={assistant.draft}
                setDraft={assistant.setDraft}
                onKeyDown={assistant.handleKeyDown}
                onSend={assistant.send}
                isProcessing={assistant.isProcessing}
              />
            </>
          ) : (
            <Suspense
              fallback={
                <p role="status" className="flex flex-1 items-center justify-center text-meta text-muted-foreground">
                  {t("dialog.loading")}
                </p>
              }
            >
              <ConsultForm onBack={assistant.showChat} />
            </Suspense>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

export default AssistantDialog;
