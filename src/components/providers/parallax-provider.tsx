'use client'

import { useEffect, useRef, ReactNode, useCallback } from 'react'
import { usePathname } from 'next/navigation'

// Types for cached parallax elements
interface CachedParallaxElement {
  element: HTMLElement
  speed: number
  direction: 'up' | 'down'
  maxOffset: number
}

interface CachedBackgroundElement {
  element: HTMLElement
  speed: number
  maxOffset: number
}

interface ParallaxProviderProps {
  children: ReactNode
}

export function ParallaxProvider({ children }: ParallaxProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  
  // Cached element refs
  const parallaxBgsRef = useRef<CachedBackgroundElement[]>([])
  const floatElementsRef = useRef<CachedParallaxElement[]>([])
  const rafIdRef = useRef<number | null>(null)
  const tickingRef = useRef(false)
  const prefersReducedMotionRef = useRef(false)

  // Cache DOM elements to avoid querying on every scroll
  const cacheElements = useCallback(() => {
    // Cache background elements
    const bgs = document.querySelectorAll('.parallax-bg')
    parallaxBgsRef.current = Array.from(bgs).map((bg) => {
      const element = bg as HTMLElement
      return {
        element,
        speed: parseFloat(element.dataset.speed || '0.3'),
        maxOffset: parseFloat(element.dataset.maxOffset || '80'),
      }
    })

    // Cache floating/parallax elements
    const floats = document.querySelectorAll('[data-parallax]')
    floatElementsRef.current = Array.from(floats).map((el) => {
      const element = el as HTMLElement
      return {
        element,
        speed: parseFloat(element.dataset.parallax || '0.08'),
        direction: (element.dataset.parallaxDirection as 'up' | 'down') || 'up',
        maxOffset: parseFloat(element.dataset.maxOffset || '40'),
      }
    })
  }, [])

  // Element-relative parallax calculation
  const calculateElementParallax = useCallback((
    element: HTMLElement,
    speed: number,
    direction: 'up' | 'down',
    maxOffset: number
  ): number => {
    const rect = element.getBoundingClientRect()
    const windowHeight = window.innerHeight
    
    // Check if element is near viewport (with buffer)
    const buffer = 200
    if (rect.bottom < -buffer || rect.top > windowHeight + buffer) {
      return 0
    }
    
    // Calculate progress: 0 = element at bottom of viewport, 1 = element at top
    const elementCenter = rect.top + rect.height / 2
    const progress = 1 - (elementCenter / windowHeight)
    
    // Calculate offset based on progress (-1 to 1 range centered)
    const normalizedProgress = (progress - 0.5) * 2
    let offset = normalizedProgress * speed * 100
    
    // Apply direction
    if (direction === 'down') {
      offset = -offset
    }
    
    // Clamp to maxOffset
    return Math.max(-maxOffset, Math.min(maxOffset, offset))
  }, [])

  // Update parallax transforms using rAF
  const updateParallax = useCallback(() => {
    if (prefersReducedMotionRef.current) {
      tickingRef.current = false
      return
    }

    // Update background elements
    parallaxBgsRef.current.forEach(({ element, speed, maxOffset }) => {
      const rect = element.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Only update if in/near viewport
      if (rect.bottom >= -100 && rect.top <= windowHeight + 100) {
        const progress = 1 - (rect.top / windowHeight)
        const normalizedProgress = (progress - 0.5) * 2
        let offset = normalizedProgress * speed * 150
        offset = Math.max(-maxOffset, Math.min(maxOffset, offset))
        
        element.style.transform = `translate3d(0, ${offset}px, 0)`
      }
    })

    // Update floating elements
    floatElementsRef.current.forEach(({ element, speed, direction, maxOffset }) => {
      const offset = calculateElementParallax(element, speed, direction, maxOffset)
      element.style.transform = `translate3d(0, ${offset}px, 0)`
    })

    tickingRef.current = false
  }, [calculateElementParallax])

  // Scroll handler with rAF throttling
  const handleScroll = useCallback(() => {
    if (!tickingRef.current) {
      tickingRef.current = true
      rafIdRef.current = requestAnimationFrame(updateParallax)
    }
  }, [updateParallax])

  // Clear transforms for reduced motion
  const clearTransforms = useCallback(() => {
    parallaxBgsRef.current.forEach(({ element }) => {
      element.style.transform = ''
    })
    floatElementsRef.current.forEach(({ element }) => {
      element.style.transform = ''
    })
  }, [])

  // Initialize animations (IntersectionObserver for fade-in)
  const initializeAnimations = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    }, observerOptions)

    const animatedElements = container.querySelectorAll('[data-animate]')
    animatedElements.forEach((el) => {
      const rect = el.getBoundingClientRect()
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
      
      if (isInViewport) {
        el.classList.add('animate-in')
      } else {
        observer.observe(el)
      }
    })

    return observer
  }, [])

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotionRef.current = mediaQuery.matches

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches
      if (e.matches) {
        clearTransforms()
      }
    }

    mediaQuery.addEventListener('change', handleMotionChange)

    // Small delay to ensure DOM is ready after navigation
    const timer = setTimeout(() => {
      cacheElements()
      const observer = initializeAnimations()
      
      // Initial parallax update
      if (!prefersReducedMotionRef.current) {
        updateParallax()
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', cacheElements, { passive: true })

      return () => {
        observer?.disconnect()
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', cacheElements)
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current)
        }
      }
    }, 50)

    return () => {
      clearTimeout(timer)
      mediaQuery.removeEventListener('change', handleMotionChange)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', cacheElements)
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [pathname, cacheElements, initializeAnimations, handleScroll, updateParallax, clearTransforms])

  return (
    <div ref={containerRef} className="parallax-wrapper">
      {children}
    </div>
  )
}

// Animated section wrapper
interface AnimatedSectionProps {
  children: ReactNode
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale'
  delay?: number
  className?: string
}

export function AnimatedSection({
  children,
  animation = 'fade-up',
  delay = 0,
  className = '',
}: AnimatedSectionProps) {
  return (
    <div
      data-animate={animation}
      data-delay={delay}
      className={className}
    >
      {children}
    </div>
  )
}

// Parallax background component
interface ParallaxBackgroundProps {
  imageUrl?: string
  gradient?: string
  speed?: number
  maxOffset?: number
  className?: string
  overlay?: boolean
}

export function ParallaxBackground({
  imageUrl,
  gradient,
  speed = 0.3,
  maxOffset = 80,
  className = '',
  overlay = true,
}: ParallaxBackgroundProps) {
  const style: React.CSSProperties = {
    willChange: 'transform',
  }
  
  if (imageUrl) {
    style.backgroundImage = `url(${imageUrl})`
  }
  
  if (gradient) {
    style.background = gradient
  }

  return (
    <>
      <div
        className={`parallax-bg ${className}`}
        data-speed={speed}
        data-max-offset={maxOffset}
        style={style}
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-0" />
      )}
    </>
  )
}

// Floating element component
interface FloatingElementProps {
  children: ReactNode
  speed?: 'slow' | 'medium' | 'fast'
  direction?: 'up' | 'down'
  parallaxSpeed?: number
  maxOffset?: number
  className?: string
}

export function FloatingElement({
  children,
  speed = 'medium',
  direction = 'up',
  parallaxSpeed = 0.08,
  maxOffset = 40,
  className = '',
}: FloatingElementProps) {
  const floatClass = 
    speed === 'slow' ? 'float-slow' : 
    speed === 'fast' ? 'float-fast' : 'float-medium'

  return (
    <div
      className={`${floatClass} ${className}`}
      data-parallax={parallaxSpeed}
      data-parallax-direction={direction}
      data-max-offset={maxOffset}
      style={{ willChange: 'transform' }}
    >
      {children}
    </div>
  )
}
