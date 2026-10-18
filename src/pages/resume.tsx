import { useState } from "react";
import type { ReactNode } from "react";
import { m, useReducedMotion } from "motion/react";
import { FaDownload, FaPhone, FaMapMarkerAlt, FaGithub, FaLinkedin } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LayerBar from "@/components/layer-bar";
import { STATS } from "@/data/portfolio";
import type { LayerId } from "@/data/portfolio";
import { tArray } from "@/lib/i18n-helpers";
import { useTranslation } from "react-i18next";

import resumeES from "@/assets/cv/Roberto-Vargas_CV_ES.pdf";
import resumeEN from "@/assets/cv/Roberto-Vargas_CV_EN.pdf";

const PERSONAL_INFO = {
  phone: "(507) 6108-3193",
  phoneHref: "tel:+50761083193",
  github: "https://github.com/RVSolutionsplus507",
  linkedin: "https://www.linkedin.com/in/roberto-j-vargas-d-69631159/",
};

// Capas del stack que cubre cada cargo, deducidas de la tecnología declarada en `techN` (mismo orden que `experiences`)
const EXPERIENCE_LAYERS: readonly (readonly LayerId[])[] = [
  ["ai", "frontend", "backend", "tools", "infra"],
  ["frontend", "backend", "infra"],
  ["infra"],
];

const PHONE_ICON = <FaPhone className="h-3 w-3" />;
const LOCATION_ICON = <FaMapMarkerAlt className="h-3 w-3" />;
const GITHUB_ICON = <FaGithub className="h-3.5 w-3.5" />;
const LINKEDIN_ICON = <FaLinkedin className="h-3.5 w-3.5" />;

const CHIP = "inline-flex items-center rounded-full bg-foreground/[0.06] px-2.5 py-1 text-caption";
const LABEL = "mono-label text-muted-foreground";

interface ContactChipProps {
  icon: ReactNode;
  label: string;
  href?: string;
  newTabLabel?: string;
}

const ContactChip = ({ icon, label, href, newTabLabel }: ContactChipProps) => {
  const base = "inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-meta text-foreground";
  const content = (
    <>
      <span className="text-primary" aria-hidden="true">{icon}</span>
      {label}
    </>
  );

  if (!href) return <span className={base}>{content}</span>;

  const isExternal = Boolean(newTabLabel);
  return (
    <a
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${base} transition-colors hover:bg-accent`}
    >
      {content}
      {isExternal && <span className="sr-only"> ({newTabLabel})</span>}
    </a>
  );
};

interface Experience {
  title: string;
  company: string;
  period: string;
  achievements: string[];
  tech: string[];
}

interface ExperienceEntryProps {
  exp: Experience;
  layers: readonly LayerId[];
  isLast: boolean;
}

const ExperienceEntry = ({ exp, layers, isLast }: ExperienceEntryProps) => {
  const techList = exp.tech;

  return (
    <li className={`relative pl-8 ${isLast ? "pb-0" : "pb-8"}`}>
      {!isLast && <span aria-hidden="true" className="absolute bottom-0 left-[7px] top-4 w-px bg-border" />}
      <span
        aria-hidden="true"
        className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background"
      />

      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <div>
          <h3 className="text-layer-sm font-semibold">{exp.title}</h3>
          <p className="text-meta font-semibold text-primary">{exp.company}</p>
        </div>
        <p className="shrink-0 text-caption text-muted-foreground sm:whitespace-nowrap">{exp.period}</p>
      </div>

      <ul className="mt-4 space-y-2">
        {exp.achievements.map((item) => (
          <li key={item} className="flex items-start gap-2 text-meta">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>

      {techList.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {techList.map((tag) => (
            <li key={tag} className={CHIP}>
              {tag}
            </li>
          ))}
        </ul>
      )}

      <LayerBar layers={layers} className="mt-4 max-w-xs" />
    </li>
  );
};

const ResumePage = () => {
  const { t } = useTranslation("resume");
  const { t: tSidebar } = useTranslation("sidebar");
  const reduceMotion = useReducedMotion();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const experiences: Experience[] = [
    {
      title: t("title1"),
      company: t("company1"),
      period: t("period1"),
      achievements: [t("achievement1_1"), t("achievement1_2"), t("achievement1_3")],
      tech: tArray(t, "tech1"),
    },
    {
      title: t("title2"),
      company: t("company2"),
      period: t("period2"),
      achievements: [t("achievement2_1"), t("achievement2_2"), t("achievement2_3")],
      tech: tArray(t, "tech2"),
    },
    {
      title: t("title3"),
      company: t("company3"),
      period: t("period3"),
      achievements: [t("achievement3_1"), t("achievement3_2"), t("achievement3_3")],
      tech: tArray(t, "tech3"),
    },
  ];

  const highlights = [
    { value: STATS.yearsInIt, label: t("highlight_exp") },
    { value: STATS.projectsInProduction, label: t("highlight_projects") },
  ];

  const languages = [
    { lang: t("lang_spanish"), level: t("level_native") },
    { lang: t("lang_english"), level: t("level_professional") },
  ];

  const handleDownload = (lang: "ES" | "EN"): void => {
    const resumeUrl = lang === "ES" ? resumeES : resumeEN;
    const link = document.createElement("a");
    link.href = resumeUrl;
    link.download = `Roberto-Vargas_CV_${lang}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsModalOpen(false);
  };

  return (
    <div className="mx-auto space-y-12 p-2 pb-28 text-foreground md:space-y-14 lg:p-6 lg:pb-28">
      <m.header
        initial={reduceMotion ? false : { y: 16 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl space-y-5"
      >
        <p className="mono-label text-muted-foreground">{t("eyebrow")}</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 tabIndex={-1} className="text-display-sm focus:outline-hidden">Roberto J. Vargas</h1>
            <p className="mt-2 text-layer-sm text-primary">{tSidebar("role")}</p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="min-h-11 shrink-0">
                <FaDownload className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                {t("downloadresume")}
              </Button>
            </DialogTrigger>
            <DialogContent closeLabel={t("close")} aria-describedby={undefined} className="sm:max-w-[380px]">
              <DialogHeader>
                <DialogTitle>{t("selectlanguage")}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-4">
                <Button onClick={() => handleDownload("ES")} size="lg" className="min-h-11 w-full">
                  {t("spanish")}
                </Button>
                <Button onClick={() => handleDownload("EN")} size="lg" className="min-h-11 w-full" variant="outline">
                  {t("english")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="-ml-2 flex flex-wrap gap-x-2 gap-y-1">
          <ContactChip icon={PHONE_ICON} label={PERSONAL_INFO.phone} href={PERSONAL_INFO.phoneHref} />
          <ContactChip icon={LOCATION_ICON} label={t("location")} />
          <ContactChip
            icon={GITHUB_ICON}
            label="GitHub"
            href={PERSONAL_INFO.github}
            newTabLabel={t("newTab")}
          />
          <ContactChip
            icon={LINKEDIN_ICON}
            label="LinkedIn"
            href={PERSONAL_INFO.linkedin}
            newTabLabel={t("newTab")}
          />
        </div>
      </m.header>

      <section aria-labelledby="profile-title" className="max-w-4xl space-y-6">
        <h2 id="profile-title" className="text-title">
          {t("profile")}
        </h2>
        <div className="space-y-6 rounded-2xl bg-card p-5 md:p-7">
          <dl className="flex flex-wrap gap-x-10 gap-y-3">
            {highlights.map(({ value, label }) => (
              <div key={label}>
                <dt className="text-meta text-muted-foreground">{label}</dt>
                <dd className="text-title text-primary">{value}</dd>
              </div>
            ))}
          </dl>

          <div>
            <h3 className={LABEL}>{t("competencies")}</h3>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {tArray(t, "competencyList").map((item) => (
                <li key={item} className={CHIP}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={LABEL}>{t("languages")}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {languages.map(({ lang, level }) => (
                <li key={lang} className={`${CHIP} gap-1.5 px-3`}>
                  <span className="font-semibold">{lang}</span>
                  <span className="text-muted-foreground">· {level}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="experience-title" className="max-w-4xl space-y-6">
        <h2 id="experience-title" className="text-title">
          {t("workexperience")}
        </h2>
        <ol className="rounded-2xl bg-card p-5 md:p-7">
          {experiences.map((exp, index) => (
            <ExperienceEntry
              key={exp.company}
              exp={exp}
              layers={EXPERIENCE_LAYERS[index] ?? []}
              isLast={index === experiences.length - 1}
            />
          ))}
        </ol>
      </section>
    </div>
  );
};

export default ResumePage;
