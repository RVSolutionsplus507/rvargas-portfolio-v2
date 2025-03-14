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
import imageproject2 from "@/assets/Projects/solicitud/solicitudportada.webp"
import imageproject3 from "@/assets/Projects/rvsstore/storeportada.webp"
import imageproject4 from "@/assets/Projects/mauad/mauadweb/mauadportada.webp"
import imageproject5 from "@/assets/Projects/soon.webp"
import imageproject6 from "@/assets/Projects/mauad/arbolitov2/portadaarbolito.webp"

import otherimageelectric1 from "@/assets/Projects/electricsbm/electric1.webp"
import otherimageelectric2 from "@/assets/Projects/electricsbm/electric2.webp"
import otherimageelectric3 from "@/assets/Projects/electricsbm/electric3.webp"
import otherimageelectric4 from "@/assets/Projects/electricsbm/electric4.webp"
import otherimageelectric5 from "@/assets/Projects/electricsbm/electric5.webp"

import otherimagesolicitud1 from "@/assets/Projects/solicitud/solicitud1.webp"
import otherimagesolicitud2 from "@/assets/Projects/solicitud/solicitud2.webp"

import otherimagervsstore1 from "@/assets/Projects/rvsstore/store1.webp"
import otherimagervsstore2 from "@/assets/Projects/rvsstore/store2.webp"
import otherimagervsstore3 from "@/assets/Projects/rvsstore/store3.webp"

import conference1 from "@/assets/Projects/semahconference/Conference1.webp"
import conference2 from "@/assets/Projects/semahconference/Conference2.webp"
import conference3 from "@/assets/Projects/semahconference/Conference3.webp"
import conference4 from "@/assets/Projects/semahconference/Conference5.webp"
import conference5 from "@/assets/Projects/semahconference/Conference5.webp"

import arbolito1 from "@/assets/Projects/mauad/arbolitov2/arbolito1.webp"
import arbolito2 from "@/assets/Projects/mauad/arbolitov2/arbolito2.webp"
import arbolito3 from "@/assets/Projects/mauad/arbolitov2/arbolito3.webp"
import arbolito4 from "@/assets/Projects/mauad/arbolitov2/arbolito4.webp"

import landingamd1 from "@/assets/Projects/landingamd/landingamd1.webp"
import landingamd2 from "@/assets/Projects/landingamd/landingamd2.webp"
import landingamd3 from "@/assets/Projects/landingamd/landingamd3.webp"
import landingamd4 from "@/assets/Projects/landingamd/landingamd4.webp"
import landingamd5 from "@/assets/Projects/landingamd/landingamd5.webp"

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
      image: imageproject1,
      images: [otherimageelectric1, otherimageelectric2, otherimageelectric3, otherimageelectric4, otherimageelectric5],
      tags: ["React", "Tailwind", "Express", "MySQL"],
      githubUrl: "https://github.com/RVSolutionsplus507",
      liveUrl: "https://electric.shelterbaymarina.com",
      isPrivate: true,
    },
    {
      id: 2,
      title: t("title7"),
      description: t("description7"),
      image: imageproject6,
      images: [arbolito1, arbolito2, arbolito3, arbolito4],
      tags: ["React", "Typescript", "Express", "MySQL"],
      githubUrl: "https://github.com/RVSolutionsplus507",
      liveUrl: "https://arbolitov2.vercel.app/",
      isPrivate: true,
    },
    {
      id: 3,
      title: t("title8"),
      description: t("description8"),
      image: landingamd1,
      images: [landingamd1, landingamd2, landingamd3, landingamd4, landingamd5],
      tags: ["Astro", "Tailwind", "Typescript"],
      githubUrl: "https://github.com/RVSolutionsplus507/landingamd",
      liveUrl: "https://almacenajes-minidepositos.com/",
      isPrivate: false,
    },
    {
      id: 4,
      title: t("title6"),
      description: t("description6"),
      image: conference2,
      images: [conference1, conference2, conference3, conference4, conference5],
      tags: ["React", "Tailwind", "Supabase"],
      githubUrl: "https://github.com/RVSolutionsplus507/conference-booking-system",
      liveUrl: "https://github.com/RVSolutionsplus507/conference-booking-system",
      isPrivate: false,
    },
    {
      id: 5,
      title: t("title2"),
      description: t("description2"),
      image: imageproject2,
      images: [otherimagesolicitud1, otherimagesolicitud2, imageproject2],
      tags: ["React", "React Hook Form", "Firebase"],
      githubUrl: "https://github.com/RVSolutionsplus507/solicitud-almacenajes",
      liveUrl: "https://solicitud.almacenajes.net/",
      isPrivate: false,
    },
    {
      id: 6,
      title: t("title3"),
      description: t("description3"),
      image: imageproject3,
      images: [otherimagervsstore1, otherimagervsstore2, otherimagervsstore3, imageproject3],
      tags: ["React", "Firebase", "Tailwind"],
      githubUrl: "https://github.com/RVSolutionsplus507/RVStore",
      liveUrl: "https://rvstore.vercel.app/",
      isPrivate: false,
    },
    {
      id: 7,
      title: t("title4"),
      description: t("description4"),
      image: imageproject4,
      images: [imageproject4, imageproject5],
      tags: ["React", "Tailwind", "Shadcn UI"],
      githubUrl: "https://github.com/RVSolutionsplus507/mauadweb",
      liveUrl: "https://mauadweb.vercel.app/",
      isPrivate: false,
    },
    {
      id: 8,
      title: t("title5"),
      description: t("description5"),
      image: imageproject5,
      images: [imageproject5],
      tags: ["React", "Typescript", "Express", "MySQL"],
      githubUrl: "https://github.com/RVSolutionsplus507",
      liveUrl: "https://github.com/RVSolutionsplus507",
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
              <Button variant="outline" size="sm"  className="opacity-70 cursor-not-allowed">
                <FaLock className="mr-2" />
                GitHub
              </Button>
            </TooltipTrigger>
            <TooltipContent
              className="bg-card border border-border p-4 shadow-lg rounded-md max-w-xs"
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
    <div className="mx-auto lg:p-6 p-2 overflow-x-auto lg:overflow-y-auto relative">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-default mb-4">{t("projects")}</h1>
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
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-60 object-fill rounded-t-lg cursor-pointer transition-transform duration-300 hover:scale-105"
                  onClick={() => openImageModal(project)}
                />
              </CardHeader>
              <CardContent className="flex-grow">
                <CardTitle>{project.title}</CardTitle>
                <CardDescription className="mt-2">{project.description}</CardDescription>
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
        <ImageModal images={selectedProject.images} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}

export default ProjectPage

