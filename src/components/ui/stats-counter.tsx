'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface StatCounterProps {
  value: number
  label: string
  suffix?: string
  prefix?: string
  variant?: 'gradient' | 'outline'
  className?: string
}

export function StatCounter({
  value,
  label,
  suffix = '',
  prefix = '',
  variant = 'gradient',
  className,
}: StatCounterProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      setCount(value)
      return
    }

    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps
    const increment = value / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      if (currentStep >= steps) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(increment * currentStep))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [isVisible, value])

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex flex-col items-center justify-center p-8',
        className
      )}
    >
      {/* Background glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl" />
      
      <div className="relative z-10 text-center">
        <p
          className={cn(
            'text-5xl lg:text-6xl font-bold mb-2',
            variant === 'gradient' ? 'text-gradient' : 'text-line'
          )}
        >
          {prefix}{count}{suffix}
        </p>
        <p className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
          {label}
        </p>
      </div>
    </div>
  )
}

interface StatsGridProps {
  stats: Array<{
    value: number
    label: string
    suffix?: string
    prefix?: string
  }>
  className?: string
}

export function StatsGrid({ stats, className }: StatsGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-4 gap-8',
        className
      )}
    >
      {stats.map((stat, index) => (
        <StatCounter
          key={stat.label}
          value={stat.value}
          label={stat.label}
          suffix={stat.suffix}
          prefix={stat.prefix}
          variant={index % 2 === 0 ? 'gradient' : 'outline'}
        />
      ))}
    </div>
  )
}
