import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageModal from "@/components/imagesmodal";
import { useTranslation } from "react-i18next";

function ProjectPage() {
  const { t } = useTranslation("projects");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleProjects, setVisibleProjects] = useState(4);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lazy load the MoreButton component
  const MoreButton = lazy(() => import("@/components/morebutton"));

  // Sample project data
  const allProjects = [
    {
      id: 1,
      title: t("title1"),
      description: t("description1"),
      image: "/src/assets/Projects/electricsbm/electricportada.png",
      images: [
        "/src/assets/Projects/electricsbm/electric1.png",
        "/src/assets/Projects/electricsbm/electric2.png",
        "/src/assets/Projects/electricsbm/electric3.png",
        "/src/assets/Projects/electricsbm/electric4.png",
      ],
      tags: ["React", "Tailwind", "Express", "MySQL"],
      githubUrl: "https://github.com/RVSolutionsplus507",
      liveUrl: "https://github.com/RVSolutionsplus507",
    },
    {
      id: 2,
      title: t("title2"),
      description: t("description2"),
      image: "/src/assets/Projects/solicitud/solicitudportada.png",
      images: [
        "/src/assets/Projects/solicitud/solicitud1.png",
        "/src/assets/Projects/solicitud/solicitud2.png",
        "/src/assets/Projects/solicitud/solicitudportada.png",
      ],
      tags: ["React", "React Hook Form", "Firebase"],
      githubUrl: "https://github.com/RVSolutionsplus507/solicitud-almacenajes",
      liveUrl: "https://solicitud.almacenajes.net/",
    },
    {
      id: 3,
      title: t("title3"),
      description: t("description3"),
      image: "src/assets/Projects/rvsstore/storeportada.png",
      images: [
        "src/assets/Projects/rvsstore/store1.png",
        "src/assets/Projects/rvsstore/store2.png",
        "src/assets/Projects/rvsstore/store3.png",
        "src/assets/Projects/rvsstore/storeportada.png",
      ],
      tags: ["React", "Firebase", "Tailwind"],
      githubUrl: "https://github.com/RVSolutionsplus507/RVStore",
      liveUrl: "https://rvstore.vercel.app/",
    },
    {
      id: 4,
      title: t("title4"),
      description: t("description4"),
      image: "src/assets/Projects/mauad/mauadportada.png",
      images: ["src/assets/Projects/soon.webp"],
      tags: ["React", "Tailwind", "Shadcn UI"],
      githubUrl: "https://github.com/RVSolutionsplus507/mauadweb",
      liveUrl: "https://mauadweb.vercel.app/",
    },
    {
      id: 5,
      title: t("title5"),
      description: t("description5"),
      image: "src/assets/Projects/soon.webp",
      images: ["src/assets/Projects/soon.webp"],
      tags: ["React", "Typescript", "Express", "MySQL"],
      githubUrl: "https://github.com/RVSolutionsplus507",
      liveUrl: "https://github.com/RVSolutionsplus507",
    },

    {
      id: 6,
      title: t("title6"),
      description: t("description6"),
      image: "src/assets/Projects/soon.webp",
      images: ["src/assets/Projects/soon.webp"],
      tags: ["React Native", "Firebase", "Redux"],
      githubUrl: "https://github.com/RVSolutionsplus507",
      liveUrl: "https://github.com/RVSolutionsplus507",
    },
  ];

  const filteredProjects = allProjects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const displayedProjects = filteredProjects.slice(0, visibleProjects);

  useEffect(() => {
    setShowMoreButton(filteredProjects.length > visibleProjects);
  }, [filteredProjects, visibleProjects]);

  const handleLoadMore = () => {
    setVisibleProjects((prevVisible) =>
      Math.min(prevVisible + 2, filteredProjects.length)
    );
  };

  const openImageModal = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen p-8 relative">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-default mb-4">
          {t("projects")}
        </h1>
        <p className="text-xl text-primary">{t("projectdescription")}</p>
      </motion.header>

      <div className="max-w-md mx-auto mb-8">
        <Input
          type="text"
          placeholder={t("search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
      >
        {displayedProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="h-full flex flex-col">
              <CardHeader>
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-fill rounded-t-lg cursor-pointer transition-transform duration-300 hover:scale-105"
                  onClick={() => openImageModal(project)}
                />
              </CardHeader>
              <CardContent className="flex-grow">
                <CardTitle>{project.title}</CardTitle>
                <CardDescription className="mt-2">
                  {project.description}
                </CardDescription>
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaGithub className="mr-2" />
                    GitHub
                  </a>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaExternalLinkAlt className="mr-2" />
                    {t("demo")}
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredProjects.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-gray-600 mt-8"
        >
          {t("noprojects")}
        </motion.p>
      )}

      <AnimatePresence>
        {showMoreButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center mt-8"
          >
            <Suspense fallback={<div>{t("loading")}</div>}>
              <MoreButton click={handleLoadMore} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedProject && (
        <ImageModal
          images={selectedProject.images}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default ProjectPage;
