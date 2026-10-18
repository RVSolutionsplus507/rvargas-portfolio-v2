import { FiGithub, FiLinkedin, FiTwitter } from "react-icons/fi";
import { NavLink } from "react-router";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import mainimage from "@/assets/fotoRV.webp";
import { Darkmode } from "@/components/darkmode";
import { LanguageButton } from "@/components/languagebutton";
import { cn } from "@/lib/utils";
import { CONTACT_EMAIL } from "@/lib/contact";
import { useTranslation } from "react-i18next";

// El copyright y el correo no cambian con el idioma; el rol sí (clave "role" del namespace sidebar)
const COPYRIGHT = "© 2026 Roberto J. Vargas";

const NAV_ITEMS = [
  { to: "/aboutme", labelKey: "aboutme", end: true },
  { to: "/resume", labelKey: "resume", end: true },
  { to: "/projects", labelKey: "projects", end: false },
  { to: "/contact", labelKey: "contact", end: false },
];

const SOCIAL_LINKS = [
  { href: "https://github.com/RVSolutionsplus507", label: "GitHub", Icon: FiGithub },
  { href: "https://www.linkedin.com/in/roberto-j-vargas-d-69631159/", label: "LinkedIn", Icon: FiLinkedin },
  { href: "https://x.com/devrvsplus/", label: "X", Icon: FiTwitter },
];

const FOCUS_RING = "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring";

// Subconjunto del estado que NavLink pasa a className
interface NavLinkState {
  isActive: boolean;
}

const desktopLinkClass = ({ isActive }: NavLinkState) =>
  cn(
    "relative flex min-h-11 items-center rounded-md pl-[18px] pr-3.5 text-base font-medium text-foreground transition-colors duration-150 hover:bg-card",
    FOCUS_RING,
    isActive &&
      "font-bold before:absolute before:bottom-2.5 before:left-0 before:top-2.5 before:w-1 before:rounded-sm before:bg-primary"
  );

const mobileTabClass = ({ isActive }: NavLinkState) =>
  cn(
    "relative flex min-h-11 items-center px-1 text-[13px] font-medium min-[380px]:text-sm text-foreground transition-colors duration-150",
    FOCUS_RING,
    isActive &&
      "font-bold after:absolute after:inset-x-1 after:bottom-0 after:h-[3px] after:rounded-sm after:bg-primary"
  );

const SocialLinks = () => (
  <div className="flex justify-center gap-1.5">
    {SOCIAL_LINKS.map(({ href, label, Icon }) => (
      <a
        key={label}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors duration-150 hover:bg-card hover:text-primary",
          FOCUS_RING
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </a>
    ))}
  </div>
);

const MailLink = () => (
  <a
    href={`mailto:${CONTACT_EMAIL}`}
    className={cn(
      "block break-all rounded-md py-1 text-center text-sm font-semibold text-foreground transition-colors duration-150 hover:text-primary",
      FOCUS_RING
    )}
  >
    {CONTACT_EMAIL}
  </a>
);

const Sidebar = () => {
  const { t } = useTranslation("sidebar");

  return (
    <>
      <div className="hidden h-full flex-col md:flex">
        <div className="flex items-center justify-between">
          <Darkmode />
          <LanguageButton />
        </div>
        <div className="my-4 flex flex-col items-center gap-2 text-center">
          <Avatar className="h-28 w-28 border border-border">
            <AvatarImage src={mainimage} alt="Roberto J. Vargas" />
            <AvatarFallback>RVargas</AvatarFallback>
          </Avatar>
          <p className="mt-2 whitespace-nowrap text-2xl font-bold leading-[1.15] tracking-[-0.01em] text-foreground">
            Roberto J. Vargas
          </p>
          <p className="text-balance text-[15px] font-medium leading-[1.4] text-muted-foreground">{t("role")}</p>
        </div>

        <Separator className="my-3.5" />

        <nav aria-label={t("navLabel")} className="flex grow flex-col gap-0.5">
          {NAV_ITEMS.map(({ to, labelKey, end }) => (
            <NavLink key={to} to={to} end={end} className={desktopLinkClass}>
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        <Separator className="my-3.5" />
        <MailLink />
        <SocialLinks />
        <p className="mt-1.5 text-center text-[13px] text-muted-foreground">{COPYRIGHT}</p>
      </div>

      {/* Móvil (M1): foto, nombre, rol, tema e idioma en una fila; menú en pestañas de texto */}
      <div className="md:hidden">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border border-border">
            <AvatarImage src={mainimage} alt="Roberto J. Vargas" />
            <AvatarFallback>RV</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="whitespace-nowrap text-base font-bold leading-tight tracking-[-0.01em] text-foreground">
              Roberto J. Vargas
            </p>
            <p className="mt-0.5 text-balance text-[13px] font-medium leading-[1.3] text-muted-foreground">{t("role")}</p>
          </div>
          <div className="flex shrink-0 items-center">
            <Darkmode />
            <LanguageButton />
          </div>
        </div>
        <nav aria-label={t("navLabel")} className="mt-2.5 flex justify-between border-t border-border pt-1">
          {NAV_ITEMS.map(({ to, labelKey, end }) => (
            <NavLink key={to} to={to} end={end} className={mobileTabClass}>
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

// Cierre del panel en móvil: email, redes y copyright (en escritorio viven en el sidebar)
export const SidebarEnd = () => (
  <div className="mt-10 flex flex-col items-center gap-2 border-t border-border pt-4 md:hidden">
    <MailLink />
    <SocialLinks />
    <p className="text-[13px] text-muted-foreground">{COPYRIGHT}</p>
  </div>
);

export default Sidebar;
