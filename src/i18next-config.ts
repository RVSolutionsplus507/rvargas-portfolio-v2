import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import projectsEs from "./traducciones/es/projects.json";
import projectsEn from "./traducciones/en/projects.json";
import contactEs from "./traducciones/es/contact.json";
import contactEn from "./traducciones/en/contact.json";
import resumeEs from "./traducciones/es/resume.json";
import resumeEn from "./traducciones/en/resume.json";
import sidebarEs from "./traducciones/es/sidebar.json";
import sidebarEn from "./traducciones/en/sidebar.json";
import aboutmeEs from "./traducciones/es/aboutme.json";
import aboutmeEn from "./traducciones/en/aboutme.json";
import whatsappEs from "./traducciones/es/whatsapp.json";
import whatsappEn from "./traducciones/en/whatsapp.json";
import virtualassistantEs from "./traducciones/es/virtualassistant.json";
import virtualassistantEn from "./traducciones/en/virtualassistant.json";
import errorpageEs from "./traducciones/es/errorpage.json";
import errorpageEn from "./traducciones/en/errorpage.json";

// localStorage puede lanzar (modo privado, almacenamiento bloqueado)
function readStoredLanguage(): string | null {
    try {
        return localStorage.getItem("language");
    } catch {
        return null;
    }
}

i18next.use(initReactI18next).init({
    interpolation: { escapeValue: false },
    lng: readStoredLanguage() || navigator.language,
    fallbackLng: "es",
    resources: {
        es: {
            projects: projectsEs,
            contact: contactEs,
            resume: resumeEs,
            sidebar: sidebarEs,
            aboutme: aboutmeEs,
            whatsapp: whatsappEs,
            virtualassistant: virtualassistantEs,
            errorpage: errorpageEs
        },
        en: {
            projects: projectsEn,
            contact: contactEn,
            resume: resumeEn,
            sidebar: sidebarEn,
            aboutme: aboutmeEn,
            whatsapp: whatsappEn,
            virtualassistant: virtualassistantEn,
            errorpage: errorpageEn
        }
    }
});
