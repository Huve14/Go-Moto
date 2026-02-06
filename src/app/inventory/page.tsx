import { Suspense } from 'react'
import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ListingCard } from '@/components/listings/listing-card'
import { ListingFilters } from '@/components/listings/listing-filters'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Inventory - Browse Bikes & Scooters',
  description: 'Browse our selection of bikes and scooters available for rental, rent-to-own, or purchase. Find the perfect bike for delivery or commuting.',
}

const ITEMS_PER_PAGE = 12

interface SearchParams {
  type?: string
  brand?: string
  condition?: string
  location?: string
  minPrice?: string
  maxPrice?: string
  tags?: string
  sort?: string
  search?: string
  page?: string
}

async function getListings(searchParams: SearchParams) {
  const supabase = createClient()
  
  let query = supabase
    .from('listings')
    .select('*, listing_images(*)', { count: 'exact' })
    .eq('status', 'published')

  // Apply filters
  if (searchParams.type) {
    query = query.eq('type', searchParams.type)
  }
  if (searchParams.brand) {
    query = query.eq('brand', searchParams.brand)
  }
  if (searchParams.condition) {
    query = query.eq('condition', searchParams.condition)
  }
  if (searchParams.location) {
    query = query.eq('location', searchParams.location)
  }
  if (searchParams.minPrice) {
    query = query.gte('price_weekly', parseInt(searchParams.minPrice))
  }
  if (searchParams.maxPrice) {
    query = query.lte('price_weekly', parseInt(searchParams.maxPrice))
  }
  if (searchParams.tags) {
    const tags = searchParams.tags.split(',')
    query = query.overlaps('rider_tags', tags)
  }
  if (searchParams.search) {
    query = query.or(`title.ilike.%${searchParams.search}%,brand.ilike.%${searchParams.search}%,model.ilike.%${searchParams.search}%`)
  }

  // Apply sorting
  switch (searchParams.sort) {
    case 'price_low':
      query = query.order('price_weekly', { ascending: true })
      break
    case 'price_high':
      query = query.order('price_weekly', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
  }

  // Pagination
  const page = parseInt(searchParams.page || '1')
  const start = (page - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE - 1
  query = query.range(start, end)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching listings:', error)
    return { listings: [] as any[], total: 0 }
  }

  return { listings: (data || []) as any[], total: count || 0 }
}

function ListingsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-muted aspect-[4/3] rounded-lg mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-6 bg-muted rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

async function ListingsGrid({ searchParams }: { searchParams: SearchParams }) {
  const { listings, total } = await getListings(searchParams)
  const currentPage = parseInt(searchParams.page || '1')
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No bikes found matching your criteria.</p>
        <Button variant="outline" asChild>
          <Link href="/inventory">Clear Filters</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          Showing {listings.length} of {total} bikes
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            showFavorite={false}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage <= 1}
            asChild
          >
            <Link
              href={{
                pathname: '/inventory',
                query: { ...searchParams, page: currentPage - 1 },
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1
              const isActive = page === currentPage
              
              // Show limited pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={isActive ? 'default' : 'outline'}
                    size="icon"
                    asChild
                  >
                    <Link
                      href={{
                        pathname: '/inventory',
                        query: { ...searchParams, page },
                      }}
                    >
                      {page}
                    </Link>
                  </Button>
                )
              }
              
              if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2">...</span>
              }
              
              return null
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            disabled={currentPage >= totalPages}
            asChild
          >
            <Link
              href={{
                pathname: '/inventory',
                query: { ...searchParams, page: currentPage + 1 },
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </>
  )
}

export default function InventoryPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-br from-background to-muted text-foreground py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-display font-bold mb-4">
            Browse Our Inventory
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Find the perfect bike or scooter for your delivery business or daily commute. 
            All bikes include maintenance and roadside assistance.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              <Suspense fallback={<div className="animate-pulse space-y-4">
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>}>
                <ListingFilters />
              </Suspense>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Filters */}
            <div className="lg:hidden mb-6">
              <Suspense fallback={<div className="h-10 bg-muted rounded animate-pulse"></div>}>
                <ListingFilters />
              </Suspense>
            </div>

            {/* Listings */}
            <Suspense fallback={<ListingsSkeleton />}>
              <ListingsGrid searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
