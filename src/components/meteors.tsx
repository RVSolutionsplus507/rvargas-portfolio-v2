import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

// Cielo = franja sobre el contenido (App.tsx reserva ese espacio con padding), así los trazos no cruzan el texto.
// Posiciones fijas: l en % del ancho, t en px desde arriba, d retardo y s duración en segundos.
// Los índices MOBILE_INDEXES son los 3 que se ven en móvil; el resto aparece desde md.
const METEORS = [
    { l: 6, t: 6, d: 0.3, s: 7 },
    { l: 20, t: 28, d: 1.1, s: 9 },
    { l: 34, t: 12, d: 0.6, s: 6 },
    { l: 48, t: 44, d: 0.9, s: 8 },
    { l: 60, t: 10, d: 0.4, s: 10 },
    { l: 72, t: 34, d: 1.4, s: 7 },
    { l: 84, t: 20, d: 0.2, s: 9 },
    { l: 92, t: 50, d: 0.8, s: 6 },
];
const MOBILE_INDEXES = [1, 4, 6];

// Las variables CSS (--l, --t…) no existen en CSSProperties: se admiten las que empiezan con "--"
type MeteorStyle = CSSProperties & Record<`--${string}`, string>;

interface MeteorsProps {
    className?: string;
}

export const Meteors = ({ className }: MeteorsProps) => {
    const ref = useRef<HTMLDivElement>(null);

    // Pausa fuera de vista y con la pestaña oculta; el atributo se escribe directo al DOM para no re-renderizar
    useEffect(() => {
        const node = ref.current;
        if (!node) return undefined;

        let inView = true;
        const apply = () => {
            node.dataset.paused = String(!inView || document.hidden);
        };

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry) return;
            inView = entry.isIntersecting;
            apply();
        });
        observer.observe(node);
        document.addEventListener("visibilitychange", apply);

        return () => {
            observer.disconnect();
            document.removeEventListener("visibilitychange", apply);
        };
    }, []);

    return (
        <div
            ref={ref}
            aria-hidden="true"
            className={cn(
                "meteors pointer-events-none absolute inset-x-0 top-0 z-0 h-16 overflow-hidden md:h-20",
                "[mask-image:linear-gradient(to_bottom,black_45%,transparent)]",
                className
            )}
        >
            {METEORS.map((m, idx) => {
                const style: MeteorStyle = { "--l": `${m.l}%`, "--t": `${m.t}px`, "--d": `${m.d}s`, "--s": `${m.s}s` };
                return (
                    <span
                        key={idx}
                        className={cn("meteor", !MOBILE_INDEXES.includes(idx) && "hidden md:block")}
                        style={style}
                    />
                );
            })}
        </div>
    );
};
