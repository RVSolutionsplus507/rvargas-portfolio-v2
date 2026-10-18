import { m } from "motion/react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { FiAward, FiCheck, FiExternalLink } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import Stack from "@/components/stack";
import RvdeskMap from "@/components/rvdesk-map";
import Whatsapp from "@/components/whatsapp";
import { STATS } from "@/data/portfolio";
import { tArray } from "@/lib/i18n-helpers";

const SERVICE_IDS = ["software", "ai", "infra", "integrations"];
// Certificaciones inequívocas; el grado y el inglés quedan fuera hasta que el Jefe los confirme
const CERTIFICATION_KEYS = ["education2", "education3", "education4"];
// TODO(Jefe): revisar la redacción de los 4 pasos de "Cómo trabajo" (aboutme.json, claves workflow.steps.*)
const WORKFLOW_STEP_IDS = ["understand", "design", "build", "operate"];
const RVDESK_URL = "https://rvdesk.app";

const SECTION_TITLE = "text-title";

function AboutMe() {
  const [t] = useTranslation("aboutme");

  return (
    <div className="mx-auto space-y-16 p-2 pb-28 md:space-y-20 lg:p-6 lg:pb-28">
      <m.header
        initial={{ y: 16 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <p className="mono-label text-muted-foreground">{t("hero.eyebrow")}</p>
        <p className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-card px-3 py-2 text-xs text-foreground md:px-3.5 md:text-meta">
          <span aria-hidden="true" className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          {t("hero.availability")}
        </p>
        <h1 tabIndex={-1} className="max-w-4xl focus:outline-hidden">
          <span className="block text-display-sm md:text-display">{t("hero.title1")}</span>
          <span className="mt-3 block text-layer-sm text-primary md:text-title">{t("hero.title2")}</span>
        </h1>
        <div className="max-w-prose space-y-3 text-body">
          <p>{t("hero.lead")}</p>
          <p>{t("hero.ai")}</p>
        </div>
        <dl className="flex flex-wrap gap-x-10 gap-y-3">
          <div>
            <dt className="text-meta text-muted-foreground">{t("hero.statYears")}</dt>
            <dd className="text-title text-primary">{STATS.yearsInIt}</dd>
          </div>
          <div>
            <dt className="text-meta text-muted-foreground">{t("hero.statProjects")}</dt>
            <dd className="text-title text-primary">{STATS.projectsInProduction}</dd>
          </div>
        </dl>
        <p className="text-meta text-muted-foreground">{t("hero.location")}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="min-h-11">
            <Link to="/projects">{t("hero.ctaProjects")}</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="min-h-11">
            <Link to="/contact">{t("hero.ctaContact")}</Link>
          </Button>
        </div>
      </m.header>

      <section aria-labelledby="stack-title" className="space-y-6">
        <div className="space-y-3">
          <h2 id="stack-title" className={SECTION_TITLE}>
            {t("stack.title")}
          </h2>
          <p className="max-w-prose text-body text-muted-foreground">{t("stack.intro")}</p>
        </div>
        <Stack />
      </section>

      <section aria-labelledby="rvdesk-title" className="space-y-6">
        <div className="space-y-3">
          <p className="mono-label text-muted-foreground">{t("rvdesk.eyebrow")}</p>
          <h2 id="rvdesk-title" className={SECTION_TITLE}>
            {t("rvdesk.title")}
          </h2>
          <p className="max-w-prose text-body text-muted-foreground">{t("rvdesk.intro")}</p>
          <Button asChild size="lg" className="min-h-11">
            <a href={RVDESK_URL} target="_blank" rel="noopener noreferrer">
              {t("rvdesk.cta")}
              <FiExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
              <span className="sr-only"> ({t("rvdesk.newTab")})</span>
            </a>
          </Button>
        </div>
        <RvdeskMap />
      </section>

      <section aria-labelledby="services-title" className="space-y-6">
        <div className="space-y-3">
          <h2 id="services-title" className={SECTION_TITLE}>
            {t("services.title")}
          </h2>
          <p className="max-w-prose text-body text-muted-foreground">{t("services.intro")}</p>
        </div>
        <ul className="grid gap-4 md:grid-cols-2">
          {SERVICE_IDS.map((id) => (
            <li key={id} className="rounded-2xl bg-card p-6">
              <h3 className="text-layer-sm font-semibold md:text-layer">{t(`services.items.${id}.title`)}</h3>
              <p className="mt-2 text-meta text-muted-foreground">{t(`services.items.${id}.desc`)}</p>
              <ul className="mt-4 space-y-2">
                {tArray(t, `services.items.${id}.points`).map((point) => (
                  <li key={point} className="flex items-start gap-2 text-meta">
                    <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              {id === "integrations" && (
                <p className="mt-4 text-meta text-muted-foreground">{t("services.examples")}</p>
              )}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="min-h-11">
            <Link to="/contact">{t("services.cta")}</Link>
          </Button>
          <Whatsapp />
        </div>
      </section>

      <section aria-labelledby="workflow-title" className="space-y-6">
        <h2 id="workflow-title" className={SECTION_TITLE}>
          {t("workflow.title")}
        </h2>
        <ol className="grid gap-4 md:grid-cols-2">
          {WORKFLOW_STEP_IDS.map((id, index) => (
            <li key={id} className="flex items-start gap-4 rounded-2xl bg-card p-6">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-body font-bold text-primary-foreground"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-layer-sm font-semibold md:text-layer">{t(`workflow.steps.${id}.title`)}</h3>
                <p className="mt-1 text-meta text-muted-foreground">{t(`workflow.steps.${id}.desc`)}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="space-y-3">
          <h3 className="text-layer-sm font-semibold">{t("formation.title")}</h3>
          <ul className="flex flex-wrap gap-2">
            {CERTIFICATION_KEYS.map((key) => (
              <li key={key} className="inline-flex items-center gap-2 rounded-full bg-card px-3.5 py-2 text-meta">
                <FiAward className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default AboutMe;
