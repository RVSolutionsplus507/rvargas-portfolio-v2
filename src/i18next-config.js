import i18next from "i18next";
// import aboutEs from "./traducciones/es/about.json";
// import aboutEn from "./traducciones/en/about.json";
// import contactsEs from "./traducciones/es/contacts.json";
// import contactsEn from "./traducciones/en/contacts.json";
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

i18next.init({
    interpolation: { escapeValue: false },
    lng: localStorage.getItem("language") || navigator.language,
    fallbackLng: "es",
    resources: {
        es: {
            // about: aboutEs,
            // contacts: contactsEs,
            projects: projectsEs,
            contact: contactEs,
            resume: resumeEs,
            sidebar: sidebarEs,
            aboutme: aboutmeEs,
            whatsapp: whatsappEs
        },
        en: {
            // about: aboutEn,
            // contacts: contactsEn,
            projects: projectsEn,
            contact: contactEn,
            resume: resumeEn,
            sidebar: sidebarEn,
            aboutme: aboutmeEn,
            whatsapp: whatsappEn
        }
    }
});
