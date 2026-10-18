import { createElement } from "react";
import type { IconType } from "react-icons";
import { DiScrum } from "react-icons/di";
import { FaWindows } from "react-icons/fa";
import { LuBraces, LuCreditCard, LuListTodo, LuNetwork, LuServer, LuWorkflow } from "react-icons/lu";
import {
  SiAsterisk,
  SiAstro,
  SiBetterauth,
  SiClerk,
  SiCloudflare,
  SiDocker,
  SiExpo,
  SiExpress,
  SiFirebase,
  SiFlask,
  SiFramer,
  SiGit,
  SiGithub,
  SiGithubactions,
  SiJavascript,
  SiJest,
  SiJira,
  SiJsonwebtokens,
  SiLinux,
  SiApple,
  SiMikrotik,
  SiNextdotjs,
  SiNodedotjs,
  SiOpenrouter,
  SiPnpm,
  SiPostgresql,
  SiPrisma,
  SiProxmox,
  SiPython,
  SiQuickbooks,
  SiRadixui,
  SiRailway,
  SiReact,
  SiReactquery,
  SiReacthookform,
  SiRedis,
  SiResend,
  SiSap,
  SiShadcnui,
  SiSocketdotio,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiVite,
  SiVitest,
  SiWhatsapp,
  SiXero,
  SiZod,
  SiZoho,
} from "react-icons/si";
import { TbBrandAws, TbBrandMysql, TbCpu, TbLayoutKanban } from "react-icons/tb";
import rvdeskLogo from "@/assets/rvdesk-logo.svg";
import rvdeskLogoDark from "@/assets/rvdesk-logo-dark.svg";
import rvdeskHero from "@/assets/projects/rvdesk/hero.webp";
import rvdeskFlow from "@/assets/projects/rvdesk/correo-a-tablero.webp";
import rvdeskFeatures from "@/assets/projects/rvdesk/funciones.webp";
import rvdeskQuotes from "@/assets/projects/rvdesk/cotizaciones-visitas.webp";
import rvdeskIntegrations from "@/assets/projects/rvdesk/integraciones.webp";
import rvdeskMobile from "@/assets/projects/rvdesk/movil.webp";
import conectandoLogo from "@/assets/projects/conectando/logo.webp";
import conectandoHero from "@/assets/projects/conectando/hero.webp";
import conectandoGame from "@/assets/projects/conectando/partida.webp";
import conectandoPlans from "@/assets/projects/conectando/planes.webp";
import conectandoCreate from "@/assets/projects/conectando/crear-partida.webp";
import conectandoAdmin from "@/assets/projects/conectando/admin-paquetes.webp";
import haus360Logo from "@/assets/projects/haus-360/logo.webp";
import hausPanel from "@/assets/projects/haus-360/panel.webp";
import hausCalendar from "@/assets/projects/haus-360/calendario.webp";
import hausPortal from "@/assets/projects/haus-360/portal-cliente.webp";
import hausLogin from "@/assets/projects/haus-360/acceso.webp";
import ponlinePanel from "@/assets/projects/ponline/panel.webp";
import ponlineAudit from "@/assets/projects/ponline/auditoria.webp";
import ponlineAutopay from "@/assets/projects/ponline/pago-automatico.webp";
import ponlineLogin from "@/assets/projects/ponline/acceso.webp";
import fiscalReports from "@/assets/projects/rvsfiscal/reportes.webp";
import fiscalDashboard from "@/assets/projects/rvsfiscal/panel-control.webp";
import fiscalLogin from "@/assets/projects/rvsfiscal/acceso.webp";
import sitesAstre from "@/assets/projects/sitios-astro/astre-hero.webp";
import sitesAlmacenajes from "@/assets/projects/sitios-astro/almacenajes-hero.webp";
import sitesHaus from "@/assets/projects/sitios-astro/haus-hero.webp";
import lawSite from "@/assets/projects/sitio-despacho/inicio.webp";

// Fuente única del stack y de los proyectos destacados (la usan About Me y, en la fase 3, Projects).
// Regla: solo hay tecnologías con evidencia (CV, resume.json o fichas de los proyectos).
// Toda tecnología lleva un `icon` monocromo (react-icons o glifo propio): lo valida portfolio.test.ts.

export type Lang = "es" | "en";
/** Texto traducido: ES y EN siempre juntos. */
export type Localized = Record<Lang, string>;
/** Acepta string (nombre propio, igual en ambos idiomas) o { es, en }. */
export type LocalizedText = string | Localized;

export const resolveLang = (lang?: string | null): Lang => (lang?.toLowerCase().startsWith("en") ? "en" : "es");

export const localized = (value: LocalizedText, lang?: string | null): string =>
  typeof value === "string" ? value : value[resolveLang(lang)];

export type LayerId = "ai" | "frontend" | "backend" | "tools" | "infra";

export interface Layer {
  id: LayerId;
  name: Localized;
}

export const LAYERS: readonly Layer[] = [
  { id: "ai", name: { es: "IA y automatización", en: "AI and automation" } },
  { id: "frontend", name: { es: "Frontend y mobile", en: "Frontend and mobile" } },
  { id: "backend", name: { es: "Backend y datos", en: "Backend and data" } },
  { id: "tools", name: { es: "Herramientas y operación", en: "Tooling and operations" } },
  { id: "infra", name: { es: "Infraestructura y cloud", en: "Infrastructure and cloud" } },
];

export const PROJECT_IDS = {
  rvdesk: "rvdesk",
  haus360: "haus360",
  ponline: "ponline",
  conectando: "conectando",
} as const;

/** Id de un proyecto destacado (valores de PROJECT_IDS). */
export type ProjectId = (typeof PROJECT_IDS)[keyof typeof PROJECT_IDS];

const { rvdesk, haus360, ponline, conectando } = PROJECT_IDS;
const ALL_PROJECTS = [rvdesk, haus360, ponline, conectando] as const;

// Glifos monocromos (currentColor) de marcas que react-icons no trae; mismo viewBox que el resto del stack.
// El sentido horario del trazo rellena y el antihorario perfora (ojos y nariz del oso).
const glyph = (path: string, viewBox = "0 0 24 24"): IconType =>
  function Glyph({ className }) {
    return createElement("svg", { viewBox, fill: "currentColor", className, "aria-hidden": true }, createElement("path", { d: path }));
  };

const ZustandIcon = glyph(
  "M3 13.5a9 9 0 1 1 18 0a9 9 0 1 1-18 0zM4.5 4.2a3.2 3.2 0 1 1 6.4 0a3.2 3.2 0 1 1-6.4 0zM13.1 4.2a3.2 3.2 0 1 1 6.4 0a3.2 3.2 0 1 1-6.4 0zM8 11.3a1.1 1.1 0 1 0 2.2 0a1.1 1.1 0 1 0-2.2 0zM13.8 11.3a1.1 1.1 0 1 0 2.2 0a1.1 1.1 0 1 0-2.2 0zM12 17.4a2 1.4 0 1 0 0-2.8a2 1.4 0 1 0 0 2.8z"
);
// Logotipo oficial de Yappy (silueta monocroma, viewBox propio 200x173).
const YappyIcon = glyph(
  "M40.4719 31.2405C51.6298 33.4176 65.7197 34.6707 83.1908 56.2169C83.5564 55.9733 81.5375 48.8478 84.2337 46.6329C87.5649 43.8965 94.6322 45.9324 95.7765 43.5224C97.573 37.4777 59.5003 25.5448 40.4719 31.2405Z M42.8409 31.6883C42.0367 31.5388 41.2468 31.3919 40.4712 31.2405C42.7422 30.5608 45.2845 30.1321 47.998 29.9146C46.8259 29.9832 45.646 30.1125 44.4618 30.3051C25.789 33.341 13.1128 50.9395 16.1488 69.6124C19.1848 88.2852 36.7833 100.961 55.4561 97.9254C74.1289 94.8894 86.8051 77.2909 83.7691 58.6181C83.6241 57.7263 83.4459 56.8482 83.236 55.9849C83.2371 56.1142 83.2237 56.1946 83.1901 56.217C66.9336 36.1687 53.6045 33.6899 42.8409 31.6883Z M150.964 76.5871C138.86 72.4897 123.351 68.9823 107.116 42.3606C106.672 42.5773 107.853 50.818 104.518 52.8815C100.396 55.4309 92.828 52.1038 91.1921 54.6172C88.2849 61.0821 128.912 80.0811 150.964 76.5871Z M106.83 39.5995C106.246 18.3419 123.005 0.635655 144.262 0.0514426C165.52 -0.53277 183.226 16.2263 183.81 37.4839C184.395 58.7414 167.635 76.4477 146.378 77.0319C145.022 77.0692 143.68 77.0359 142.356 76.9353C142.356 76.9353 142.355 76.9352 142.354 76.9352C145.419 77.1013 148.325 77.0054 150.964 76.5872C150.964 76.5872 150.964 76.5872 150.964 76.5872C150.123 76.3023 149.265 76.0203 148.391 75.7332C136.7 71.8904 122.222 67.1317 107.115 42.3608C107.115 42.3607 107.115 42.3607 107.115 42.3607C107.074 42.3806 107.047 42.4684 107.029 42.6131C106.925 41.6197 106.858 40.6147 106.83 39.5995Z M102.401 116.903C98.1638 116.903 93.6441 118.316 91.1017 121.282C90.9604 118.457 89.2655 116.903 86.4407 116.903C83.1921 116.903 81.6384 118.598 81.6384 121.847V167.47C81.6384 171.001 83.7571 172.696 86.8644 172.696C90.113 172.696 92.0904 170.86 92.0904 167.47V152.78C94.4915 155.746 98.4463 156.594 102.684 156.594C113.842 156.594 118.927 147.13 118.927 136.961C118.927 123.26 111.158 116.903 102.401 116.903ZM100 148.26C93.5028 148.402 91.5254 141.904 91.5254 136.537C91.5254 130.604 93.7853 125.096 100 125.096C105.65 125.237 108.333 130.322 108.333 136.537C108.475 141.48 106.78 148.26 100 148.26ZM145.904 116.903C141.667 116.903 137.147 118.316 134.605 121.282C134.322 118.457 132.768 116.903 129.802 116.903C126.554 116.903 125 118.598 125 121.847V167.47C125 171.001 127.119 172.696 130.226 172.696C133.475 172.696 135.452 170.86 135.452 167.47V152.78C137.853 155.746 141.808 156.594 146.045 156.594C157.203 156.594 162.288 147.13 162.288 136.961C162.429 123.26 154.661 116.903 145.904 116.903ZM143.503 148.26C137.006 148.402 135.028 141.904 135.028 136.537C135.028 130.604 137.288 125.096 143.503 125.096C149.153 125.237 151.836 130.322 151.836 136.537C151.836 141.48 150.282 148.26 143.503 148.26ZM73.3051 145.435V127.779C73.3051 120.152 66.2429 116.903 56.2147 116.903C45.339 116.903 39.4068 122.271 39.4068 126.508C39.4068 128.627 41.2429 130.604 43.9266 130.604C48.1638 130.604 48.3051 124.813 56.0734 124.813C59.6045 124.813 62.7119 126.085 62.7119 129.192C62.7119 132.158 60.7345 132.864 58.1921 133.147L51.6949 133.853C45.1977 134.559 37.0056 137.384 37.0056 146C37.0056 153.486 44.0678 156.453 50.2825 156.735C56.7797 157.018 61.2994 155.04 64.4068 152.639C64.9717 155.04 66.6667 156.735 70.0565 156.735C72.4576 156.735 74.5763 155.04 74.5763 152.639C74.5763 150.944 73.3051 149.814 73.3051 145.435ZM62.7119 138.797C62.7119 145.435 59.1808 149.673 53.3898 149.673C49.7175 149.673 47.5989 147.695 47.5989 145.294C47.5989 142.045 50 140.774 54.3785 140.068L58.1921 139.503C59.4633 139.221 61.5819 138.938 62.7119 137.808V138.797ZM186.864 160.831C184.322 168.035 181.497 171.849 174.859 171.849H174.294C169.633 171.849 167.655 169.589 167.655 167.046C167.655 164.221 169.633 162.809 172.458 162.809H173.164C174.576 162.809 176.13 162.668 177.26 159.419L177.684 158.289L166.667 126.791C165.819 124.248 165.395 123.118 165.395 121.847C165.395 119.022 167.655 116.762 170.48 116.762C173.305 116.762 175.282 118.316 175.847 120.717L182.627 145.435H182.768L189.548 120.717C190.254 118.316 192.09 116.762 194.915 116.762C197.74 116.762 200 118.881 200 121.847C200 123.118 199.576 124.248 198.729 126.791L186.864 160.831ZM21.6102 160.831C19.0678 168.035 16.2429 171.849 9.60452 171.849H8.89831C4.23729 171.849 2.25989 169.589 2.25989 167.046C2.25989 164.221 4.23729 162.809 7.06215 162.809H7.76836C9.18079 162.809 10.7345 162.668 11.8644 159.419L12.2881 158.289L1.27119 126.791C0.423729 124.39 0 123.118 0 121.988C0 119.163 2.25989 116.903 5.08475 116.903C7.9096 116.903 9.88701 118.457 10.452 120.858L17.2316 145.577H17.3729L24.1525 120.858C24.8588 118.457 26.6949 116.903 29.5198 116.903C32.3446 116.903 34.6045 119.022 34.6045 121.988C34.6045 123.26 34.1808 124.39 33.3333 126.932L21.6102 160.831Z",
  "0 0 200 173"
);

interface TechDefinition {
  id: string;
  name: LocalizedText;
  layer: LayerId;
  /** Icono monocromo que hereda el color del texto (react-icons o glifo propio). */
  icon: IconType;
  /** Ejemplo de integración: no consta como experiencia en proyectos concretos. */
  example?: boolean;
  /** Ids de los proyectos destacados que la usan. */
  projects: readonly ProjectId[];
}

// projects: ids de los proyectos que la usan (tabla stack x proyecto de las fichas verificadas)
const TECH_LIST = [
  // IA y automatización
  { id: "openrouter", name: "OpenRouter", layer: "ai", icon: SiOpenrouter, projects: [rvdesk] },
  { id: "zoho", name: "Zoho One", layer: "ai", icon: SiZoho, projects: [rvdesk] },
  { id: "whatsapp-bot", name: { es: "Chatbots en WhatsApp", en: "WhatsApp chatbots" }, layer: "ai", icon: SiWhatsapp, projects: [] },
  { id: "automation", name: { es: "Automatización de procesos", en: "Process automation" }, layer: "ai", icon: LuWorkflow, projects: [] },
  { id: "quickbooks", name: "QuickBooks", layer: "ai", icon: SiQuickbooks, projects: [] },
  { id: "xero", name: "Xero", layer: "ai", icon: SiXero, example: true, projects: [] },
  { id: "sap", name: "SAP", layer: "ai", icon: SiSap, example: true, projects: [] },

  // Frontend y mobile
  { id: "react", name: "React", layer: "frontend", icon: SiReact, projects: ALL_PROJECTS },
  { id: "nextjs", name: "Next.js", layer: "frontend", icon: SiNextdotjs, projects: ALL_PROJECTS },
  { id: "typescript", name: "TypeScript", layer: "frontend", icon: SiTypescript, projects: [] },
  { id: "javascript", name: "JavaScript", layer: "frontend", icon: SiJavascript, projects: [] },
  { id: "astro", name: "Astro", layer: "frontend", icon: SiAstro, projects: [] },
  { id: "vite", name: "Vite", layer: "frontend", icon: SiVite, projects: [] },
  { id: "tailwind", name: "Tailwind CSS", layer: "frontend", icon: SiTailwindcss, projects: [rvdesk, haus360, conectando] },
  { id: "shadcn", name: "shadcn/ui", layer: "frontend", icon: SiShadcnui, projects: [conectando] },
  { id: "radix", name: "Radix UI", layer: "frontend", icon: SiRadixui, projects: [ponline, conectando] },
  { id: "tanstack", name: "TanStack Query/Table", layer: "frontend", icon: SiReactquery, projects: ALL_PROJECTS },
  { id: "zustand", name: "Zustand", layer: "frontend", icon: ZustandIcon, projects: ALL_PROJECTS },
  { id: "rhf", name: "React Hook Form", layer: "frontend", icon: SiReacthookform, projects: [rvdesk, haus360, conectando] },
  { id: "framer", name: "Framer Motion", layer: "frontend", icon: SiFramer, projects: [conectando] },
  { id: "expo", name: "Expo / React Native", layer: "frontend", icon: SiExpo, projects: [haus360] },

  // Backend y datos
  { id: "node", name: "Node.js", layer: "backend", icon: SiNodedotjs, projects: ALL_PROJECTS },
  { id: "express", name: "Express", layer: "backend", icon: SiExpress, projects: ALL_PROJECTS },
  { id: "python", name: "Python", layer: "backend", icon: SiPython, projects: [] },
  { id: "flask", name: "Flask", layer: "backend", icon: SiFlask, projects: [] },
  { id: "zod", name: "Zod", layer: "backend", icon: SiZod, projects: ALL_PROJECTS },
  { id: "prisma", name: "Prisma", layer: "backend", icon: SiPrisma, projects: ALL_PROJECTS },
  { id: "postgres", name: "PostgreSQL", layer: "backend", icon: SiPostgresql, projects: [rvdesk, ponline] },
  { id: "mysql", name: "MySQL", layer: "backend", icon: TbBrandMysql, projects: [] },
  { id: "firebase", name: "Firebase", layer: "backend", icon: SiFirebase, projects: [] },
  { id: "supabase", name: "Supabase", layer: "backend", icon: SiSupabase, projects: [] },
  { id: "redis", name: "Redis", layer: "backend", icon: SiRedis, projects: [ponline] },
  { id: "pgboss", name: "pg-boss", layer: "backend", icon: LuListTodo, projects: [rvdesk] },
  { id: "socketio", name: "Socket.io", layer: "backend", icon: SiSocketdotio, projects: [ponline, conectando] },
  { id: "betterauth", name: "Better Auth", layer: "backend", icon: SiBetterauth, projects: [rvdesk] },
  { id: "clerk", name: "Clerk", layer: "backend", icon: SiClerk, projects: [haus360] },
  { id: "jwt", name: "JWT", layer: "backend", icon: SiJsonwebtokens, projects: [haus360, ponline, conectando] },
  { id: "resend", name: "Resend", layer: "backend", icon: SiResend, projects: ALL_PROJECTS },
  { id: "rest", name: "APIs REST", layer: "backend", icon: LuBraces, projects: [] },
  { id: "soap", name: "SOAP", layer: "backend", icon: LuNetwork, projects: [ponline] },
  { id: "payments", name: { es: "Pasarelas de pago", en: "Payment gateways" }, layer: "backend", icon: LuCreditCard, projects: [ponline] },
  { id: "yappy", name: "Yappy", layer: "backend", icon: YappyIcon, projects: [ponline] },

  // Herramientas y operación
  { id: "docker", name: "Docker", layer: "tools", icon: SiDocker, projects: [] },
  { id: "git", name: "Git", layer: "tools", icon: SiGit, projects: [] },
  { id: "github", name: "GitHub", layer: "tools", icon: SiGithub, projects: [] },
  { id: "actions", name: "GitHub Actions", layer: "tools", icon: SiGithubactions, projects: [] },
  { id: "pnpm", name: "pnpm", layer: "tools", icon: SiPnpm, projects: [rvdesk, haus360] },
  { id: "vitest", name: "Vitest", layer: "tools", icon: SiVitest, projects: [] },
  { id: "jest", name: "Jest", layer: "tools", icon: SiJest, projects: [] },
  { id: "vercel", name: "Vercel", layer: "tools", icon: SiVercel, projects: [rvdesk, conectando] },
  { id: "railway", name: "Railway", layer: "tools", icon: SiRailway, projects: [rvdesk, haus360] },
  { id: "cloudflare", name: "Cloudflare R2", layer: "tools", icon: SiCloudflare, projects: [rvdesk] },
  { id: "jira", name: "Jira", layer: "tools", icon: SiJira, projects: [] },
  { id: "scrum", name: "Scrum", layer: "tools", icon: DiScrum, projects: [] },
  { id: "kanban", name: "Kanban", layer: "tools", icon: TbLayoutKanban, projects: [] },

  // Infraestructura y cloud (del CV; sin proyecto asociado)
  { id: "aws", name: "AWS", layer: "infra", icon: TbBrandAws, projects: [] },
  { id: "windows-server", name: "Windows Server", layer: "infra", icon: FaWindows, projects: [] },
  { id: "linux", name: "Linux", layer: "infra", icon: SiLinux, projects: [] },
  { id: "macos", name: "macOS", layer: "infra", icon: SiApple, projects: [] },
  { id: "vmware", name: "VMware", layer: "infra", icon: LuServer, projects: [] },
  { id: "hyperv", name: "Hyper-V", layer: "infra", icon: TbCpu, projects: [] },
  { id: "proxmox", name: "Proxmox", layer: "infra", icon: SiProxmox, projects: [] },
  { id: "mikrotik", name: "MikroTik", layer: "infra", icon: SiMikrotik, projects: [] },
  { id: "asterisk", name: "Asterisk", layer: "infra", icon: SiAsterisk, projects: [] },
] as const satisfies readonly TechDefinition[];

/** Id de una tecnología de TECHS (validado en compilación). */
export type TechId = (typeof TECH_LIST)[number]["id"];

export interface Tech extends Omit<TechDefinition, "id"> {
  id: TechId;
}

export const TECHS: readonly Tech[] = TECH_LIST;

// Cifras visibles en About Me y Resume.
// TODO(Jefe): confirmar (el contenido tenía valores inconsistentes; el CV público dice 10+ años en TI).
export interface Stats {
  yearsInIt: string;
  projectsInProduction: string;
}

export const STATS = { yearsInIt: "10+", projectsInProduction: "10+" } satisfies Stats;

/** Descriptor corto de lo que es el proyecto (una frase, no una etiqueta de tipo). */
export type ProjectKind = Localized;

/** SaaS en producción, o proyecto interno de una empresa (sin enlace público). */
export type ProjectAccess = "live" | "internal";

export interface ProjectLogo {
  src: string;
  /** Variante para fondo oscuro. */
  dark?: string;
  /** Logo de un solo color negro: en fondo oscuro se invierte. */
  invertOnDark?: boolean;
  width: number;
  height: number;
}

export interface ProjectImage {
  src: string;
  width: number;
  height: number;
  alt: Localized;
  /** Parte de la imagen que se conserva al recortarla en la tarjeta (por defecto, la superior); "contain" muestra la captura completa, para las verticales. */
  focus?: "top" | "center" | "left" | "contain";
}

/** Columnas que ocupa la tarjeta en la rejilla del bento: 12 en escritorio, 6 en tableta (una columna en móvil). */
export type BentoCols = 4 | 5 | 6 | 7 | 8 | 12;

export interface ProjectBase {
  id: string;
  slug: string;
  name: LocalizedText;
  kind: ProjectKind;
  layers: readonly LayerId[];
  /** Una línea para la tarjeta del bento. */
  line: Localized;
  /** Qué hace: 1-2 frases. */
  what: Localized;
  /** Cómo funciona: 3-5 viñetas del flujo o de la arquitectura. */
  how: readonly Localized[];
  logo?: ProjectLogo;
  /** Icono de la tarjeta cuando no hay capturas ni logo. */
  icon?: IconType;
  images: readonly ProjectImage[];
  /** Solo si consta como público. */
  url?: string;
  /** Varios sitios públicos de un mismo proyecto (nombre propio + URL). */
  links?: readonly { label: string; url: string }[];
  bento: { lg: BentoCols; md: 3 | 6 };
}

export interface FeaturedProject extends ProjectBase {
  id: ProjectId;
  name: string;
  access: ProjectAccess;
  /** Empresa dueña del proyecto interno: solo se muestra en el detalle. */
  internalOf?: string;
}

export interface OtherProject extends ProjectBase {
  techs: readonly TechId[];
}

export type Project = FeaturedProject | OtherProject;

const l = (es: string, en: string): Localized => ({ es, en });

// Proyectos destacados: cada uno es un objeto de datos; para sumar otro basta agregar uno con sus capturas.
// - qué hace / cómo funciona: solo hechos verificados en el código o en los README del proyecto.
// - images: capturas sin datos personales; `alt` ES/EN, sin afirmar estados que la captura no demuestra.
// - url: solo si consta como público. logo: opcional, `dark` o `invertOnDark` para fondo oscuro.
// - Los textos de tarjeta no nombran empresas cliente; `internalOf` solo se muestra en el detalle.
export const PROJECTS: readonly FeaturedProject[] = [
  {
    id: rvdesk,
    slug: "rvdesk",
    name: "RVDesk",
    access: "live",
    kind: l("SaaS multi-tenant de soporte y proyectos", "Multi-tenant SaaS for support and projects"),
    layers: ["frontend", "backend", "ai", "tools"],
    line: l(
      "Tablero donde cada correo entrante se vuelve un ticket clasificado con IA, con cotizaciones y visitas en Zoho.",
      "A board where every inbound email becomes an AI-classified ticket, with quotes and visits in Zoho."
    ),
    what: l(
      "Plataforma para equipos que dan soporte a varios clientes: reúne tickets, tareas y proyectos en un tablero por cliente, y ofrece un portal para que cada cliente siga sus solicitudes sin ver las notas internas.",
      "A platform for teams that support several clients: it brings tickets, tasks and projects together on one board per client, and offers a portal where each client follows their requests without seeing internal notes."
    ),
    how: [
      l(
        "El correo llega a la dirección de soporte y se convierte en ticket; si el remitente no está verificado, queda en cuarentena hasta que alguien lo revise.",
        "The email arrives at the support address and becomes a ticket; if the sender is not verified, it waits in quarantine until someone reviews it."
      ),
      l(
        "La IA sugiere tipo, prioridad y categoría con su nivel de confianza, y la persona decide si aplicarlos.",
        "AI suggests type, priority and category with a confidence level, and a person decides whether to apply them."
      ),
      l(
        "El ticket vive en un tablero por cliente y proyecto, con checklist, adjuntos, notas internas y respuestas al cliente.",
        "The ticket lives on a board per client and project, with a checklist, attachments, internal notes and replies to the client."
      ),
      l(
        "Desde el ticket se genera el borrador de cotización en Zoho Books y se agenda la visita en Zoho Calendar.",
        "From the ticket you generate the quote draft in Zoho Books and schedule the visit in Zoho Calendar."
      ),
      l(
        "Cada cliente es un espacio aislado: sus datos se separan en tres capas, hasta la base de datos (PostgreSQL con RLS).",
        "Each client is an isolated space: its data is separated in three layers, down to the database (PostgreSQL with RLS)."
      ),
    ],
    url: "https://rvdesk.app",
    logo: { src: rvdeskLogo, dark: rvdeskLogoDark, width: 328, height: 74 },
    images: [
      {
        src: rvdeskHero,
        width: 1320,
        height: 660,
        focus: "left",
        alt: l(
          "Portada de RVDesk en modo oscuro: el titular \"Cada ticket, proyecto y cliente en el mismo tablero\" junto a un tablero con tarjetas y una clasificación sugerida con 90 % de confianza.",
          "RVDesk home in dark mode: the headline \"Every ticket, project and client on the same board\" next to a board with cards and a suggested classification at 90% confidence."
        ),
      },
      {
        src: rvdeskFlow,
        width: 1440,
        height: 425,
        alt: l(
          "Tres pasos de RVDesk: llega el correo de un remitente sin verificar, se clasifica con tipo, prioridad y categoría sugeridos, y se trabaja en el tablero con su checklist.",
          "Three RVDesk steps: the email from an unverified sender arrives, it is classified with suggested type, priority and category, and it is worked on the board with its checklist."
        ),
      },
      {
        src: rvdeskFeatures,
        width: 1440,
        height: 625,
        alt: l(
          "Funciones de RVDesk en modo oscuro: un tablero por cliente con vistas rápidas, modo foco para compartir pantalla y un portal donde el cliente ve sus solicitudes.",
          "RVDesk features in dark mode: a board per client with quick views, focus mode for screen sharing and a portal where the client sees their requests."
        ),
      },
      {
        src: rvdeskQuotes,
        width: 1440,
        height: 420,
        alt: l(
          "Un borrador de cotización generado desde el ticket en Zoho Books y una visita técnica sincronizada con Zoho Calendar.",
          "A quote draft generated from the ticket in Zoho Books and a technical visit synced with Zoho Calendar."
        ),
      },
      {
        src: rvdeskIntegrations,
        width: 1600,
        height: 1000,
        alt: l(
          "Ajustes de integraciones de RVDesk, en modo oscuro, con las tarjetas de Zoho Books y Zoho Calendar.",
          "RVDesk integration settings, dark mode, with the Zoho Books and Zoho Calendar cards."
        ),
      },
      {
        src: rvdeskMobile,
        width: 390,
        height: 844,
        alt: l(
          "Portada de RVDesk en un teléfono: titular, botón para iniciar sesión y el tablero de ejemplo.",
          "RVDesk home on a phone: headline, sign-in button and the sample board."
        ),
      },
    ],
    bento: { lg: 8, md: 6 },
  },
  {
    id: conectando,
    slug: "conectando",
    name: "Conectando+",
    access: "live",
    kind: l("Juego de cartas multijugador en tiempo real", "Real-time multiplayer card game"),
    layers: ["frontend", "backend", "tools"],
    line: l(
      "Juego de cartas digital para conversar en familia, en educación o en equipos, con turnos en vivo y videollamada.",
      "A digital card game for conversation at home, in education or in teams, with live turns and video calls."
    ),
    what: l(
      "Herramienta digital para fortalecer relaciones a través del juego: un moderador crea la partida, invita a los jugadores y las cartas guían la conversación sobre emociones, empatía y comunicación.",
      "A digital tool to strengthen relationships through play: a moderator creates the game, invites the players and the cards guide the conversation about emotions, empathy and communication."
    ),
    how: [
      l(
        "El moderador crea una partida: elige el número de jugadores y las categorías de cartas (resolución de conflictos, empatía, autoconocimiento y comunicación efectiva).",
        "The moderator creates a game: picks the number of players and the card categories (conflict resolution, empathy, self-awareness and effective communication)."
      ),
      l(
        "Los jugadores entran a la sala con un código, hasta 8 por partida; sala, turnos, cartas y respuestas se sincronizan en tiempo real por WebSocket (Socket.io).",
        "Players join the room with a code, up to 8 per game; room, turns, cards and answers sync in real time over WebSocket (Socket.io)."
      ),
      l(
        "Cada turno tiene temporizador, y el moderador ve un panel con el estado del juego desde el que puede pasar turno o finalizar la partida.",
        "Each turn has a timer, and the moderator sees a panel with the game state from which they can skip a turn or end the game."
      ),
      l(
        "La videollamada integrada (Daily.co) permite jugar a distancia sin salir de la partida.",
        "The built-in video call (Daily.co) lets people play remotely without leaving the game."
      ),
      l(
        "Hay planes de suscripción, estadísticas de jugadores y un panel de super administrador para paquetes, moderadores y suscripciones.",
        "There are subscription plans, player statistics and a super admin panel for plans, moderators and subscriptions."
      ),
    ],
    url: "https://conectando-mas.com",
    logo: { src: conectandoLogo, invertOnDark: true, width: 555, height: 72 },
    images: [
      {
        src: conectandoHero,
        width: 1600,
        height: 909,
        alt: l(
          "Página de inicio de Conectando+ con su titular, una breve descripción y los botones para empezar gratis o ver los paquetes.",
          "Conectando+ home page with its headline, a short description and buttons to start for free or see the plans."
        ),
      },
      {
        src: conectandoGame,
        width: 1600,
        height: 1027,
        alt: l(
          "Partida en curso en Conectando+: carta de empatía, temporizador del turno, panel de moderación y videollamada con los jugadores.",
          "A game in progress in Conectando+: empathy card, turn timer, moderation panel and a video call with the players."
        ),
      },
      {
        src: conectandoPlans,
        width: 1600,
        height: 907,
        alt: l(
          "Sección de paquetes de Conectando+: dos planes y dos complementos, videollamada y usuarios adicionales.",
          "Conectando+ plans section: two plans and two add-ons, video calls and additional users."
        ),
      },
      {
        src: conectandoCreate,
        width: 1600,
        height: 955,
        alt: l(
          "Formulario para crear una partida en Conectando+: número de jugadores y categorías de cartas.",
          "Form to create a game in Conectando+: number of players and card categories."
        ),
      },
      {
        src: conectandoAdmin,
        width: 1600,
        height: 640,
        alt: l(
          "Panel de super administrador de Conectando+ en la sección de paquetes, con dos planes activos.",
          "Conectando+ super admin panel in the plans section, with two active plans."
        ),
      },
    ],
    bento: { lg: 4, md: 3 },
  },
  {
    id: haus360,
    slug: "haus-360",
    name: "Haus 360",
    access: "internal",
    internalOf: "Haus",
    kind: l("Postventa inmobiliaria: web, app móvil y API", "Real estate after-sales: web, mobile app and API"),
    layers: ["frontend", "backend", "tools"],
    line: l(
      "Portal web y app móvil donde los propietarios reportan incidencias y el equipo las gestiona hasta el cierre.",
      "A web portal and mobile app where owners report issues and the team handles them through to closing."
    ),
    what: l(
      "Plataforma de postventa para una desarrolladora inmobiliaria: los propietarios registran solicitudes con fotos, consultan sus propiedades, garantías y documentos, y firman la entrega; el equipo coordina inspecciones, contratistas y cierres desde un panel.",
      "An after-sales platform for a real estate developer: owners file requests with photos, check their properties, warranties and documents, and sign the handover; the team coordinates inspections, contractors and closings from a panel."
    ),
    how: [
      l(
        "El cliente entra al portal web o a la app móvil, crea una solicitud con fotos, la sigue hasta su cierre y recibe notificaciones push.",
        "The client signs in on the web portal or mobile app, creates a request with photos, follows it to closing and receives push notifications."
      ),
      l(
        "El equipo recibe la solicitud en el panel, agenda la visita en el calendario y registra la inspección con su checklist.",
        "The team receives the request in the panel, schedules the visit on the calendar and records the inspection with its checklist."
      ),
      l(
        "Se piden cotizaciones a contratistas, se comparan en un cuadro y la aprobación depende del monto antes de ejecutar el trabajo.",
        "Quotes are requested from contractors, compared in a table, and approval depends on the amount before the work is carried out."
      ),
      l(
        "La entrega de la unidad se completa con la firma digital del cliente y entonces se activan las garantías por rubro.",
        "The unit handover is completed with the client's digital signature, and then the warranties by item are activated."
      ),
      l(
        "Todo corre en un monorepo: API Express con Clean Architecture, web Next.js y app Expo, con acceso dual (Clerk para el equipo y sesión propia para clientes).",
        "Everything runs in a monorepo: an Express API with Clean Architecture, a Next.js web app and an Expo app, with dual access (Clerk for the team and a custom session for clients)."
      ),
    ],
    logo: { src: haus360Logo, width: 806, height: 245 },
    images: [
      {
        src: hausCalendar,
        width: 1600,
        height: 907,
        alt: l(
          "Calendario mensual de Haus 360 con visitas de inspección y entregas de unidad agendadas, y el menú lateral del panel del equipo.",
          "Haus 360 monthly calendar with scheduled inspection visits and unit handovers, and the team panel's side menu."
        ),
      },
      {
        src: hausPanel,
        width: 1600,
        height: 745,
        alt: l(
          "Inicio del panel de Haus 360 en modo oscuro: tendencia de solicitudes, distribución por estatus y las transiciones más lentas del flujo.",
          "Haus 360 panel home in dark mode: request trend, distribution by status and the slowest workflow transitions."
        ),
      },
      {
        src: hausPortal,
        width: 1600,
        height: 923,
        alt: l(
          "Portal del cliente de Haus 360: ficha de una propiedad con garantías por rubro pendientes de activar y un recuadro para firmar la entrega.",
          "Haus 360 client portal: a property page with warranties by item pending activation and a box to sign the handover."
        ),
      },
      {
        src: hausLogin,
        width: 1075,
        height: 979,
        focus: "center",
        alt: l(
          "Pantalla de acceso al portal de postventa de Haus 360, en modo oscuro.",
          "Haus 360 after-sales portal sign-in screen, in dark mode."
        ),
      },
    ],
    bento: { lg: 5, md: 3 },
  },
  {
    id: ponline,
    slug: "ponline",
    name: "Ponline",
    access: "internal",
    internalOf: "Almacenajes",
    kind: l("Pagos en línea conectados a un ERP", "Online payments connected to an ERP"),
    layers: ["frontend", "backend", "tools"],
    line: l(
      "Portal de pagos en línea donde cada cobro con tarjeta, Yappy o ACH queda registrado en el ERP de la empresa.",
      "An online payments portal where each card, Yappy or ACH payment is recorded in the company's ERP."
    ),
    icon: LuCreditCard,
    what: l(
      "Portal de pagos para una empresa de mini bodegas: los clientes consultan su saldo y pagan en línea, y cada pago se registra automáticamente en el ERP, sin pasar por una sucursal.",
      "A payments portal for a mini-storage company: customers check their balance and pay online, and each payment is recorded automatically in the ERP, without visiting a branch."
    ),
    how: [
      l(
        "El cliente entra con correo o con Google, ve sus bodegas y su estado de cuenta, y elige cómo pagar: Visa, Mastercard, tarjeta de débito o Yappy.",
        "The customer signs in with email or Google, sees their units and account statement, and chooses how to pay: Visa, Mastercard, debit card or Yappy."
      ),
      l(
        "El pago se procesa en la pasarela elegida, se verifica y se concilia con tareas programadas, y el resultado se envía al ERP por SOAP.",
        "The payment is processed on the chosen gateway, verified and reconciled with scheduled jobs, and the result is sent to the ERP over SOAP."
      ),
      l(
        "Además de pagos únicos hay cobro automático por suscripción con tarjetas guardadas y descuento directo por ACH.",
        "Besides one-off payments there is automatic subscription billing with saved cards and direct debit through ACH."
      ),
      l(
        "Hay tres roles (cliente, usuario de sucursal y administrador), reportes en Excel y PDF y un panel de auditoría de las llamadas a pasarelas y ERP.",
        "There are three roles (customer, branch user and administrator), Excel and PDF reports and an audit panel of the calls to gateways and the ERP."
      ),
      l(
        "El backend sigue una arquitectura por capas (dominio, aplicación, infraestructura y presentación), con Redis, WebSockets y firma HMAC entre servicios.",
        "The backend follows a layered architecture (domain, application, infrastructure and presentation), with Redis, WebSockets and HMAC signing between services."
      ),
    ],
    images: [
      {
        src: ponlinePanel,
        width: 1600,
        height: 887,
        alt: l(
          "Panel administrativo de Ponline con el total de usuarios, sucursales, transacciones e ingresos del mes, y accesos directos a usuarios, sucursales y transacciones.",
          "Ponline admin dashboard with total users, branches, transactions and monthly income, and shortcuts to users, branches and transactions."
        ),
      },
      {
        src: ponlineAutopay,
        width: 1600,
        height: 880,
        alt: l(
          "Pantalla de pagos automáticos de Ponline con totales de suscripciones y una tabla de clientes con su sucursal, estado, tarjeta y próximo cobro.",
          "Ponline automatic payments screen with subscription totals and a table of customers with their branch, status, card and next charge."
        ),
      },
      {
        src: ponlineAudit,
        width: 1600,
        height: 834,
        alt: l(
          "Logs y auditoría de Ponline, en modo oscuro: llamadas por día y por servicio a SiteLink, bancos y pasarelas, con éxito y latencia promedio.",
          "Ponline logs and audit screen, dark mode: calls per day and per service to SiteLink, banks and gateways, with success rate and average latency."
        ),
      },
      {
        src: ponlineLogin,
        width: 956,
        height: 1324,
        focus: "center",
        alt: l(
          "Pantalla de inicio de sesión de Ponline con correo, contraseña y acceso con Google.",
          "Ponline sign-in screen with email, password and Google sign-in."
        ),
      },
    ],
    bento: { lg: 7, md: 6 },
  },
];

// Otros proyectos: sin clientes en las líneas de tarjeta; los únicos con capturas son sitios públicos o pantallas de acceso.
// `techs` son ids de TECHS; los destacados los derivan de TECHS[].projects.
export const OTHER_PROJECTS: readonly OtherProject[] = [
  {
    id: "rvsfiscal",
    slug: "rvsfiscal",
    name: "RVSFiscal",
    kind: l("Facturación electrónica fiscal para Panamá", "Fiscal e-invoicing for Panama"),
    layers: ["frontend", "backend", "ai"],
    techs: ["nextjs", "react", "typescript", "tailwind", "shadcn", "tanstack", "node", "express", "prisma", "postgres", "zoho", "jwt"],
    line: l(
      "Fiscaliza facturas y notas de crédito de Zoho Books ante la DGI de Panamá a través de un PAC.",
      "It fiscalizes Zoho Books invoices and credit notes with Panama's tax authority (DGI) through a PAC."
    ),
    what: l(
      "Sistema que toma las facturas y notas de crédito de Zoho Books, las envía a fiscalizar ante la DGI de Panamá a través de un PAC (proveedor autorizado) y devuelve el CUFE y el estado fiscal a Zoho.",
      "A system that takes invoices and credit notes from Zoho Books, sends them to be fiscalized with Panama's DGI through a PAC (authorized provider) and returns the CUFE and fiscal status to Zoho."
    ),
    how: [
      l(
        "Cada empresa conecta su cuenta de Zoho Books por OAuth y sus credenciales del PAC, que se guardan cifradas.",
        "Each company connects its Zoho Books account through OAuth and its PAC credentials, which are stored encrypted."
      ),
      l(
        "El sistema sincroniza facturas y notas de crédito, y la persona elige cuáles fiscalizar, en lote y con el progreso en tiempo real.",
        "The system syncs invoices and credit notes, and the user chooses which to fiscalize, in batches and with real-time progress."
      ),
      l(
        "Para una nota de crédito busca el CUFE de la factura original y lo referencia antes de enviarla.",
        "For a credit note it looks up the CUFE of the original invoice and references it before sending."
      ),
      l(
        "Al autorizarse, actualiza Zoho con el CUFE y el estado, genera el comprobante en PDF y conserva el historial de rechazos y el saldo de folios por empresa.",
        "Once authorized, it updates Zoho with the CUFE and status, generates the PDF receipt and keeps the rejection history and the folio balance per company."
      ),
      l(
        "Es un monorepo pnpm con web Next.js y API Express en capas (Clean Architecture), multiempresa y con roles de usuario.",
        "It is a pnpm monorepo with a Next.js web app and a layered Express API (Clean Architecture), multi-company and with user roles."
      ),
    ],
    images: [
      {
        src: fiscalReports,
        width: 1600,
        height: 751,
        alt: l(
          "Pantalla de reportes de RVSFiscal con totales de facturas fiscalizadas, tasa de éxito, gráfica mensual y distribución por estado.",
          "RVSFiscal reports screen with totals of fiscalized invoices, success rate, a monthly chart and the distribution by status."
        ),
      },
      {
        src: fiscalDashboard,
        width: 1600,
        height: 306,
        alt: l(
          "Panel de control de RVSFiscal con las métricas de clientes, compañías, facturas fiscalizadas, tasa de éxito y rechazos de la DGI.",
          "RVSFiscal dashboard with metrics for clients, companies, fiscalized invoices, success rate and DGI rejections."
        ),
      },
      {
        src: fiscalLogin,
        width: 942,
        height: 1036,
        alt: l(
          "Pantalla de acceso de RVSFiscal con correo, contraseña y botón para iniciar sesión.",
          "RVSFiscal sign-in screen with email, password and a sign-in button."
        ),
      },
    ],
    bento: { lg: 6, md: 6 },
  },
  {
    id: "law-site",
    slug: "sitio-despacho",
    name: l("Sitio web de un despacho legal", "Law firm website"),
    kind: l("Sitio institucional", "Corporate website"),
    layers: ["frontend"],
    techs: ["react", "tailwind", "shadcn"],
    line: l(
      "Sitio institucional con áreas de práctica, equipo y consulta gratuita, de diseño sobrio.",
      "A corporate site with practice areas, team and free consultation, with a sober design."
    ),
    what: l(
      "Sitio web de un despacho de abogados que presenta su trayectoria, las áreas de práctica, el equipo y un acceso directo a la consulta gratuita, adaptado a móvil.",
      "Website of a law firm that presents its track record, practice areas, team and a direct path to a free consultation, adapted to mobile."
    ),
    how: [
      l(
        "La portada resume la experiencia del despacho y enlaza a áreas de práctica, abogados, casos y consulta gratuita.",
        "The home page summarizes the firm's experience and links to practice areas, attorneys, cases and free consultation."
      ),
      l(
        "La barra superior reúne la navegación y los datos de contacto, y un botón lleva directo a la consulta.",
        "The top bar brings together navigation and contact details, and a button leads straight to the consultation."
      ),
      l(
        "Está hecho con React, Tailwind y shadcn/ui, con componentes reutilizables y diseño responsivo.",
        "It is built with React, Tailwind and shadcn/ui, with reusable components and a responsive design."
      ),
    ],
    images: [
      {
        src: lawSite,
        width: 1600,
        height: 719,
        focus: "left",
        alt: l(
          "Portada de un sitio de despacho de abogados con el titular \"más de 40 años de experiencia\", cuatro enlaces y cuatro cifras destacadas.",
          "Home page of a law firm website with the headline \"more than 40 years of experience\", four links and four highlighted figures."
        ),
      },
    ],
    bento: { lg: 6, md: 6 },
  },
  {
    id: "astro-sites",
    slug: "sitios-astro",
    name: l("Sitios web corporativos (Astro)", "Corporate websites (Astro)"),
    kind: l("Sitios públicos de presentación y captación", "Public presentation and lead-generation sites"),
    layers: ["frontend"],
    techs: ["astro", "tailwind", "typescript", "react"],
    line: l(
      "Tres sitios públicos hechos con Astro y Tailwind: carga rápida, buen SEO y contacto directo.",
      "Three public websites built with Astro and Tailwind: fast loading, solid SEO and direct contact."
    ),
    what: l(
      "Sitios de presentación y captación de clientes para negocios inmobiliarios y de servicios: páginas rápidas, pensadas para buscadores y con formularios y contacto directo.",
      "Presentation and lead-generation sites for real estate and service businesses: fast pages, built for search engines and with forms and direct contact."
    ),
    how: [
      l(
        "Astro genera las páginas de forma estática para que carguen rápido; solo las partes interactivas, como formularios o chat, cargan JavaScript.",
        "Astro generates the pages statically so they load fast; only the interactive parts, such as forms or chat, load JavaScript."
      ),
      l(
        "Cada sitio lleva llamadas a la acción para cotizar o escribir por WhatsApp, y secciones de servicios, tamaños o apartamentos según el negocio.",
        "Each site has calls to action to get a quote or write on WhatsApp, and sections for services, sizes or apartments depending on the business."
      ),
      l(
        "Están optimizados para buscadores y para móvil.",
        "They are optimized for search engines and for mobile."
      ),
    ],
    links: [
      { label: "Almacenajes Minidepósitos", url: "https://almacenajes-minidepositos.com" },
      { label: "Astre Panamá", url: "https://astrepanama.com" },
      { label: "Haus Panamá", url: "https://hauspanama.com" },
    ],
    images: [
      {
        src: sitesAstre,
        width: 1600,
        height: 1000,
        alt: l(
          "Portada del sitio web de un edificio de apartamentos en San Francisco, Panamá: sala luminosa con el titular \"Vive en el corazón de San Francisco\" y menú de diseño, apartamentos, amenidades y ubicación.",
          "Home page of an apartment building website in San Francisco, Panama: bright living room with the headline \"Vive en el corazón de San Francisco\" and a menu for design, apartments, amenities and location."
        ),
      },
      {
        src: sitesAlmacenajes,
        width: 1600,
        height: 1000,
        alt: l(
          "Portada del sitio web de una empresa de minidepósitos en Panamá: titular \"Tu espacio extra te está esperando\", botón de promoción y un hombre con cajas de almacenamiento.",
          "Home page of a mini-storage company website in Panama: headline \"Tu espacio extra te está esperando\", a promotion button and a man holding storage boxes."
        ),
      },
      {
        src: sitesHaus,
        width: 1600,
        height: 1000,
        alt: l(
          "Portada del sitio web de un desarrollador inmobiliario en Panamá: cuatro tarjetas de proyectos de casas y apartamentos con su precio inicial y un botón para agendar una visita.",
          "Home page of a real estate developer website in Panama: four cards for house and apartment projects with starting prices and a button to book a visit."
        ),
      },
    ],
    bento: { lg: 12, md: 6 },
  },
];

// Tecnologías de un proyecto: explícitas en el índice, derivadas de TECHS[].projects en los destacados
export const getProjectTechs = (project: Project): Tech[] =>
  "techs" in project
    ? project.techs.flatMap((id) => TECHS.find((tech) => tech.id === id) ?? [])
    : TECHS.filter((tech) => tech.projects.includes(project.id));
