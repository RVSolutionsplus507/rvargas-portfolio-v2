import { useState, useEffect, lazy, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaGithub, FaExternalLinkAlt, FaLock } from "react-icons/fa"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ImageModal from "@/components/imagesmodal"
import { useTranslation } from "react-i18next"

import imageproject1 from "@/assets/Projects/electricsbm/electricportada.webp"
import imageproject4 from "@/assets/Projects/mauad/mauadweb/mauadportada.webp"
import imageproject5 from "@/assets/Projects/soon.webp"
import imageproject6 from "@/assets/Projects/mauad/arbolitov2/portadaarbolito.webp"

import otherimageelectric1 from "@/assets/Projects/electricsbm/electric1.webp"
import otherimageelectric2 from "@/assets/Projects/electricsbm/electric2.webp"
import otherimageelectric3 from "@/assets/Projects/electricsbm/electric3.webp"
import otherimageelectric4 from "@/assets/Projects/electricsbm/electric4.webp"
import otherimageelectric5 from "@/assets/Projects/electricsbm/electric5.webp"

import arbolito1 from "@/assets/Projects/mauad/arbolitov2/arbolito1.webp"
import arbolito2 from "@/assets/Projects/mauad/arbolitov2/arbolito2.webp"
import arbolito3 from "@/assets/Projects/mauad/arbolitov2/arbolito3.webp"
import arbolito4 from "@/assets/Projects/mauad/arbolitov2/arbolito4.webp"

import almacenajes1 from "@/assets/Projects/landingamd/almacenajes1.webp"
import almacenajes2 from "@/assets/Projects/landingamd/almacenajes2.webp"
import almacenajes3 from "@/assets/Projects/landingamd/almacenajes3.webp"
import almacenajes4 from "@/assets/Projects/landingamd/almacenajes4.webp"
import almacenajes5 from "@/assets/Projects/landingamd/almacenajes5.webp"
import almacenajes6 from "@/assets/Projects/landingamd/almacenajes6.webp"

import fiscal1 from "@/assets/Projects/rvsfiscal/fiscal1.webp"
import fiscal2 from "@/assets/Projects/rvsfiscal/fiscal2.webp"
import fiscal3 from "@/assets/Projects/rvsfiscal/fiscal3.webp"
import fiscal4 from "@/assets/Projects/rvsfiscal/fiscal4.webp"

import documenta1 from "@/assets/Projects/documentav2/documenta1.webp"
import documenta2 from "@/assets/Projects/documentav2/documenta2.webp"
import documenta3 from "@/assets/Projects/documentav2/documenta3.webp"
import documenta4 from "@/assets/Projects/documentav2/documenta4.webp"
import documenta5 from "@/assets/Projects/documentav2/documenta5.webp"
import documenta6 from "@/assets/Projects/documentav2/documenta6.webp"

import haus1 from "@/assets/Projects/landinghaus/hauspanama1.webp"
import haus3 from "@/assets/Projects/landinghaus/hauspanama3.webp"
import haus4 from "@/assets/Projects/landinghaus/hauspanama4.webp"
import haus5 from "@/assets/Projects/landinghaus/hauspanama5.webp"

import astre1 from "@/assets/Projects/landingastre/astrepanama1.webp"
import astre2 from "@/assets/Projects/landingastre/astrepanama2.webp"
import astre3 from "@/assets/Projects/landingastre/astrepanama3.webp"
import astre4 from "@/assets/Projects/landingastre/astrepanama4.webp"

import conectando1 from "@/assets/Projects/conectandomas/conectando1.webp"
import conectando2 from "@/assets/Projects/conectandomas/conectando2.webp"

import ponline1 from "@/assets/Projects/ponlineamd/ponline1.webp"
import ponline2 from "@/assets/Projects/ponlineamd/ponline2.webp"
import ponline3 from "@/assets/Projects/ponlineamd/ponline3.webp"
import ponline4 from "@/assets/Projects/ponlineamd/ponline4.webp"
import ponline5 from "@/assets/Projects/ponlineamd/ponline5.webp"
import ponline6 from "@/assets/Projects/ponlineamd/ponline6.webp"

function ProjectPage() {
  const { t } = useTranslation("projects")
  const [searchTerm, setSearchTerm] = useState("")
  const [visibleProjects, setVisibleProjects] = useState(4)
  const [showMoreButton, setShowMoreButton] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const MoreButton = lazy(() => import("@/components/morebutton"))

  const allProjects = [
    {
      id: 1,
      title: t("title1"),
      description: t("description1"),
      image: conectando1,
      images: [conectando1, conectando2],
      tags: ["Next.js", "Node.js", "API", "WebSockets"],
      githubUrl: "https://github.com/RVSolutionsplus507",
      liveUrl: "https://conectando-mas.com/",
      isPrivate: true,
    },
    {
      id: 2,
      title: t("title2"),
      description: t("description2"),
      image: ponline1,
      images: [ponline1, ponline2, ponline3, ponline4, ponline5, ponline6],
      tags: ["Next.js", "Node.js", "PostgreSQL"],
      githubUrl: "https://github.com/RVSolutionsplus507",
      liveUrl: "#",
      isPrivate: true,
    },
    {
      id: 3,
      title: t("title3"),
      description: t("description3"),
      image: almacenajes1,
      images: [almacenajes1, almacenajes2, almacenajes3, almacenajes4, almacenajes5, almacenajes6],
      tags: ["Astro", "Tailwind", "TypeScript"],
      githubUrl: "https://github.com/RVSolutionsplus507/landingamd",
      liveUrl: "https://almacenajes-minidepositos.com/",
      isPrivate: false,
    },
    {
      id: 4,
      title: t("title4"),
      description: t("description4"),
      image: fiscal1,
      images: [fiscal1, fiscal2, fiscal3, fiscal4],
      tags: ["Next.js", "Node.js", "PostgreSQL"],
      githubUrl: "https://github.com/RVSolutionsplus507",
      liveUrl: "https://fiscal.rv-solutions.net",
      isPrivate: true,
    },
    {
      id: 5,
      title: t("title5"),
      description: t("description5"),
      image: imageproject1,
      images: [otherimageelectric1, otherimageelectric2, otherimageelectric3, otherimageelectric4, otherimageelectric5],
      tags: ["React", "Tailwind", "Express", "MySQL"],
      githubUrl: "https://github.com/RVSolutionsplus507",
      liveUrl: "https://electric.shelterbaymarina.com",
      isPrivate: true,
    },
    {
      id: 6,
      title: t("title6"),
      description: t("description6"),
      image: imageproject6,
      images: [arbolito1, arbolito2, arbolito3, arbolito4],
      tags: ["React", "TypeScript", "Express", "MySQL"],
      githubUrl: "https://github.com/RVSolutionsplus507",
      liveUrl: "https://arbolitov2.vercel.app/",
      isPrivate: true,
    },
    {
      id: 7,
      title: t("title7"),
      description: t("description7"),
      image: haus1,
      images: [haus1, haus3, haus4, haus5],
      tags: ["Astro", "Tailwind", "TypeScript"],
      githubUrl: "https://github.com/RVSolutionsplus507",
      liveUrl: "https://hauspanama.com",
      isPrivate: true,
    },
    {
      id: 8,
      title: t("title8"),
      description: t("description8"),
      image: documenta1,
      images: [documenta1, documenta2, documenta3, documenta4, documenta5, documenta6],
      tags: ["Next.js", "Node.js", "PostgreSQL"],
      githubUrl: "https://github.com/RVSolutionsplus507",
      liveUrl: "#",
      isPrivate: true,
    },
    {
      id: 9,
      title: t("title9"),
      description: t("description9"),
      image: astre1,
      images: [astre1, astre2, astre3, astre4],
      tags: ["Astro", "Tailwind", "React"],
      githubUrl: "https://github.com/RVSolutionsplus507",
      liveUrl: "https://astrepanama.com",
      isPrivate: true,
    },
    {
      id: 10,
      title: t("title10"),
      description: t("description10"),
      image: imageproject5,
      images: [imageproject5],
      tags: ["React", "Tailwind", "Supabase"],
      githubUrl: "https://github.com/RVSolutionsplus507/conference-booking-system",
      liveUrl: "https://github.com/RVSolutionsplus507/conference-booking-system",
      isPrivate: false,
    },
    {
      id: 11,
      title: t("title11"),
      description: t("description11"),
      image: imageproject5,
      images: [imageproject5],
      tags: ["React", "React Hook Form", "Firebase"],
      githubUrl: "https://github.com/RVSolutionsplus507/solicitud-almacenajes",
      liveUrl: "https://solicitud.almacenajes.net/",
      isPrivate: false,
    },
    {
      id: 12,
      title: t("title12"),
      description: t("description12"),
      image: imageproject5,
      images: [imageproject5],
      tags: ["React", "Firebase", "Tailwind"],
      githubUrl: "https://github.com/RVSolutionsplus507/RVStore",
      liveUrl: "https://rvstore.vercel.app/",
      isPrivate: false,
    },
    {
      id: 13,
      title: t("title13"),
      description: t("description13"),
      image: imageproject4,
      images: [imageproject4, imageproject5],
      tags: ["React", "Tailwind", "Shadcn UI"],
      githubUrl: "https://github.com/RVSolutionsplus507/mauadweb",
      liveUrl: "https://mauadweb.vercel.app/",
      isPrivate: false,
    },
    {
      id: 14,
      title: t("title14"),
      description: t("description14"),
      image: imageproject5,
      images: [imageproject5],
      tags: ["React", "TypeScript", "Express", "MySQL"],
      githubUrl: "https://github.com/RVSolutionsplus507",
      liveUrl: "#",
      isPrivate: true,
    },
  ]

  const filteredProjects = allProjects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const displayedProjects = filteredProjects.slice(0, visibleProjects)

  useEffect(() => {
    setShowMoreButton(filteredProjects.length > visibleProjects)
  }, [filteredProjects, visibleProjects])

  const handleLoadMore = () => {
    setVisibleProjects((prevVisible) => Math.min(prevVisible + 2, filteredProjects.length))
  }

  const openImageModal = (project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const renderGithubButton = (project) => {
    if (project.isPrivate) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="cursor-not-allowed opacity-70">
                <FaLock className="mr-2" />
                GitHub
              </Button>
            </TooltipTrigger>
            <TooltipContent
              className="max-w-xs p-4 border rounded-md shadow-lg bg-card border-border"
              side="top"
              sideOffset={5}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <FaLock className="text-amber-500" />
                  <span className="font-semibold">Repositorio Privado</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Este repositorio es privado al ser un sistema elaborado para una compañía.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <Button variant="outline" size="sm" asChild>
        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
          <FaGithub className="mr-2" />
          GitHub
        </a>
      </Button>
    )
  }

  return (
    <div className="relative p-2 mx-auto overflow-x-auto lg:p-6 lg:overflow-y-auto">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h1 className="mb-4 text-4xl font-bold text-default">{t("projects")}</h1>
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
        className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2"
      >
        {displayedProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-xl dark:hover:shadow-primary/10 hover:-translate-y-1">
              <CardHeader>
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className="object-cover w-full transition-transform duration-300 rounded-t-lg cursor-pointer h-60 hover:scale-105"
                  onClick={() => openImageModal(project)}
                />
              </CardHeader>
              <CardContent className="flex-grow">
                <CardTitle className="text-foreground">{project.title}</CardTitle>
                <CardDescription className="mt-2 dark:text-slate-300">{project.description}</CardDescription>
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {renderGithubButton(project)}
                <Button variant="default" size="sm" asChild>
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
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
          className="mt-8 text-center text-gray-600 dark:text-gray-300"
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
        <ImageModal images={selectedProject.images} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}

export default ProjectPage
