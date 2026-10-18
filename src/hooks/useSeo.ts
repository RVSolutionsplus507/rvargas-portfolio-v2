import { useEffect } from "react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { DEFAULT_LANG, DEFAULT_ROUTE, SEO_ROUTES, isSeoRoute, routeUrl } from "@/seo-routes";
import type { SeoLang } from "@/seo-routes";

const setMeta = (selector: string, attr: "content" | "href", value: string): void => {
  document.head.querySelector(selector)?.setAttribute(attr, value);
};

// Sincroniza <html lang>, title, description, canonical y og/twitter con ruta + idioma activo.
export function useSeo(): void {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const lang: SeoLang = i18n.language?.toLowerCase().startsWith("en") ? "en" : DEFAULT_LANG;

  useEffect(() => {
    const route = isSeoRoute(pathname) ? pathname : DEFAULT_ROUTE;
    const { title, description } = SEO_ROUTES[route][lang];
    const url = routeUrl(route);

    document.documentElement.lang = lang;
    document.title = title;
    setMeta('meta[name="description"]', "content", description);
    setMeta('link[rel="canonical"]', "href", url);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[property="og:locale"]', "content", lang === "en" ? "en_US" : "es_PA");
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
  }, [pathname, lang]);
}
