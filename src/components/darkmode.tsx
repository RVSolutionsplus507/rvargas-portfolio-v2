import { useTranslation } from "react-i18next";
import { FiMoon, FiSun } from "react-icons/fi";
import { useDarkMode } from "@/context/darkmodecontext";
import { cn } from "@/lib/utils";
import "@/css/darkmode.css";

// Interruptor sin caja ni borde: solo el icono; el estado se comunica con aria-checked y el icono visible
interface DarkmodeProps {
    className?: string;
}

export const Darkmode = ({ className = "" }: DarkmodeProps) => {
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const { t } = useTranslation("sidebar");

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isDarkMode}
            aria-label={t("darkMode")}
            onClick={toggleDarkMode}
            className={cn(
                "theme-toggle inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors duration-150 hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
                className
            )}
        >
            <span className="theme-toggle__icons" aria-hidden="true">
                <FiMoon className="theme-toggle__icon theme-toggle__icon--moon h-5 w-5" />
                <FiSun className="theme-toggle__icon theme-toggle__icon--sun h-5 w-5" />
            </span>
        </button>
    );
};
