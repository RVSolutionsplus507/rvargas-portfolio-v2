import i18next from "i18next";
// import aboutEs from "./traducciones/es/about.json";
// import aboutEn from "./traducciones/en/about.json";
// import contactsEs from "./traducciones/es/contacts.json";
// import contactsEn from "./traducciones/en/contacts.json";
// import footersEs from "./traducciones/es/footers.json";
// import footersEn from "./traducciones/en/footers.json";
// import heroEs from "./traducciones/es/hero.json";
// import heroEn from "./traducciones/en/hero.json";
// import navbarEs from "./traducciones/es/navbar.json";
// import navbarEn from "./traducciones/en/navbar.json";
// import projectsEs from "./traducciones/es/projects.json";
// import projectsEn from "./traducciones/en/projects.json";
// import reviewsEs from "./traducciones/es/reviews.json";
// import reviewsEn from "./traducciones/en/reviews.json";
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
            // footers: footersEs,
            // hero: heroEs,
            // navbar: navbarEs,
            // projects: projectsEs,
            // reviews: reviewsEs,
            whatsapp: whatsappEs
        },
        en: {
            // about: aboutEn,
            // contacts: contactsEn,
            // footers: footersEn,
            // hero: heroEn,
            // navbar: navbarEn,
            // projects: projectsEn,
            // reviews: reviewsEn,
            whatsapp: whatsappEn
        }
    }
});
