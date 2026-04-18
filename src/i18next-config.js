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

i18next.use(initReactI18next).init({
    interpolation: { escapeValue: false },
    lng: localStorage.getItem("language") || navigator.language,
    fallbackLng: "es",
    resources: {
        es: {
            projects: projectsEs,
            contact: contactEs,
            resume: resumeEs,
            sidebar: sidebarEs,
            aboutme: aboutmeEs,
            whatsapp: whatsappEs
        },
        en: {
            projects: projectsEn,
            contact: contactEn,
            resume: resumeEn,
            sidebar: sidebarEn,
            aboutme: aboutmeEn,
            whatsapp: whatsappEn
        }
    }
});
