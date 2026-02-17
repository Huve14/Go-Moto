'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin, MessageCircle, Fuel, Wrench, Package } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, getWhatsAppUrl, cn } from '@/lib/utils'
import type { ListingWithImages } from '@/types'
import { RIDER_TAGS } from '@/types/constants'

interface ListingCardProps {
  listing: ListingWithImages
  onFavorite?: (listingId: string) => void
  isFavorited?: boolean
  showFavorite?: boolean
}

export function ListingCard({
  listing,
  onFavorite,
  isFavorited = false,
  showFavorite = true,
}: ListingCardProps) {
  const mainImage = listing.listing_images?.[0]?.url || '/placeholder-bike.jpg'
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27123456789'
  const whatsappMessage = `Hi, I'm interested in the ${listing.title} (ID: ${listing.id.slice(0, 8)})`

  // Get tag labels for display
  const tagLabels = listing.rider_tags?.map((tag) => {
    const found = RIDER_TAGS.find((t) => t.value === tag)
    return found?.label || tag
  }) || []

  const hasDeliveryBox = listing.rider_tags?.includes('delivery_box_included')
  const isFuelEfficient = listing.rider_tags?.includes('fuel_efficient')
  const isLowMaintenance = listing.rider_tags?.includes('low_maintenance')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="group overflow-hidden card-hover h-full flex flex-col border border-white/10 shadow-lg shadow-navy-950/50 rounded-2xl bg-navy-900/60 backdrop-blur-sm">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
          <Image
            src={mainImage}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Status Badge */}
          {listing.status === 'reserved' && (
            <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0 shadow-lg">
              Reserved
            </Badge>
          )}
          
          {/* Featured Badge */}
          {listing.featured && (
            <Badge variant="featured" className="absolute top-3 left-3">
              Featured
            </Badge>
          )}
          
          {/* Favorite Button */}
          {showFavorite && onFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onFavorite(listing.id)
              }}
              className={cn(
                'absolute top-3 right-3 p-2.5 rounded-xl bg-navy-900/80 backdrop-blur-sm transition-all shadow-lg border border-white/10',
                'hover:bg-navy-800 hover:scale-110',
                isFavorited && 'text-teal-400'
              )}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={cn('h-5 w-5 text-white', isFavorited && 'fill-teal-400 text-teal-400')}
              />
            </button>
          )}

          {/* Quick Icons */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            {hasDeliveryBox && (
              <div className="p-2 rounded-xl bg-navy-900/80 backdrop-blur-sm" title="Delivery Box Included">
                <Package className="h-4 w-4 text-white" />
              </div>
            )}
            {isFuelEfficient && (
              <div className="p-2 rounded-xl bg-navy-900/80 backdrop-blur-sm" title="Fuel Efficient">
                <Fuel className="h-4 w-4 text-white" />
              </div>
            )}
            {isLowMaintenance && (
              <div className="p-2 rounded-xl bg-navy-900/80 backdrop-blur-sm" title="Low Maintenance">
                <Wrench className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>

        <CardContent className="flex-1 p-5 flex flex-col">
          {/* Title & Location */}
          <div className="mb-4">
            <Link href={`/inventory/${listing.slug}`}>
              <h3 className="font-semibold text-lg line-clamp-1 text-foreground group-hover:text-teal-400 transition-colors">
                {listing.title}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="line-clamp-1">{listing.location}</span>
            </div>
          </div>

          {/* Tags - fixed height container */}
          <div className="min-h-[32px] mb-4">
            {tagLabels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tagLabels.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs rounded-lg bg-white/5 border-white/10 text-white/80">
                    {tag}
                  </Badge>
                ))}
                {tagLabels.length > 3 && (
                  <Badge variant="outline" className="text-xs rounded-lg border-white/20 text-white/60">
                    +{tagLabels.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="flex items-center gap-3 text-sm text-white/50 mb-5">
            <span>{listing.year}</span>
            <span className="text-white/30">•</span>
            <span>{listing.engine_cc}cc</span>
            <span className="text-white/30">•</span>
            <span className="capitalize">{listing.condition}</span>
          </div>

          {/* Pricing - pushed to bottom */}
          <div className="space-y-1.5 mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gradient">
                {formatCurrency(listing.price_weekly)}
              </span>
              <span className="text-white/60 font-medium">/week</span>
            </div>
            <p className="text-sm text-white/50">
              {formatCurrency(listing.price_monthly)}/month • {formatCurrency(listing.deposit)} deposit
            </p>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0 gap-3">
          <Button asChild className="flex-1" size="lg">
            <Link href={`/inventory/${listing.slug}`}>View Details</Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            asChild
            className="h-12 w-12 rounded-xl text-teal-400 border-teal-400/30 hover:bg-teal-400/10 hover:border-teal-400/50"
          >
            <a
              href={getWhatsAppUrl(whatsappNumber, whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact via WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
