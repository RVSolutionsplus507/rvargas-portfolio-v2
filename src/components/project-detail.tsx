import { useState } from "react"
import type { KeyboardEvent, RefObject } from "react"
import { useTranslation } from "react-i18next"
import { FiCheck, FiExternalLink } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import ImageGallery from "@/components/imagesmodal"
import LayerBar from "@/components/layer-bar"
import { AccessPill, ProjectMark, TechBadge } from "@/components/project-parts"
import { getProjectTechs, localized } from "@/data/portfolio"
import type { Lang, Project } from "@/data/portfolio"

interface ProjectDetailProps {
  project: Project
  lang: Lang
  onClose: () => void
  /** Elemento que abrió el detalle: recibe el foco al cerrarlo (Safari no enfoca los botones al hacer clic). */
  returnFocusRef: RefObject<HTMLElement | null>
}

// Detalle de un proyecto en un diálogo (Radix aporta role="dialog", foco atrapado y Esc)
function ProjectDetail({ project, lang, onClose, returnFocusRef }: ProjectDetailProps) {
  const { t } = useTranslation("projects")
  const [index, setIndex] = useState(0)
  const name = localized(project.name, lang)
  const techs = getProjectTechs(project)
  const images = project.images.map((image) => ({
    src: image.src,
    width: image.width,
    height: image.height,
    alt: localized(image.alt, lang),
  }))
  const access = "access" in project ? project.access : undefined
  const company = "internalOf" in project ? project.internalOf : undefined

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (images.length < 2) return
    if (event.key === "ArrowRight") setIndex((value) => (value + 1) % images.length)
    if (event.key === "ArrowLeft") setIndex((value) => (value - 1 + images.length) % images.length)
  }

  const handleCloseAutoFocus = (event: Event) => {
    if (!returnFocusRef.current) return
    event.preventDefault()
    returnFocusRef.current.focus()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        closeLabel={t("detail.close")}
        onKeyDown={handleKeyDown}
        onCloseAutoFocus={handleCloseAutoFocus}
        className="max-h-[92dvh] max-w-[min(58rem,calc(100vw-1.5rem))] gap-0 overflow-y-auto rounded-2xl p-0 sm:rounded-2xl"
      >
        <header className="space-y-3 py-5 pl-5 pr-16">
          <DialogTitle className="leading-none tracking-normal">
            <ProjectMark project={project} lang={lang} size="lg" />
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-2">
            {access && <AccessPill access={access} />}
            <span className="mono-label text-muted-foreground">{localized(project.kind, lang)}</span>
          </div>
          <DialogDescription className="max-w-prose text-body text-foreground">{localized(project.line, lang)}</DialogDescription>
        </header>

        {images.length > 0 && <ImageGallery images={images} index={index} onIndexChange={setIndex} />}

        <div className="grid gap-8 p-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-10 md:p-7">
          <div className="space-y-6">
            <section aria-labelledby="detail-what" className="space-y-2">
              <h3 id="detail-what" className="text-layer-sm">
                {t("detail.what")}
              </h3>
              <p className="max-w-prose text-body">{localized(project.what, lang)}</p>
            </section>
            <section aria-labelledby="detail-how" className="space-y-3">
              <h3 id="detail-how" className="text-layer-sm">
                {t("detail.how")}
              </h3>
              <ul className="space-y-3">
                {project.how.map((step) => (
                  <li key={step.es} className="flex items-start gap-2.5 text-body">
                    <FiCheck className="mt-1.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{localized(step, lang)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="space-y-6">
            <section aria-labelledby="detail-stack" className="space-y-3">
              <h3 id="detail-stack" className="text-layer-sm">
                {t("detail.stack")}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {techs.map((tech) => (
                  <li key={tech.id}>
                    <TechBadge tech={tech} lang={lang} variant="tile" />
                  </li>
                ))}
              </ul>
            </section>
            <LayerBar layers={project.layers} />
            {company && (
              <p className="text-meta text-muted-foreground">{t("detail.internalOf", { company })}</p>
            )}
            {project.url && (
              <Button asChild className="h-auto min-h-11 whitespace-normal py-2 text-left">
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  <FiExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t("card.visit", { name })}
                  <span className="sr-only"> ({t("card.newTab")})</span>
                </a>
              </Button>
            )}
            {project.links && (
              <ul className="flex flex-wrap gap-2">
                {project.links.map((link) => (
                  <li key={link.url}>
                    <Button asChild variant="outline" className="h-auto min-h-11 whitespace-normal py-2 text-left">
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <FiExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
                        {t("card.visit", { name: link.label })}
                        <span className="sr-only"> ({t("card.newTab")})</span>
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectDetail
