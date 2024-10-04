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

const ResumePage = () => {
  const { t } = useTranslation("resume");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const personalInfo = {
    phone: "(507) 6108-3193",
    location: "Ciudad de Panama, Panama",
    github: "https://github.com/RVSolutionsplus507",
    linkedin: "https://www.linkedin.com/in/roberto-j-vargas-d-69631159/",
  };

  const experiences = [
    {
      title: t("title1"),
      company: "Grupo Valencia",
      period: t("period1"),
      responsibilities: [
        t("responsibility1"),
        t("responsibility2"),
        t("responsibility3"),
        t("responsibility4"),
        t("responsibility5"),
        t("responsibility6"),
        t("responsibility7"),
        t("responsibility8"),
        t("responsibility9"),
        t("responsibility10"),
      ],
    },
    {
      title: t("title2"),
      company: "Hidroca Panamá",
      period: t("period2"),
      responsibilities: [
        t("responsibility11"),
        t("responsibility12"),
        t("responsibility13"),
        t("responsibility14"),
        t("responsibility15"),
        t("responsibility16"),
        t("responsibility17"),
        t("responsibility18"),
      ],
    },
    {
      title: t("title3"),
      company: "SEMUSA",
      period: t("period3"),
      responsibilities: [
        t("responsibility19"),
        t("responsibility20"),
        t("responsibility21"),
        t("responsibility22"),
        t("responsibility23"),
        t("responsibility24"),
        t("responsibility25"),
        t("responsibility26"),
        t("responsibility27"),
      ],
    },
  ];

  const handleDownload = (lang) => {
    const resumeUrl = lang === 'ES' ? resumeES : resumeEN;
    const link = document.createElement("a");
    link.href = resumeUrl;
    link.download = `Roberto-Vargas_CV_${lang}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsModalOpen(false);
  };

  return (
    <div className="mx-auto lg:p-6 p-2 overflow-x-hidden lg:overflow-y-auto text-foreground ">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-center items-center">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary-dark text-primary-foreground">
                    <FaDownload className="mr-2" />
                    {t("downloadresume")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{t("selectlanguage")}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Button onClick={() => handleDownload('ES')} className="w-full">
                      {t("spanish")}
                    </Button>
                    <Button onClick={() => handleDownload('EN')} className="w-full">
                      {t("english")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <div className="flex items-center">
                <FaPhone className="mr-2 text-primary" />
                {personalInfo.phone}
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2 text-primary" />
                {personalInfo.location}
              </div>
              <div className="flex items-center">
                <FaGithub className="mr-2 text-primary" />
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  GitHub
                </a>
              </div>
              <div className="flex items-center">
                <FaLinkedin className="mr-2 text-primary" />
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-primary">{t("workexperience")}</CardTitle>
            </CardHeader>
            <CardContent>
              {experiences.map((exp, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  <h3 className="text-lg font-semibold">{exp.title}</h3>
                  <p className="text-primary">{exp.company}</p>
                  <p className="text-sm text-muted-foreground mb-2">{exp.period}</p>
                  <ul className="list-disc list-inside">
                    {exp.responsibilities.map((resp, idx) => (
                      <li key={idx} className="text-sm mb-1">
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResumePage;