import { useRef } from "react";
import { m, useInView, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { LAYERS, localized, resolveLang } from "@/data/portfolio";
import type { LayerId } from "@/data/portfolio";

// Cada paso nombra las capas del stack que lo hacen posible (ids de LAYERS)
interface Step {
  id: string;
  layers: readonly LayerId[];
}

const STEPS: readonly Step[] = [
  { id: "mail", layers: ["backend"] },
  { id: "verify", layers: ["backend"] },
  { id: "ai", layers: ["ai"] },
  { id: "board", layers: ["frontend", "backend"] },
  { id: "quote", layers: ["ai"] },
  { id: "visit", layers: ["ai"] },
  { id: "portal", layers: ["frontend"] },
];
const RUN_SECONDS = 2.6;
const lastIndex = STEPS.length - 1;

// Un solo recorrido: el meteoro baja por el riel una vez y cada paso se enciende cuando lo cruza
function RvdeskMap() {
  const { t, i18n } = useTranslation("aboutme");
  const lang = resolveLang(i18n.language);
  const reduceMotion = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const inView = useInView(listRef, { once: true, amount: 0.25 });
  const animate = !reduceMotion;

  return (
    <div className="space-y-6">
      <p className="max-w-prose text-body text-muted-foreground">{t("rvdesk.flowIntro")}</p>

      {/* El riel y el meteoro son decorativos: viven fuera de la <ol> para que sus hijos directos sean solo <li> */}
      <div className="relative">
        <span aria-hidden="true" className="absolute bottom-6 left-5 top-5 w-px -translate-x-1/2 bg-border" />
        {animate && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-6 left-5 top-5 w-0.5 -translate-x-1/2 overflow-hidden"
          >
            <m.span
              className="absolute left-0 top-0 block h-1/4 w-full bg-linear-to-b from-transparent to-primary after:absolute after:bottom-0 after:left-1/2 after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:rounded-full after:bg-primary after:shadow-[0_0_8px_2px_hsl(var(--primary)/0.6)]"
              initial={{ y: "-100%" }}
              animate={inView ? { y: "400%" } : { y: "-100%" }}
              transition={{ duration: RUN_SECONDS, ease: "linear" }}
            />
          </span>
        )}

        <ol ref={listRef} aria-label={t("rvdesk.flowLabel")} className="relative">
          {STEPS.map((step, index) => (
            <li
              key={step.id}
              className="relative grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-2 pb-7 last:pb-0 md:grid-cols-[2.5rem_1fr_auto]"
            >
              {/* Escala en vez de opacidad: el texto atenuado no cumpliría el contraste mínimo mientras espera */}
              <m.span
                aria-hidden="true"
                initial={animate ? { scale: 0.7 } : false}
                animate={animate && inView ? { scale: 1 } : undefined}
                transition={{ duration: 0.4, delay: (index / lastIndex) * RUN_SECONDS * 0.85 }}
                className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-body font-bold text-primary-foreground"
              >
                {index + 1}
              </m.span>
              <div>
                <h3 className="text-layer-sm font-semibold">{t(`rvdesk.steps.${step.id}.title`)}</h3>
                <p className="mt-1 max-w-prose text-meta text-muted-foreground">
                  {t(`rvdesk.steps.${step.id}.desc`)}
                </p>
              </div>
              <ul
                aria-label={t("rvdesk.layersLabel")}
                className="col-start-2 flex flex-wrap items-start gap-1.5 md:col-start-3 md:justify-end"
              >
                {step.layers.map((layerId) => {
                  const layer = LAYERS.find((item) => item.id === layerId);
                  if (!layer) return null;
                  return (
                    <li
                      key={layerId}
                      className="rounded-full bg-card px-2.5 py-1 mono-label text-foreground"
                    >
                      {localized(layer.name, lang)}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default RvdeskMap;
