'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { ListingImage } from '@/types'

interface ImageGalleryProps {
  images: ListingImage[]
  title: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order)
  
  if (sortedImages.length === 0) {
    return (
      <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    )
  }

  const currentImage = sortedImages[currentIndex]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={currentImage.url}
                alt={`${title} - Image ${currentIndex + 1}`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {sortedImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Expand Button */}
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            aria-label="View full size"
          >
            <Expand className="h-5 w-5" />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
            {currentIndex + 1} / {sortedImages.length}
          </div>
        </div>

        {/* Thumbnails */}
        {sortedImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all',
                  index === currentIndex
                    ? 'ring-2 ring-primary ring-offset-2'
                    : 'opacity-70 hover:opacity-100'
                )}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={image.url}
                  alt={`${title} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
          <div className="relative w-full h-[90vh]">
            <Image
              src={currentImage.url}
              alt={`${title} - Image ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="95vw"
            />

            {/* Navigation */}
            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white">
              {currentIndex + 1} / {sortedImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
