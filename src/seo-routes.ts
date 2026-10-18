// Fuente única de metadatos por ruta: la usan el hook useSeo (runtime) y el plugin de build en vite.config.ts.
// Sin imports a propósito: vite.config.ts lo carga en Node.
export type SeoLang = "es" | "en";

export interface SeoMeta {
  title: string;
  description: string;
}

export const SITE_URL = "https://rvargas.dev";
export const DEFAULT_LANG: SeoLang = "es";
export const DEFAULT_ROUTE = "/aboutme" satisfies SeoRoute;
export const SITE_NAME = "Roberto J. Vargas";

export const SEO_ROUTES = {
  "/aboutme": {
    es: {
      title: "Roberto J. Vargas | Arquitecto de Soluciones Tecnológicas, IA y Full Stack",
      description:
        "Arquitecto de soluciones y líder de tecnología en Panamá. Más de 10 años en TI liderando equipos. Software a medida, integraciones e IA aplicada.",
    },
    en: {
      title: "Roberto J. Vargas | Technology Solutions Architect, AI and Full Stack",
      description:
        "Solutions architect and technology leader in Panama. 10+ years in IT leading teams. Custom software, integrations and applied AI.",
    },
  },
  "/projects": {
    es: {
      title: "Proyectos | Roberto J. Vargas, Arquitecto de Soluciones Tecnológicas",
      description:
        "RVDesk, Haus 360, Ponline y Conectando+: soluciones reales en producción, de la arquitectura y la base de datos a la interfaz, con React, Next.js, Node.js y PostgreSQL.",
    },
    en: {
      title: "Projects | Roberto J. Vargas, Technology Solutions Architect",
      description:
        "RVDesk, Haus 360, Ponline and Conectando+: real solutions in production, from architecture and database to the interface, built with React, Next.js, Node.js and PostgreSQL.",
    },
  },
  "/resume": {
    es: {
      title: "Currículum | Roberto J. Vargas, Arquitecto de Soluciones Tecnológicas",
      description:
        "Currículum de Roberto J. Vargas: desde 2013 en soporte técnico, infraestructura, gerencia de tecnología y arquitectura de soluciones con IA y desarrollo Full Stack. Descarga el CV en español o inglés.",
    },
    en: {
      title: "Resume | Roberto J. Vargas, Technology Solutions Architect",
      description:
        "Resume of Roberto J. Vargas: since 2013 in technical support, infrastructure, technology management and solutions architecture with AI and Full Stack development. Download the CV in English or Spanish.",
    },
  },
  "/contact": {
    es: {
      title: "Contacto | Roberto J. Vargas",
      description:
        "Hablemos de tu proyecto de software a medida, IA o integraciones. Escríbeme por el formulario, por correo o por WhatsApp.",
    },
    en: {
      title: "Contact | Roberto J. Vargas",
      description:
        "Let's talk about your custom software, AI or integration project. Reach me through the form, by email or on WhatsApp.",
    },
  },
} satisfies Record<string, Record<SeoLang, SeoMeta>>;

/** Ruta con metadatos propios (las demás caen en DEFAULT_ROUTE). */
export type SeoRoute = keyof typeof SEO_ROUTES;

export const isSeoRoute = (pathname: string): pathname is SeoRoute => Object.hasOwn(SEO_ROUTES, pathname);

export const routeUrl = (route: string): string => `${SITE_URL}${route}`;
