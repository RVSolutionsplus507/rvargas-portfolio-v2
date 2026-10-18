import { useState, useSyncExternalStore } from "react";
import { m, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { FiArrowUpRight, FiChevronRight, FiMessageCircle } from "react-icons/fi";
import { LuPlus } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { openAssistant } from "@/lib/assistantEvents";
import { LAYERS, PROJECTS, TECHS, localized, resolveLang } from "@/data/portfolio";
import type { FeaturedProject, Lang, LayerId, ProjectId, Tech, TechId } from "@/data/portfolio";

// Bandas de arriba (IA) a abajo (infraestructura = cimiento); cada una un paso más oscura
const BAND_BG = [
  "bg-[hsl(var(--band-0))]",
  "bg-[hsl(var(--band-1))]",
  "bg-[hsl(var(--band-2))]",
  "bg-[hsl(var(--band-3))]",
  "bg-[hsl(var(--band-4))]",
];
const DEFAULT_OPEN_LAYERS: LayerId[] = ["ai", "frontend"];
const DESKTOP_QUERY = "(min-width: 768px)";

const subscribeDesktop = (onChange: () => void) => {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const getDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;
const useIsDesktop = () => useSyncExternalStore(subscribeDesktop, getDesktop, () => true);

// Selección activa (fijada o en vista previa)
type Selection = { kind: "tech"; id: TechId } | { kind: "project"; id: ProjectId };

const isSameSelection = (a: Selection, b: Selection): boolean => a.kind === b.kind && a.id === b.id;

interface Lit {
  techs: Set<TechId>;
  projects: Set<ProjectId>;
}

interface TileState {
  pinned: boolean;
  lit: boolean;
  dim: boolean;
}

interface TileHandlers {
  onPreview: (on: boolean) => void;
  onPin: () => void;
}

// Qué ilumina la selección activa
const resolveLit = (active: Selection | null): Lit | null => {
  if (!active) return null;
  if (active.kind === "tech") {
    const tech = TECHS.find((item) => item.id === active.id);
    return { techs: new Set([active.id]), projects: new Set(tech?.projects ?? []) };
  }
  return {
    techs: new Set(TECHS.filter((tech) => tech.projects.includes(active.id)).map((tech) => tech.id)),
    projects: new Set([active.id]),
  };
};

const FOCUS_RING = "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring";

interface TechTileProps extends TileHandlers {
  tech: Tech;
  lang: Lang;
  state: TileState;
}

function TechTile({ tech, lang, state, onPreview, onPin }: TechTileProps) {
  const Icon = tech.icon;
  const name = localized(tech.name, lang);
  return (
    <button
      type="button"
      aria-pressed={state.pinned}
      onClick={onPin}
      onPointerEnter={(event) => event.pointerType === "mouse" && onPreview(true)}
      onPointerLeave={() => onPreview(false)}
      onFocus={() => onPreview(true)}
      onBlur={() => onPreview(false)}
      className={cn(
        "flex min-h-[4.25rem] flex-col items-center justify-center gap-1.5 rounded-lg px-1 py-2 text-center mono-label text-[0.6875rem] tracking-[0.02em] [overflow-wrap:anywhere] md:text-xs md:tracking-[0.04em] transition-[opacity,background-color] duration-150",
        "w-[calc((100%-1.875rem)/4)] md:w-[5.75rem]",
        FOCUS_RING,
        state.pinned
          ? "bg-primary text-primary-foreground"
          : state.lit
            ? "bg-primary/15 text-foreground ring-2 ring-primary"
            : "bg-foreground/[0.05] text-foreground hover:bg-foreground/10",
        state.dim && "opacity-50"
      )}
    >
      <Icon className="h-7 w-7 shrink-0" aria-hidden="true" />
      <span className="break-words leading-tight">{name}</span>
    </button>
  );
}

// Tile final del stack de IA y automatización: indica que la lista es abierta, no es interactivo
function MoreTile({ label }: { label: string }) {
  return (
    <div className="flex min-h-[4.25rem] w-[calc((100%-1.875rem)/4)] flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-1 py-2 text-center mono-label text-[0.6875rem] tracking-[0.02em] [overflow-wrap:anywhere] md:text-xs md:tracking-[0.04em] text-muted-foreground md:w-[5.75rem]">
      <LuPlus className="h-7 w-7 shrink-0" aria-hidden="true" />
      <span className="leading-tight">{label}</span>
    </div>
  );
}

interface ProjectBadgeProps {
  project: FeaturedProject;
  state: Pick<TileState, "lit" | "dim">;
  onPreview: (on: boolean) => void;
}

// Enlace a la ficha del proyecto; al pasar el cursor o enfocarlo ilumina las tecnologías que usa
function ProjectBadge({ project, state, onPreview }: ProjectBadgeProps) {
  return (
    <Link
      to={`/projects#${project.slug}`}
      onPointerEnter={(event) => event.pointerType === "mouse" && onPreview(true)}
      onPointerLeave={() => onPreview(false)}
      onFocus={() => onPreview(true)}
      onBlur={() => onPreview(false)}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full py-1.5 pl-2 pr-3.5 text-meta font-semibold text-foreground transition-[opacity,background-color] duration-150",
        FOCUS_RING,
        state.lit ? "bg-primary/15 ring-2 ring-primary" : "bg-card hover:bg-accent",
        state.dim && "opacity-50"
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-bold text-primary-foreground"
      >
        {project.name.charAt(0)}
      </span>
      {project.name}
      <FiArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
}

function Stack() {
  const { t, i18n } = useTranslation("aboutme");
  const lang = resolveLang(i18n.language);
  const isDesktop = useIsDesktop();
  const reduceMotion = useReducedMotion();
  const [pinned, setPinned] = useState<Selection | null>(null);
  const [previewed, setPreviewed] = useState<Selection | null>(null);
  const [openLayers, setOpenLayers] = useState<LayerId[]>(DEFAULT_OPEN_LAYERS);

  const active = previewed ?? pinned;
  const lit = resolveLit(active);

  const preview = (selection: Selection) => (on: boolean) => setPreviewed(on ? selection : null);
  const pin = (selection: Selection) => () =>
    setPinned((current) => (current && isSameSelection(current, selection) ? null : selection));
  const isPinned = (selection: Selection) => pinned !== null && isSameSelection(pinned, selection);

  const toggleLayer = (id: LayerId) =>
    setOpenLayers((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

  let status = t("stack.hint");
  if (active && lit) {
    if (active.kind === "tech") {
      const tech = TECHS.find((item) => item.id === active.id);
      if (tech) {
        const users = PROJECTS.filter((project) => lit.projects.has(project.id)).map((project) => project.name);
        const techName = localized(tech.name, lang);
        status = users.length
          ? t("stack.techUsedBy", { tech: techName, projects: users.join(", ") })
          : t(tech.example ? "stack.techExample" : "stack.techNoProjects", { tech: techName });
      }
    } else {
      const project = PROJECTS.find((item) => item.id === active.id);
      if (project) status = t("stack.projectUses", { project: project.name, count: lit.techs.size });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-layer-sm font-semibold">{t("stack.projectsTitle")}</h3>
        <ul className="flex flex-wrap gap-2">
          {PROJECTS.map((project) => (
            <li key={project.id}>
              <ProjectBadge
                project={project}
                state={{
                  lit: Boolean(lit?.projects.has(project.id)),
                  dim: lit !== null && !lit.projects.has(project.id),
                }}
                onPreview={preview({ kind: "project", id: project.id })}
              />
            </li>
          ))}
        </ul>
        <p role="status" aria-live="polite" className="mt-3 min-h-[3rem] text-meta text-muted-foreground md:min-h-[1.5rem]">
          {status}
        </p>
      </div>

      <div className="-mx-4 overflow-hidden border-y border-border md:mx-0 md:rounded-2xl md:border">
        {LAYERS.map((layer, index) => {
          const techs = TECHS.filter((tech) => tech.layer === layer.id);
          const open = isDesktop || openLayers.includes(layer.id);
          const litCount = lit ? techs.filter((tech) => lit.techs.has(tech.id)).length : 0;
          const panelId = `stack-layer-${layer.id}`;
          const name = localized(layer.name, lang);
          const heading = (
            <span className="flex items-baseline gap-2">
              <span className="text-layer-sm font-semibold md:text-layer">{name}</span>
              {!open && litCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-caption font-semibold text-primary-foreground">
                  {litCount}
                  <span className="sr-only"> {t("stack.litInLayer")}</span>
                </span>
              )}
            </span>
          );

          return (
            <m.section
              key={layer.id}
              aria-labelledby={`${panelId}-title`}
              initial={reduceMotion ? false : { y: 12 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.1 }}
              className={cn("px-4 py-4 md:px-6 md:py-6", BAND_BG[index], index > 0 && "border-t border-border")}
            >
              <h3 id={`${panelId}-title`} className="m-0">
                {isDesktop ? (
                  heading
                ) : (
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => toggleLayer(layer.id)}
                    className={cn(
                      "flex min-h-11 w-full items-center justify-between gap-3 rounded-md text-left",
                      FOCUS_RING
                    )}
                  >
                    {heading}
                    <FiChevronRight
                      className={cn("h-5 w-5 shrink-0 transition-transform duration-200", open && "rotate-90")}
                      aria-hidden="true"
                    />
                  </button>
                )}
              </h3>
              <div id={panelId} hidden={!open} className="mt-2">
                <p className="max-w-prose text-meta text-muted-foreground">{t(`stack.layers.${layer.id}`)}</p>
                {layer.id === "ai" && (
                  <Button
                    type="button"
                    variant="outline"
                    aria-haspopup="dialog"
                    aria-label={t("stack.ambarCtaLabel")}
                    onClick={(event) => openAssistant(event.currentTarget)}
                    className="mt-3 min-h-11 gap-2 border-live px-4 text-sm text-foreground"
                  >
                    <FiMessageCircle className="h-4 w-4 text-live" aria-hidden="true" />
                    {t("stack.ambarCta")}
                  </Button>
                )}
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {techs.map((tech) => (
                    <TechTile
                      key={tech.id}
                      tech={tech}
                      lang={lang}
                      state={{
                        pinned: isPinned({ kind: "tech", id: tech.id }),
                        lit: Boolean(lit?.techs.has(tech.id)),
                        dim: lit !== null && !lit.techs.has(tech.id),
                      }}
                      onPreview={preview({ kind: "tech", id: tech.id })}
                      onPin={pin({ kind: "tech", id: tech.id })}
                    />
                  ))}
                  {layer.id === "ai" && <MoreTile label={t("stack.more")} />}
                </div>
                {layer.id === "ai" && (
                  <p className="mt-3 max-w-prose text-meta text-muted-foreground">{t("stack.examples")}</p>
                )}
              </div>
            </m.section>
          );
        })}
      </div>
    </div>
  );
}

export default Stack;
