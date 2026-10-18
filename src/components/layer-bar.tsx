import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LAYERS, localized, resolveLang } from "@/data/portfolio";
import type { LayerId } from "@/data/portfolio";

// Barra de 5 segmentos: los encendidos son las capas del stack que toca el proyecto o la etapa
interface LayerBarProps {
  layers: readonly LayerId[];
  className?: string;
}

function LayerBar({ layers, className }: LayerBarProps) {
  const { t, i18n } = useTranslation("projects");
  const lang = resolveLang(i18n.language);
  const names = LAYERS.filter((layer) => layers.includes(layer.id)).map((layer) => localized(layer.name, lang));

  return (
    <div role="img" aria-label={t("layerBar.label", { layers: names.join(", ") })} className={cn("flex gap-1", className)}>
      {LAYERS.map((layer) => (
        <span
          key={layer.id}
          aria-hidden="true"
          className={cn("h-1.5 flex-1 rounded-full", layers.includes(layer.id) ? "bg-primary" : "bg-foreground/15")}
        />
      ))}
    </div>
  );
}

export default LayerBar;
