import { useState } from "react";
import type { MouseEventHandler, Ref } from "react";
import ambarPhoto from "@/assets/asistente.webp";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-8 w-8 text-caption",
  md: "h-10 w-10 text-layer-sm",
  lg: "h-14 w-14 text-layer",
};
const BOXES = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" } satisfies Record<keyof typeof SIZES, string>;

// Tamaño en px de la foto: coincide con las clases de SIZES para que width/height reserven el espacio exacto
const PHOTO_PX = { sm: 32, md: 40, lg: 56 } satisfies Record<keyof typeof SIZES, number>;

// Monograma tipográfico de Ambar: una "A" con los tokens de marca; es el respaldo si la foto no carga
export type MonogramSize = keyof typeof SIZES;

interface MonogramProps {
  size?: MonogramSize;
  className?: string;
}

export function Monogram({ size = "md", className }: MonogramProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full border-2 border-primary bg-background font-bold leading-none text-primary",
        SIZES[size],
        className
      )}
    >
      A
    </span>
  );
}

interface AmbarAvatarProps extends MonogramProps {
  /** Vacío cuando junto al avatar ya está escrito el nombre de Ambar (burbujas del chat). */
  alt?: string;
}

// Avatar de Ambar: su foto en círculo; si falla la carga, cae al monograma
export function AmbarAvatar({ size = "md", alt = "Ambar", className }: AmbarAvatarProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Monogram size={size} className={className} />;

  const px = PHOTO_PX[size];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 select-none overflow-hidden rounded-full border-2 border-primary bg-white",
        BOXES[size],
        className
      )}
    >
      <img
        src={ambarPhoto}
        alt={alt}
        width={px}
        height={px}
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
        // La foto es un plano medio: se acerca al rostro para que llene el círculo
        className="h-full w-full origin-[50%_36%] scale-[1.35] object-cover"
      />
    </span>
  );
}

interface AssistantIconProps {
  ref?: Ref<HTMLButtonElement>;
  onClick: MouseEventHandler<HTMLButtonElement>;
  label: string;
  className?: string;
}

const AssistantIcon = ({ ref, onClick, label, className }: AssistantIconProps) => {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label={label}
      className={cn(
        "group relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100",
        className
      )}
    >
      <AmbarAvatar size="lg" />
      {/* Punto "en vivo" estático: es lo único que usa el acento teal */}
      <span
        aria-hidden="true"
        className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-background bg-live"
      />
    </button>
  );
};

export default AssistantIcon;
