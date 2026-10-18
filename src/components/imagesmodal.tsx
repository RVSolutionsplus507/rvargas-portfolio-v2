import { useTranslation } from "react-i18next"
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Galería accesible de capturas: el contenedor (p. ej. el diálogo del detalle) aporta foco y Esc;
// aquí se muestran la imagen, los botones y los puntos; las flechas del teclado las maneja el contenedor
export interface GalleryImage {
  src: string
  alt: string
  width?: number
  height?: number
}

interface ImageGalleryProps {
  images: readonly GalleryImage[]
  index: number
  onIndexChange: (index: number) => void
}

function ImageGallery({ images, index, onIndexChange }: ImageGalleryProps) {
  const { t } = useTranslation("projects")
  const count = images.length
  const current = images[index]
  // Sin imágenes no hay nada que mostrar
  if (!current) return null

  const move = (delta: number) => onIndexChange((index + delta + count) % count)

  return (
    <div role="group" aria-roledescription="carousel" aria-label={t("gallery.label")}>
      <div className="bg-card">
        <img
          key={current.src}
          src={current.src}
          alt={current.alt}
          width={current.width}
          height={current.height}
          loading="lazy"
          decoding="async"
          className="mx-auto max-h-[52vh] w-full object-contain"
        />
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        <p aria-live="polite" className="text-caption text-muted-foreground">
          {t("gallery.position", { current: index + 1, total: count })}
        </p>
        {count > 1 && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => move(-1)} aria-label={t("gallery.prev")}>
              <FaChevronLeft aria-hidden="true" />
            </Button>
            <div className="hidden flex-wrap justify-center sm:flex">
              {images.map((image, position) => (
                <button
                  key={image.src}
                  type="button"
                  aria-label={t("gallery.goTo", { number: position + 1 })}
                  aria-current={position === index}
                  onClick={() => onIndexChange(position)}
                  className="flex h-11 w-7 items-center justify-center rounded-md"
                >
                  <span
                    aria-hidden="true"
                    className={cn("h-2.5 w-2.5 rounded-full", position === index ? "bg-primary" : "bg-foreground/30")}
                  />
                </button>
              ))}
            </div>
            <Button variant="outline" size="icon" className="h-11 w-11" onClick={() => move(1)} aria-label={t("gallery.next")}>
              <FaChevronRight aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageGallery
