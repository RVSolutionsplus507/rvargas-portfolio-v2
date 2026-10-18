import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { localized } from "@/data/portfolio"
import type { Lang, Project, ProjectAccess, Tech } from "@/data/portfolio"

// Piezas visuales compartidas por la tarjeta del bento y el detalle de un proyecto

interface ProjectMarkProps {
  project: Project
  lang: Lang
  /** Alto del logo y tamaño del nombre. */
  size?: "md" | "lg"
}

/** Logo del proyecto o, si no tiene, su icono y su nombre. */
export function ProjectMark({ project, lang, size = "md" }: ProjectMarkProps) {
  const name = localized(project.name, lang)
  const logo = project.logo
  if (logo) {
    const dimensions = { width: logo.width, height: logo.height }
    const height = size === "lg" ? "h-10" : "h-8"
    // Los logos con variante oscura o de un solo color se adaptan al tema
    const lightClass = cn(height, "w-auto", logo.dark && "dark:hidden", logo.invertOnDark && "dark:invert")
    return (
      <>
        <img src={logo.src} alt={name} {...dimensions} className={lightClass} />
        {logo.dark && <img src={logo.dark} alt={name} {...dimensions} className={cn("hidden w-auto dark:block", height)} />}
      </>
    )
  }
  const Icon = project.icon
  return (
    <span className="inline-flex items-center gap-2.5">
      {Icon && <Icon className={cn("shrink-0 text-primary", size === "lg" ? "h-7 w-7" : "h-6 w-6")} aria-hidden="true" />}
      <span className={cn("font-semibold", size === "lg" ? "text-layer" : "text-layer-sm")}>{name}</span>
    </span>
  )
}

interface AccessPillProps {
  access: ProjectAccess
}

/** Etiqueta sobria del tipo de proyecto: SaaS en vivo o proyecto interno. */
export function AccessPill({ access }: AccessPillProps) {
  const { t } = useTranslation("projects")
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 mono-label",
        access === "live" ? "bg-live/15 text-foreground" : "bg-foreground/[0.07] text-foreground"
      )}
    >
      {access === "live" && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-live" />}
      {t(`card.type.${access}`)}
    </span>
  )
}

interface TechBadgeProps {
  tech: Tech
  lang: Lang
  /** chip: línea corta de la tarjeta; tile: logo grande con nombre, para el detalle. */
  variant?: "chip" | "tile"
  highlighted?: boolean
}

/** Tecnología con su icono o logo. */
export function TechBadge({ tech, lang, variant = "chip", highlighted }: TechBadgeProps) {
  const Icon = tech.icon
  const name = localized(tech.name, lang)
  const isTile = variant === "tile"
  const mark = (
    <>
      <Icon className={cn("shrink-0", isTile ? "h-7 w-7" : "h-3.5 w-3.5")} aria-hidden="true" />
    </>
  )

  if (isTile) {
    return (
      <span className="flex min-h-[4.25rem] w-[5.75rem] flex-col items-center justify-center gap-1.5 rounded-lg bg-foreground/[0.05] px-1 py-2 text-center mono-label text-[0.6875rem] tracking-[0.02em] [overflow-wrap:anywhere] md:text-xs md:tracking-[0.04em]">
        {mark}
        <span className="break-words leading-tight">{name}</span>
      </span>
    )
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mono-label",
        highlighted ? "bg-primary/15 ring-1 ring-primary" : "bg-foreground/[0.06]"
      )}
    >
      {mark}
      {name}
    </span>
  )
}
