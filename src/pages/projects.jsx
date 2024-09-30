import { useState, useEffect, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ImageModal from '@/components/imagesmodal'

// Lazy load the MoreButton component
const MoreButton = lazy(() => import('@/components/morebutton'))

// Sample project data
const allProjects = [
  {
    id: 1,
    title: "E-commerce Platform",
    description: "A full-stack e-commerce solution with React and Node.js",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=300&h=200&q=80",
    images: [
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&h=500&q=80"
    ],
    tags: ["React", "Node.js", "MongoDB"],
    githubUrl: "https://github.com/yourusername/ecommerce-platform",
    liveUrl: "https://ecommerce-platform-demo.com"
  },
  {
    id: 2,
    title: "Weather App",
    description: "Real-time weather forecasting app using OpenWeatherMap API",
    image: "https://images.unsplash.com/photo-1530908295418-a12e326966ba?auto=format&fit=crop&w=300&h=200&q=80",
    images: [
      "https://images.unsplash.com/photo-1530908295418-a12e326966ba?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1590055531615-f16d36ffe8ec?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1601134467661-3d775b999c8b?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1592210454359-9043f067919b?auto=format&fit=crop&w=800&h=500&q=80"
    ],
    tags: ["React", "API Integration", "CSS3"],
    githubUrl: "https://github.com/yourusername/weather-app",
    liveUrl: "https://weather-app-demo.com"
  },
  {
    id: 3,
    title: "Task Manager",
    description: "A productivity app for managing daily tasks and projects",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=300&h=200&q=80",
    images: [
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1606327054629-64c8b0fd6e4f?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=800&h=500&q=80"
    ],
    tags: ["Vue.js", "Firebase", "Vuex"],
    githubUrl: "https://github.com/yourusername/task-manager",
    liveUrl: "https://task-manager-demo.com"
  },
  {
    id: 4,
    title: "Portfolio Website",
    description: "Personal portfolio showcasing projects and skills",
    image: "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?auto=format&fit=crop&w=300&h=200&q=80",
    images: [
      "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&h=500&q=80"
    ],
    tags: ["HTML5", "CSS3", "JavaScript"],
    githubUrl: "https://github.com/yourusername/portfolio",
    liveUrl: "https://yourusername.com"
  },
  {
    id: 5,
    title: "Blog Platform",
    description: "A custom-built blogging platform with CMS capabilities",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=300&h=200&q=80",
    images: [
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&h=500&q=80"
    ],
    tags: ["Next.js", "GraphQL", "Tailwind CSS"],
    githubUrl: "https://github.com/yourusername/blog-platform",
    liveUrl: "https://blog-platform-demo.com"
  },
  {
    id: 6,
    title: "Fitness Tracker",
    description: "Mobile app for tracking workouts and nutrition",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=300&h=200&q=80",
    images: [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&h=500&q=80",
      "https://images.unsplash.com/photo-1579126038374-6064e9370f0f?auto=format&fit=crop&w=800&h=500&q=80"
    ],
    tags: ["React Native", "Firebase", "Redux"],
    githubUrl: "https://github.com/yourusername/fitness-tracker",
    liveUrl: "https://fitness-tracker-demo.com"
  }
]

function ProjectPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [visibleProjects, setVisibleProjects] = useState(4)
  const [showMoreButton, setShowMoreButton] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredProjects = allProjects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const displayedProjects = filteredProjects.slice(0, visibleProjects)

  useEffect(() => {
    setShowMoreButton(filteredProjects.length > visibleProjects)
  }, [filteredProjects, visibleProjects])

  const handleLoadMore = () => {
    setVisibleProjects(prevVisible => Math.min(prevVisible + 2, filteredProjects.length))
  }

  const openImageModal = (project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen p-8 relative">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-default mb-4">My Projects</h1>
        <p className="text-xl text-primary">Explore my latest work and side projects</p>
      </motion.header>

      <div className="max-w-md mx-auto mb-8">
        <Input
          type="text"
          placeholder="Search projects..."
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
                  className="w-full h-48 object-cover rounded-t-lg cursor-pointer transition-transform duration-300 hover:scale-105"
                  onClick={() => openImageModal(project)}
                />
              </CardHeader>
              <CardContent className="flex-grow">
                <CardTitle>{project.title}</CardTitle>
                <CardDescription className="mt-2">{project.description}</CardDescription>
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <FaGithub className="mr-2" />
                    GitHub
                  </a>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <FaExternalLinkAlt className="mr-2" />
                    Live Demo
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
          No projects found matching your search.
        </motion.p>
      )}

      <AnimatePresence>
        {showMoreButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className='flex justify-center mt-8'
          >
            <Suspense fallback={<div>Loading...</div>}>
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
  )
}

export default ProjectPage