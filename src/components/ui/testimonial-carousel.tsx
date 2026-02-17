'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import Image from 'next/image'

interface Testimonial {
  id: string | number
  content: string
  author: string
  role?: string
  avatar?: string
  rating?: number
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
  className?: string
  autoplay?: boolean
  autoplayInterval?: number
}

export function TestimonialCarousel({
  testimonials,
  className,
  autoplay = true,
  autoplayInterval = 5000,
}: TestimonialCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }, [testimonials.length])

  const prev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [testimonials.length])

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (autoplay && !isPaused && !prefersReducedMotion) {
      intervalRef.current = setInterval(next, autoplayInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoplay, isPaused, next, autoplayInterval])

  if (!testimonials.length) return null

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main testimonial display */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="w-full flex-shrink-0 px-4"
            >
              <div className="max-w-3xl mx-auto text-center">
                {/* Quote icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-autovent-500 to-teal-500 mb-8">
                  <Quote className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <blockquote className="text-xl md:text-2xl text-foreground/90 leading-relaxed mb-8">
                  "{testimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center justify-center gap-4">
                  {testimonial.avatar && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-autovent-500/30">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-foreground font-semibold">{testimonial.author}</p>
                    {testimonial.role && (
                      <p className="text-sm text-teal-400">{testimonial.role}</p>
                    )}
                  </div>
                </div>

                {/* Rating */}
                {testimonial.rating && (
                  <div className="flex items-center justify-center gap-1 mt-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={cn(
                          'w-5 h-5',
                          i < testimonial.rating! ? 'text-teal-400' : 'text-muted-foreground/20'
                        )}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-full glass text-foreground hover:bg-muted transition-colors"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full glass text-foreground hover:bg-muted transition-colors"
        aria-label="Next testimonial"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots indicator */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-300',
              index === activeIndex
                ? 'bg-gradient-to-r from-autovent-500 to-teal-500 w-8'
                : 'bg-muted-foreground/20 hover:bg-muted-foreground/40'
            )}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
