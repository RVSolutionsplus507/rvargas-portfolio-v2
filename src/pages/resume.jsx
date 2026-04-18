import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaDownload,
  FaPhone,
  FaMapMarkerAlt,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

import resumeES from "@/assets/cv/Roberto-Vargas_CV_ES.pdf";
import resumeEN from "@/assets/cv/Roberto-Vargas_CV_EN.pdf";

const SKILL_COLORS = {
  frontend: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  backend: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  infrastructure: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  tools: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};

const TECH_TAG = "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary";

const PERSONAL_INFO = {
  phone: "(507) 6108-3193",
  location: "Ciudad de Panamá, Panamá",
  github: "https://github.com/RVSolutionsplus507",
  linkedin: "https://www.linkedin.com/in/roberto-j-vargas-d-69631159/",
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const ContactChip = ({ icon, label, href }) => {
  const base =
    "inline-flex items-center gap-1.5 px-1 py-0.5 text-xs text-foreground transition-colors duration-150";
  const interactive = "hover:text-primary";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${interactive}`}>
        <span className="text-primary">{icon}</span>
        {label}
      </a>
    );
  }
  return (
    <span className={base}>
      <span className="text-primary">{icon}</span>
      {label}
    </span>
  );
};

const ExperienceEntry = ({ exp, isLast }) => {
  const techList = Array.isArray(exp.tech) ? exp.tech : [];

  return (
    <div className={`relative pl-5 ${isLast ? "pb-0" : "pb-7"}`}>
      {!isLast && (
        <div className="absolute left-[7px] top-3 bottom-0 w-px bg-border" />
      )}
      <div className="absolute left-0 top-[10px] h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />

      <div className="pl-4 ml-1">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 mb-2">
          <div>
            <h3 className="font-semibold text-foreground leading-snug">{exp.title}</h3>
            <p className="text-sm text-primary font-medium">{exp.company}</p>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap sm:ml-4 shrink-0">
            {exp.period}
          </span>
        </div>

        <ul className="space-y-1.5 mb-3">
          {exp.achievements.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/90 leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        {techList.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {techList.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${TECH_TAG}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ResumePage = () => {
  const { t } = useTranslation("resume");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const experiences = [
    {
      title: t("title1"),
      company: t("company1"),
      period: t("period1"),
      achievements: [t("achievement1_1"), t("achievement1_2"), t("achievement1_3")],
      tech: t("tech1", { returnObjects: true }),
    },
    {
      title: t("title2"),
      company: t("company2"),
      period: t("period2"),
      achievements: [t("achievement2_1"), t("achievement2_2"), t("achievement2_3")],
      tech: t("tech2", { returnObjects: true }),
    },
    {
      title: t("title3"),
      company: t("company3"),
      period: t("period3"),
      achievements: [t("achievement3_1"), t("achievement3_2"), t("achievement3_3")],
      tech: t("tech3", { returnObjects: true }),
    },
  ];

  const skillCategories = [
    { key: "frontend", label: t("frontend"), color: SKILL_COLORS.frontend },
    { key: "backend", label: t("backend"), color: SKILL_COLORS.backend },
    { key: "infrastructure", label: t("infrastructure"), color: SKILL_COLORS.infrastructure },
    { key: "tools", label: t("tools"), color: SKILL_COLORS.tools },
  ];

  const handleDownload = (lang) => {
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
    <div className="mx-auto lg:p-6 p-2 overflow-x-hidden lg:overflow-y-auto text-foreground">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-4xl mx-auto space-y-5"
      >
        {/* Header */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Roberto J. Vargas
                </h1>
                <p className="text-primary font-medium mt-0.5 text-sm">
                  Full Stack Developer &amp; IT Manager
                </p>
              </div>

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
                    <FaDownload className="mr-2 h-3.5 w-3.5" />
                    {t("downloadresume")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[380px]">
                  <DialogHeader>
                    <DialogTitle>{t("selectlanguage")}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3 py-4">
                    <Button onClick={() => handleDownload("ES")} className="w-full">
                      {t("spanish")}
                    </Button>
                    <Button onClick={() => handleDownload("EN")} className="w-full" variant="outline">
                      {t("english")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
              <ContactChip icon={<FaPhone className="h-3 w-3" />} label={PERSONAL_INFO.phone} />
              <ContactChip icon={<FaMapMarkerAlt className="h-3 w-3" />} label={PERSONAL_INFO.location} />
              <ContactChip icon={<FaGithub className="h-3 w-3" />} label="GitHub" href={PERSONAL_INFO.github} />
              <ContactChip icon={<FaLinkedin className="h-3 w-3" />} label="LinkedIn" href={PERSONAL_INFO.linkedin} />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-primary text-base">{t("skills")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {skillCategories.map(({ key, label, color }) => {
                const skills = t(`skillGroups.${key}`, { returnObjects: true });
                if (!Array.isArray(skills)) return null;
                return (
                  <div key={key}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                      {label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Work experience */}
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.28 }}>
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-primary text-base">{t("workexperience")}</CardTitle>
            </CardHeader>
            <CardContent>
              {experiences.map((exp, index) => (
                <ExperienceEntry
                  key={index}
                  exp={exp}
                  isLast={index === experiences.length - 1}
                />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResumePage;