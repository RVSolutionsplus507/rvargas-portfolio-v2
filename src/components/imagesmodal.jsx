import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import PropTypes from 'prop-types'

function ImageModal({ images, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Project image ${currentIndex + 1}`}
              className="w-full h-[500px] object-fill"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 left-4 transform -translate-y-1/2"
            onClick={prevImage}
          >
            <FaChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-1/2 right-4 transform -translate-y-1/2"
            onClick={nextImage}
          >
            <FaChevronRight />
          </Button>
        </div>
        <div className="flex justify-center items-center p-4 bg-background">
          {images.map((_, index) => (
            <Button
              key={index}
              variant={index === currentIndex ? "default" : "outline"}
              size="sm"
              className="mx-1"
              onClick={() => setCurrentIndex(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
        <DialogClose className="absolute right-4 top-4" />
      </DialogContent>
    </Dialog>
  )
}
ImageModal.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default ImageModal