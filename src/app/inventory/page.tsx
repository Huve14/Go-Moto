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
        <div key={i} className="animate-pulse bg-navy-900/60 border border-white/10 rounded-2xl overflow-hidden">
          <div className="bg-white/5 aspect-[4/3]" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-white/10 rounded-lg w-3/4" />
            <div className="h-4 bg-white/10 rounded-lg w-1/2" />
            <div className="h-8 bg-white/10 rounded-lg w-1/3" />
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
        <p className="text-white/60 mb-4">No bikes found matching your criteria.</p>
        <Button variant="outline" asChild>
          <Link href="/inventory">Clear Filters</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/60">
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
                return <span key={page} className="px-2 text-white/50">...</span>
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
    <div className="min-h-screen bg-navy-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 text-white py-20 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-autovent-500/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px]" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Browse Our <span className="text-gradient">Inventory</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Find the perfect bike or scooter for your delivery business or daily commute. 
            All bikes include maintenance and roadside assistance.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-4 lg:gap-10">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 glass border border-border p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-foreground mb-5">Filters</h2>
              <Suspense fallback={<div className="animate-pulse space-y-4">
                <div className="h-10 bg-white/5 rounded-xl"></div>
                <div className="h-10 bg-white/5 rounded-xl"></div>
                <div className="h-10 bg-white/5 rounded-xl"></div>
              </div>}>
                <ListingFilters />
              </Suspense>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Filters */}
            <div className="lg:hidden mb-8">
              <Suspense fallback={<div className="h-10 bg-white/5 rounded-xl animate-pulse"></div>}>
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
