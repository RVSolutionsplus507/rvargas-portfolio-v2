import { lazy, Suspense, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useTranslation } from "react-i18next";
import useVirtualAssistant from "@/hooks/useVirtualAssistant";
import AssistantIcon from "./AssistantIcon";

// El diálogo (con Radix Dialog y el formulario) solo se descarga la primera vez que se abre
const AssistantDialog = lazy(() => import("./AssistantDialog"));

const VirtualAssistantContainer = () => {
  const { t } = useTranslation("virtualassistant");
  const launcherRef = useRef<HTMLButtonElement>(null);
  const assistant = useVirtualAssistant(launcherRef);
  const [wasOpened, setWasOpened] = useState(false);
  if (assistant.isOpen && !wasOpened) setWasOpened(true);

  return (
    <>
      {/* Zona segura abajo a la derecha: las páginas y App.tsx reservan ~96 px para que no tape contenido */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 md:absolute md:bottom-6 md:right-6">
        {/* Fuera del flujo: al aparecer el saludo no cambia el tamaño del contenedor (evita desplazamiento de layout) */}
        <div aria-live="polite" className="absolute bottom-full right-0 mb-3 flex w-max justify-end">
          <AnimatePresence>
            {assistant.greetingVisible && (
              <m.button
                type="button"
                onClick={(event) => assistant.open(event.currentTarget)}
                onPointerEnter={assistant.pauseGreeting}
                onPointerLeave={assistant.resumeGreeting}
                onFocus={assistant.pauseGreeting}
                onBlur={assistant.resumeGreeting}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, x: 12, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ transformOrigin: "bottom right" }}
                className="pointer-events-auto min-h-11 max-w-[16rem] rounded-2xl rounded-br-sm border border-border bg-card px-4 py-3 text-left text-meta text-card-foreground shadow-lg"
              >
                {t("greeting")}
              </m.button>
            )}
          </AnimatePresence>
        </div>
        {wasOpened && (
          <Suspense
            fallback={
              <p role="status" className="rounded-2xl border border-border bg-card px-4 py-3 text-meta text-card-foreground shadow-lg">
                {t("dialog.loading")}
              </p>
            }
          >
            <AssistantDialog assistant={assistant} />
          </Suspense>
        )}
        <AssistantIcon
          ref={launcherRef}
          label={t("launcher.label")}
          onClick={(event) => assistant.open(event.currentTarget)}
          className="pointer-events-auto"
        />
      </div>
    </>
  );
};

export default VirtualAssistantContainer;
