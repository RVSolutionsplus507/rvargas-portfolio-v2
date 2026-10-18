import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { m, useReducedMotion } from "motion/react"
import { useTranslation } from "react-i18next"
import { FiArrowUpRight } from "react-icons/fi"
import { useLocation } from "react-router"
import { Button } from "@/components/ui/button"
import ProjectDetail from "@/components/project-detail"
import { AccessPill, ProjectMark, TechBadge } from "@/components/project-parts"
import { cn } from "@/lib/utils"
import { LAYERS, OTHER_PROJECTS, PROJECTS, TECHS, getProjectTechs, localized, resolveLang } from "@/data/portfolio"
import type { BentoCols, Lang, LayerId, Project, ProjectImage, TechId } from "@/data/portfolio"

const ALL = "all"

type LayerFilter = LayerId | typeof ALL
type TechFilter = TechId | typeof ALL

const ALL_PROJECTS: readonly Project[] = [...PROJECTS, ...OTHER_PROJECTS]
const CARD_TECH_LIMIT = 4
const HIGHLIGHT_MS = 4000

const usedTechIds = new Set(ALL_PROJECTS.flatMap((project) => getProjectTechs(project).map((tech) => tech.id)))
// Solo se ofrecen capas y tecnologías que algún proyecto usa, para que ningún filtro quede vacío
const LAYER_OPTIONS = LAYERS.filter((layer) => ALL_PROJECTS.some((project) => project.layers.includes(layer.id)))
const TECH_GROUPS = LAYERS.map((layer) => ({
  layer,
  techs: TECHS.filter((tech) => tech.layer === layer.id && usedTechIds.has(tech.id)),
})).filter((group) => group.techs.length > 0)

// Clases literales (Tailwind no detecta nombres armados): columnas del bento en escritorio y tableta
const LG_COLS: Record<BentoCols, string> = {
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  12: "lg:col-span-12",
}
const MD_COLS = { 3: "md:col-span-3", 6: "md:col-span-6" } as const

const IMAGE_FOCUS: Record<NonNullable<ProjectImage["focus"]>, string> = {
  top: "object-top",
  center: "object-center",
  left: "object-top-left",
  contain: "object-contain p-2",
}

// El valor de un <select> llega como string: solo se acepta un id de tecnología existente
function parseTechFilter(value: string): TechFilter {
  const tech = TECHS.find((candidate) => candidate.id === value)
  return tech ? tech.id : ALL
}

const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

// Al llegar por un ancla (/projects#slug) se resalta la tarjeta unos segundos; el resalte es un anillo fijo, sin animación
function useAnchorHighlight(): string | null {
  const { hash } = useLocation()
  const [expiredHash, setExpiredHash] = useState<string | null>(null)
  const target = hash ? safeDecode(hash.slice(1)) : null
  const isProject = target !== null && ALL_PROJECTS.some((project) => project.slug === target)

  useEffect(() => {
    if (!isProject) return
    const timer = window.setTimeout(() => setExpiredHash(hash), HIGHLIGHT_MS)
    return () => {
      window.clearTimeout(timer)
      setExpiredHash(null)
    }
  }, [hash, isProject])

  return isProject && expiredHash !== hash ? target : null
}

interface ChipButtonProps {
  pressed: boolean
  onClick: () => void
  children: ReactNode
}

function ChipButton({ pressed, onClick, children }: ChipButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full border px-4 text-meta transition-colors",
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input/50 bg-transparent text-foreground hover:bg-accent"
      )}
    >
      {children}
    </button>
  )
}

interface CardMediaProps {
  project: Project
  lang: Lang
  eager: boolean
  wide: boolean
}

// Imagen protagonista de la tarjeta; sin capturas, el icono del proyecto sobre un fondo suave
function CardMedia({ project, lang, eager, wide }: CardMediaProps) {
  const [first] = project.images
  const Icon = project.icon
  if (!first) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-xl bg-foreground/[0.04] lg:aspect-auto lg:min-h-[12rem] lg:flex-1">
        {Icon && <Icon className="h-16 w-16 text-primary" aria-hidden="true" />}
      </div>
    )
  }
  return (
    <div
      className={cn(
        "relative aspect-[16/10] overflow-hidden rounded-xl bg-foreground/[0.04] ring-1 ring-border lg:aspect-auto lg:min-h-[12rem] lg:flex-1",
        wide && "lg:min-h-[16rem]"
      )}
    >
      <img
        src={first.src}
        width={first.width}
        height={first.height}
        alt={localized(first.alt, lang)}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : undefined}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
          IMAGE_FOCUS[first.focus ?? "top"]
        )}
      />
    </div>
  )
}

interface TechChipsProps {
  project: Project
  lang: Lang
  activeTech: TechFilter
}

function TechChips({ project, lang, activeTech }: TechChipsProps) {
  const { t } = useTranslation("projects")
  // La tecnología filtrada va primero para que siempre se vea aunque supere el límite
  const techs = [...getProjectTechs(project)].sort((a, b) => Number(b.id === activeTech) - Number(a.id === activeTech))
  const shown = techs.slice(0, CARD_TECH_LIMIT)
  const hidden = techs.length - shown.length
  return (
    <ul aria-label={t("card.stack")} className="flex flex-wrap gap-1.5">
      {shown.map((tech) => (
        <li key={tech.id}>
          <TechBadge tech={tech} lang={lang} highlighted={tech.id === activeTech} />
        </li>
      ))}
      {hidden > 0 && <li className="px-1 py-1 mono-label text-muted-foreground">{t("card.moreTechs", { count: hidden })}</li>}
    </ul>
  )
}

interface BentoCardProps {
  project: Project
  lang: Lang
  index: number
  dimmed: boolean
  highlighted: boolean
  activeTech: TechFilter
  onOpen: (project: Project, trigger: HTMLElement) => void
}

function BentoCard({ project, lang, index, dimmed, highlighted, activeTech, onOpen }: BentoCardProps) {
  const { t } = useTranslation("projects")
  const reduceMotion = useReducedMotion()
  const wide = project.bento.lg === 12
  const lead = index === 0
  const access = "access" in project ? project.access : undefined
  const titleId = `project-${project.slug}`

  return (
    <m.li
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: Math.min(index % 4, 3) * 0.05 }}
      className={cn("min-w-0", MD_COLS[project.bento.md], LG_COLS[project.bento.lg])}
    >
      <article
        id={project.slug}
        aria-labelledby={titleId}
        className={cn(
          "group relative flex h-full scroll-mt-4 flex-col gap-4 rounded-2xl bg-card p-3 transition-opacity duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring motion-reduce:transition-none",
          wide && "lg:flex-row lg:gap-6",
          dimmed && "opacity-40",
          highlighted && "ring-2 ring-primary"
        )}
      >
        <div className={cn("flex flex-col", wide ? "lg:w-[56%]" : "lg:contents")}>
          <CardMedia project={project} lang={lang} eager={lead} wide={wide} />
        </div>
        <div className={cn("flex flex-col gap-3 px-2 pb-2", wide ? "lg:flex-1 lg:justify-center lg:py-4 lg:pl-0" : "pt-1")}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 id={titleId}>
              <button
                type="button"
                onClick={(event) => onOpen(project, event.currentTarget)}
                className="text-left after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-hidden"
              >
                <ProjectMark project={project} lang={lang} />
                <span className="sr-only">
                  : {t("card.viewDetail")}
                  {dimmed && ` (${t("card.noMatch")})`}
                </span>
              </button>
            </h3>
            {access && <AccessPill access={access} />}
          </div>
          <p className="mono-label text-muted-foreground">{localized(project.kind, lang)}</p>
          <p className={cn("text-meta", lead && "lg:text-body")}>{localized(project.line, lang)}</p>
          <TechChips project={project} lang={lang} activeTech={activeTech} />
          <span aria-hidden="true" className="mt-auto inline-flex items-center gap-1 pt-1 text-meta font-semibold text-primary">
            {t("card.viewDetail")}
            <FiArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </span>
        </div>
      </article>
    </m.li>
  )
}

function ProjectsPage() {
  const { t, i18n } = useTranslation("projects")
  const lang = resolveLang(i18n.language)
  const reduceMotion = useReducedMotion()
  const highlightedSlug = useAnchorHighlight()
  const [layer, setLayer] = useState<LayerFilter>(ALL)
  const [techId, setTechId] = useState<TechFilter>(ALL)
  const [openProject, setOpenProject] = useState<Project | null>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  const matches = (project: Project): boolean =>
    (layer === ALL || project.layers.includes(layer)) &&
    (techId === ALL || getProjectTechs(project).some((tech) => tech.id === techId))
  const matching = ALL_PROJECTS.filter(matches).length
  const isFiltered = layer !== ALL || techId !== ALL

  const resetFilters = () => {
    setLayer(ALL)
    setTechId(ALL)
  }

  const handleOpen = (project: Project, trigger: HTMLElement) => {
    returnFocusRef.current = trigger
    setOpenProject(project)
  }

  return (
    <div className="mx-auto space-y-10 p-2 pb-28 md:space-y-12 lg:p-6 lg:pb-28">
      <m.header
        initial={reduceMotion ? false : { y: 16 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <h1 tabIndex={-1} className="max-w-3xl text-display-sm focus:outline-hidden">{t("page.title")}</h1>
        <p className="max-w-prose text-body text-muted-foreground">{t("page.lead")}</p>
      </m.header>

      <div className="space-y-4">
        <div role="group" aria-label={t("filters.layerGroup")} className="flex flex-wrap gap-2">
          <ChipButton pressed={layer === ALL} onClick={() => setLayer(ALL)}>
            {t("filters.allLayers")}
          </ChipButton>
          {LAYER_OPTIONS.map((option) => (
            <ChipButton key={option.id} pressed={layer === option.id} onClick={() => setLayer(option.id)}>
              {localized(option.name, lang)}
            </ChipButton>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex items-center gap-2">
            <label htmlFor="tech-filter" className="text-meta">
              {t("filters.tech")}
            </label>
            <select
              id="tech-filter"
              value={techId}
              onChange={(event) => setTechId(parseTechFilter(event.target.value))}
              className="min-h-11 rounded-lg border border-input bg-background px-3 text-meta text-foreground"
            >
              <option value={ALL}>{t("filters.allTechs")}</option>
              {TECH_GROUPS.map((group) => (
                <optgroup key={group.layer.id} label={localized(group.layer.name, lang)}>
                  {group.techs.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {localized(tech.name, lang)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          {isFiltered && (
            <Button type="button" variant="ghost" className="min-h-11" onClick={resetFilters}>
              {t("filters.reset")}
            </Button>
          )}
          <p role="status" aria-live="polite" className="text-meta text-muted-foreground">
            {isFiltered
              ? t("filters.matching", { matching, total: ALL_PROJECTS.length })
              : t("filters.total", { count: ALL_PROJECTS.length })}
          </p>
        </div>
        {isFiltered && matching === 0 && <p className="text-body">{t("filters.empty")}</p>}
      </div>

      <section aria-labelledby="projects-list-title">
        <h2 id="projects-list-title" className="sr-only">
          {t("page.listTitle")}
        </h2>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12">
          {ALL_PROJECTS.map((project, index) => (
            <BentoCard
              key={project.id}
              project={project}
              lang={lang}
              index={index}
              dimmed={isFiltered && !matches(project)}
              highlighted={highlightedSlug === project.slug}
              activeTech={techId}
              onOpen={handleOpen}
            />
          ))}
        </ul>
      </section>

      <p className="max-w-prose text-caption text-muted-foreground">{t("page.privacyNote")}</p>

      {openProject && (
        <ProjectDetail
          key={openProject.id}
          project={openProject}
          lang={lang}
          onClose={() => setOpenProject(null)}
          returnFocusRef={returnFocusRef}
        />
      )}
    </div>
  )
}

export default ProjectsPage
