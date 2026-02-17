import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'
import { Button } from './button'
import Link from 'next/link'
import { ReactNode } from 'react'

interface PricingFeature {
  text: string
  included: boolean
}

interface PricingCardProps {
  title: string
  subtitle?: string
  price: string | number
  priceLabel?: string
  features: PricingFeature[]
  ctaText?: string
  ctaHref?: string
  featured?: boolean
  className?: string
  children?: ReactNode
}

export function PricingCard({
  title,
  subtitle,
  price,
  priceLabel = '/month',
  features,
  ctaText = 'Get Started',
  ctaHref = '/apply',
  featured = false,
  className,
  children,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl p-8 transition-all duration-300',
        'card-premium',
        'hover:-translate-y-2 hover:border-primary/30',
        featured && 'border-primary/50 ring-1 ring-primary/20',
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-2xl" />

      {/* Featured badge */}
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-4 py-1 rounded-full">
            MOST POPULAR
          </span>
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-1">{title}</h3>
          {subtitle && (
            <span className="text-sm text-muted-foreground">{subtitle}</span>
          )}
        </div>

        {/* Price */}
        <div className="text-center mb-8">
          <div className="inline-flex items-baseline">
            <span className="text-5xl font-bold text-gradient">
              {typeof price === 'number' ? `R${price.toLocaleString()}` : price}
            </span>
            <span className="text-muted-foreground ml-2">{priceLabel}</span>
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li
              key={index}
              className={cn(
                'flex items-center gap-3 text-sm',
                feature.included ? 'text-foreground/80' : 'text-muted-foreground/50'
              )}
            >
              {feature.included ? (
                <Check className="h-5 w-5 text-accent flex-shrink-0" />
              ) : (
                <X className="h-5 w-5 text-muted-foreground/30 flex-shrink-0" />
              )}
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          asChild
          className="w-full"
          variant={featured ? 'default' : 'outline'}
          size="lg"
        >
          <Link href={ctaHref}>{ctaText}</Link>
        </Button>

        {children}
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary/30 rounded-tl-2xl" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-accent/30 rounded-br-2xl" />
    </div>
  )
}
