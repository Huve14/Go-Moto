'use client'

import { useEffect, useRef, ReactNode, useCallback } from 'react'
import { usePathname } from 'next/navigation'

interface ParallaxProviderProps {
  children: ReactNode
}

export function ParallaxProvider({ children }: ParallaxProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const initializeAnimations = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    }, observerOptions)

    // Reset and observe all elements with data-animate attribute
    const animatedElements = container.querySelectorAll('[data-animate]')
    animatedElements.forEach((el) => {
      // Check if element is already in viewport
      const rect = el.getBoundingClientRect()
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
      
      if (isInViewport) {
        // Immediately animate elements already in viewport
        el.classList.add('animate-in')
      } else {
        // Observe elements not yet in viewport
        observer.observe(el)
      }
    })

    return observer
  }, [])

  useEffect(() => {
    // Small delay to ensure DOM is ready after navigation
    const timer = setTimeout(() => {
      const observer = initializeAnimations()
      
      // Parallax scroll effect for background elements
      const handleScroll = () => {
        const scrollY = window.scrollY
        const parallaxBgs = document.querySelectorAll('.parallax-bg')
        
        parallaxBgs.forEach((bg) => {
          const element = bg as HTMLElement
          const speed = parseFloat(element.dataset.speed || '0.5')
          element.style.transform = `translateY(${scrollY * speed}px)`
        })

        // Floating parallax elements
        const floatElements = document.querySelectorAll('[data-parallax]')
        floatElements.forEach((el) => {
          const element = el as HTMLElement
          const speed = parseFloat(element.dataset.parallax || '0.1')
          const direction = element.dataset.parallaxDirection || 'up'
          const yOffset = direction === 'up' ? -scrollY * speed : scrollY * speed
          element.style.transform = `translateY(${yOffset}px)`
        })
      }

      window.addEventListener('scroll', handleScroll, { passive: true })

      return () => {
        observer?.disconnect()
        window.removeEventListener('scroll', handleScroll)
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [pathname, initializeAnimations])

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
  className?: string
  overlay?: boolean
}

export function ParallaxBackground({
  imageUrl,
  gradient,
  speed = 0.5,
  className = '',
  overlay = true,
}: ParallaxBackgroundProps) {
  const style: React.CSSProperties = {}
  
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
  className?: string
}

export function FloatingElement({
  children,
  speed = 'medium',
  direction = 'up',
  parallaxSpeed = 0.1,
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
    >
      {children}
    </div>
  )
}
