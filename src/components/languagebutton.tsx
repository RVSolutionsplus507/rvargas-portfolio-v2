import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

// Banderas en SVG para que no dependan de la fuente de emojis del sistema
const FLAG_BOX = "h-3.5 w-5 shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(128,128,128,0.4)]";

const US_STRIPES = [0, 2, 4, 6, 8, 10, 12];

const FlagEs = () => (
    <svg className={FLAG_BOX} viewBox="0 0 20 14" aria-hidden="true">
        <rect width="20" height="14" fill="#AA151B" />
        <rect y="3.5" width="20" height="7" fill="#F1BF00" />
    </svg>
);

const FlagUs = () => (
    <svg className={FLAG_BOX} viewBox="0 0 20 14" aria-hidden="true">
        <rect width="20" height="14" fill="#fff" />
        {US_STRIPES.map((i) => (
            <rect key={i} y={i * 1.077} width="20" height="1.077" fill="#B22234" />
        ))}
        <rect width="9" height="7.5" fill="#3C3B6E" />
    </svg>
);

interface LanguageButtonProps {
    className?: string;
}

export const LanguageButton = ({ className }: LanguageButtonProps) => {
    const { t, i18n } = useTranslation("sidebar");
    const isEs = i18n.language?.startsWith("es");

    const toggle = () => {
        const next = isEs ? "en" : "es";
        i18n.changeLanguage(next);
        localStorage.setItem("language", next);
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={`${isEs ? "ES" : "EN"}: ${t("switchLanguage")}`}
            className={cn(
                "inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-md px-2 text-sm font-semibold text-foreground transition-colors duration-150 hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
                className
            )}
        >
            {isEs ? <FlagEs /> : <FlagUs />}
            <span aria-hidden="true">{isEs ? "ES" : "EN"}</span>
        </button>
    );
};
