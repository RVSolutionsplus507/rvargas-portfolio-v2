import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import Sidebar, { SidebarEnd } from "./components/Sidebar";
import { Outlet, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { Meteors } from "@/components/meteors";
import VirtualAssistant from "./components/virtualassistant";
import { useSeo } from "@/hooks/useSeo";
import { decodeHashId } from "@/lib/utils";

function App() {
  useSeo();
  const { t } = useTranslation("sidebar");
  const { pathname, hash } = useLocation();
  // El scroll vive en dos contenedores internos (móvil: el exterior; escritorio: el del panel) y el layout
  // persiste entre rutas, así que el navegador no reinicia el scroll ni el foco al navegar
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const mobileHeaderRef = useRef<HTMLDivElement>(null);
  const previousPathRef = useRef(pathname);

  // En móvil la cabecera queda fija arriba: su altura se publica como variable CSS para que el foco y las
  // anclas (scroll-padding-top del contenedor) no queden tapados detrás de ella
  useEffect(() => {
    const header = mobileHeaderRef.current;
    const scroller = mobileScrollRef.current;
    if (!header || !scroller) return;
    const publishHeight = () => scroller.style.setProperty("--mobile-header-h", `${header.offsetHeight}px`);
    publishHeight();
    const observer = new ResizeObserver(publishHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const previous = previousPathRef.current;
    previousPathRef.current = pathname;
    const pathChanged = previous !== pathname;
    if (!pathChanged && !hash) return;
    // Ancla de una página (p. ej. /projects#rvdesk): la página destino pone el id; si no existe se queda arriba
    const anchorId = decodeHashId(hash);
    const anchor = anchorId ? document.getElementById(anchorId) : null;
    if (pathChanged) {
      mobileScrollRef.current?.scrollTo(0, 0);
      desktopScrollRef.current?.scrollTo(0, 0);
      // "/" solo redirige a /aboutme en la carga inicial: ahí no se mueve el foco
      if (previous !== "/") mainRef.current?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
    }
    anchor?.scrollIntoView({ block: "start" });
  }, [pathname, hash]);

  const skipToContent = (event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    mainRef.current?.focus();
  };

  return (
    <div
      ref={mobileScrollRef}
      className="relative h-dvh w-full overflow-y-auto overflow-x-hidden bg-outer max-md:scroll-pt-[calc(var(--mobile-header-h,0px)+1.25rem)] md:overflow-hidden"
    >
      <a
        href="#contenido"
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:flex focus:min-h-11 focus:items-center focus:rounded-md focus:bg-primary focus:px-4 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>
      <div className="container mx-auto relative flex items-center justify-center h-auto md:h-full py-6 px-4 md:px-6">
        <div className="max-w-7xl w-full flex flex-col md:flex-row gap-6 md:h-full">
          {/* Móvil: cabecera fija arriba (opaca, bajo el diálogo z-50 y el lanzador de Ambar z-40); escritorio: no genera caja */}
          <div className="sticky -top-5 z-30 -mb-2 -mt-6 bg-outer pb-2 pt-6 md:contents">
            <div
              ref={mobileHeaderRef}
              className="w-full md:w-64 bg-background border border-border px-3.5 pb-1.5 pt-3.5 md:px-5 md:py-6 rounded-3xl md:h-full"
            >
              <Sidebar />
            </div>
          </div>
          <div className="flex-1 bg-background border border-border w-full rounded-3xl flex flex-col md:h-full relative">
            <div ref={desktopScrollRef} className="flex-1 overflow-x-hidden md:overflow-y-auto p-4 z-10 relative scrollbar-green max-w-full">
              {/* pb-24: zona segura de Ambar (lanzador fijo abajo a la derecha) sobre el pie móvil */}
              <div className="w-full mx-auto relative z-10 pt-10 pb-24 md:pt-6 md:pb-0">
                <main id="contenido" ref={mainRef} tabIndex={-1} className="focus:outline-hidden">
                  <Outlet />
                </main>
                <SidebarEnd />
              </div>
              <Meteors />
            </div>
            {/* Asistente Virtual: en escritorio ancla al panel; en móvil, al viewport */}
            <VirtualAssistant />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
