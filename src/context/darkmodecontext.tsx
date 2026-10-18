import { createContext, use, useState, useEffect } from "react";
import type { ReactNode } from "react";

// Colores de --outer en index.css (mismos valores que public/theme-init.js)
const THEME_COLOR_DARK = '#08110D';
const THEME_COLOR_LIGHT = '#E3EAE5';

export interface DarkModeContextValue {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

// null = sin Provider; useDarkMode lo convierte en error en vez de devolver un valor engañoso
const DarkModeContext = createContext<DarkModeContextValue | null>(null);

const setSecureCookie = (name: string, value: string, days = 30): void => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; SameSite=Strict; Secure; Path=/`;
  };

// Misma lógica que public/theme-init.js (que corre antes del primer paint): si cambias una, cambia la otra
const readInitialMode = (): boolean => {
    try {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode !== null) {
            const parsed: unknown = JSON.parse(savedMode);
            return Boolean(parsed);
        }
    } catch {
        // almacenamiento no disponible o valor corrupto: se usa la preferencia del sistema
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

interface DarkModeProviderProps {
    children: ReactNode;
}

export const DarkModeProvider = ({ children }: DarkModeProviderProps) => {
    const [isDarkMode, setIsDarkMode] = useState(readInitialMode);

    useEffect(() => {
        try {
            localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        } catch {
            // sin almacenamiento la preferencia no persiste, pero el tema se aplica igual
        }
        setSecureCookie('darkMode', JSON.stringify(isDarkMode));

        document.documentElement.classList.toggle('dark', isDarkMode);
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDarkMode ? THEME_COLOR_DARK : THEME_COLOR_LIGHT);
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    return (
        <DarkModeContext value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext>
    );
};

export const useDarkMode = (): DarkModeContextValue => {
    const context = use(DarkModeContext);
    if (context === null) throw new Error('useDarkMode debe usarse dentro de <DarkModeProvider>');
    return context;
};
