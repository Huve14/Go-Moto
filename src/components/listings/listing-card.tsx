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
    >
      <Card className="group overflow-hidden card-hover h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={mainImage}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Status Badge */}
          {listing.status === 'reserved' && (
            <Badge className="absolute top-3 left-3 bg-amber-500/90 text-[#0B0F14] border-0">
              Reserved
            </Badge>
          )}
          
          {/* Featured Badge */}
          {listing.featured && (
            <Badge className="absolute top-3 left-3 bg-gomoto-500 text-[#0B0F14] border-0">
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
                'absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm transition-all',
                'hover:bg-white hover:scale-110',
                isFavorited && 'text-red-500'
              )}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={cn('h-5 w-5', isFavorited && 'fill-current')}
              />
            </button>
          )}

          {/* Quick Icons */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            {hasDeliveryBox && (
              <div className="p-1.5 rounded-full bg-[#0B0F14]/80 backdrop-blur-sm border border-slate-700/50" title="Delivery Box Included">
                <Package className="h-4 w-4 text-gomoto-400" />
              </div>
            )}
            {isFuelEfficient && (
              <div className="p-1.5 rounded-full bg-[#0B0F14]/80 backdrop-blur-sm border border-slate-700/50" title="Fuel Efficient">
                <Fuel className="h-4 w-4 text-gomoto-400" />
              </div>
            )}
            {isLowMaintenance && (
              <div className="p-1.5 rounded-full bg-[#0B0F14]/80 backdrop-blur-sm border border-slate-700/50" title="Low Maintenance">
                <Wrench className="h-4 w-4 text-gomoto-400" />
              </div>
            )}
          </div>
        </div>

        <CardContent className="flex-1 p-4">
          {/* Title & Location */}
          <div className="mb-3">
            <Link href={`/inventory/${listing.slug}`}>
              <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
            </Link>
            <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{listing.location}</span>
            </div>
          </div>

          {/* Tags */}
          {tagLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tagLabels.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tagLabels.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tagLabels.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Specs */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <span>{listing.year}</span>
            <span>•</span>
            <span>{listing.engine_cc}cc</span>
            <span>•</span>
            <span className="capitalize">{listing.condition}</span>
          </div>

          {/* Pricing */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(listing.price_weekly)}
              </span>
              <span className="text-muted-foreground">/week</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(listing.price_monthly)}/month • {formatCurrency(listing.deposit)} deposit
            </p>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 gap-2">
          <Button asChild className="flex-1">
            <Link href={`/inventory/${listing.slug}`}>View Details</Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            asChild
            className="text-gomoto-500 border-gomoto-500/30 hover:bg-gomoto-500/10 hover:border-gomoto-500/50"
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
