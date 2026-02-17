'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

interface BrandMarqueeProps {
  brands: string[]
  className?: string
  speed?: 'slow' | 'medium' | 'fast'
}

export function BrandMarquee({
  brands,
  className,
  speed = 'medium',
}: BrandMarqueeProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const speedDuration = {
    slow: '50s',
    medium: '30s',
    fast: '15s',
  }

  // Double the brands for seamless loop
  const duplicatedBrands = [...brands, ...brands]

  return (
    <div className={cn('relative overflow-hidden py-6', className)}>
      {/* Gradient edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

      <div
        className={cn(
          'flex gap-16 whitespace-nowrap',
          !prefersReducedMotion && 'animate-marquee'
        )}
        style={{
          animationDuration: speedDuration[speed],
        }}
      >
        {duplicatedBrands.map((brand, index) => (
          <div key={`${brand}-${index}`} className="flex items-center gap-4">
            <span className="text-xl md:text-2xl font-bold text-foreground uppercase tracking-wider">
              {brand}
            </span>
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-autovent-500 to-teal-500" />
          </div>
        ))}
      </div>
    </div>
  )
}

interface PartnerLogosProps {
  partners: Array<{
    name: string
    logo?: string
  }>
  className?: string
}

export function PartnerLogos({ partners, className }: PartnerLogosProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center',
        className
      )}
    >
      {partners.map((partner) => (
        <div
          key={partner.name}
          className="flex items-center justify-center p-6 rounded-xl bg-muted border border-border hover:border-autovent-500/30 transition-colors"
        >
          {partner.logo ? (
            <img
              src={partner.logo}
              alt={partner.name}
              className="h-8 w-auto opacity-60 hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0"
            />
          ) : (
            <span className="text-muted-foreground font-semibold text-sm uppercase tracking-wider">
              {partner.name}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
