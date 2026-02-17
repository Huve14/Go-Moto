'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
  variant?: 'default' | 'dark' | 'gradient' | 'parallax'
  containerSize?: 'default' | 'lg' | 'full'
  padding?: 'default' | 'lg' | 'none'
}

export function Section({
  children,
  className,
  id,
  variant = 'default',
  containerSize = 'default',
  padding = 'default',
}: SectionProps) {
  const variantClasses = {
    default: 'bg-background',
    dark: 'bg-muted',
    gradient: 'bg-gradient-to-b from-background via-background to-muted',
    parallax: 'relative overflow-hidden bg-background',
  }

  const paddingClasses = {
    default: 'py-20 lg:py-28',
    lg: 'py-28 lg:py-40',
    none: '',
  }

  const containerClasses = {
    default: 'container mx-auto px-4 sm:px-6 lg:px-8',
    lg: 'container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl',
    full: 'w-full',
  }

  return (
    <section
      id={id}
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        'relative',
        className
      )}
    >
      <div className={containerClasses[containerSize]}>{children}</div>
    </section>
  )
}

interface SectionHeaderProps {
  title: string
  subtitle?: string
  highlight?: string
  centered?: boolean
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  highlight,
  centered = true,
  className,
}: SectionHeaderProps) {
  // Split title to apply gradient to highlight word
  const renderTitle = () => {
    if (!highlight) {
      return <span className="text-foreground">{title}</span>
    }

    const parts = title.split(highlight)
    return (
      <>
        {parts[0] && <span className="text-line">{parts[0]}</span>}
        <span className="text-gradient">{highlight}</span>
        {parts[1] && <span className="text-foreground">{parts[1]}</span>}
      </>
    )
  }

  return (
    <div
      className={cn(
        centered && 'text-center',
        'mb-16',
        className
      )}
    >
      <h2 className="heading-lg text-foreground mb-6" data-animate="fade-up">
        {renderTitle()}
      </h2>
      {subtitle && (
        <p
          className="body-lg max-w-2xl mx-auto"
          data-animate="fade-up"
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
