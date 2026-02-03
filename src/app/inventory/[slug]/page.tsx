import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, MapPin, MessageCircle, Calendar, Gauge, Settings, Fuel, CheckCircle2, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ImageGallery } from '@/components/listings/image-gallery'
import { ListingCard } from '@/components/listings/listing-card'
import { EarningsCalculator } from '@/components/calculator/earnings-calculator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, getWhatsAppUrl } from '@/lib/utils'
import { RIDER_TAGS } from '@/types/constants'

interface ListingPageProps {
  params: { slug: string }
}

async function getListing(slug: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('listings')
    .select('*, listing_images(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  return data as any
}

async function getRelatedListings(listingId: string, type: string, brand: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('listings')
    .select('*, listing_images(*)')
    .eq('status', 'published')
    .neq('id', listingId)
    .or(`type.eq.${type},brand.eq.${brand}`)
    .limit(4)
  return (data || []) as any[]
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const listing = await getListing(params.slug)
  
  if (!listing) {
    return { title: 'Listing Not Found' }
  }

  return {
    title: `${listing.title} | Go-Moto`,
    description: listing.description || `${listing.year} ${listing.brand} ${listing.model} available for rent or rent-to-own at Go-Moto. ${formatCurrency(listing.price_weekly)}/week.`,
    openGraph: {
      title: listing.title,
      description: listing.description || undefined,
      images: listing.listing_images?.[0]?.url ? [listing.listing_images[0].url] : undefined,
    },
  }
}

export default async function ListingPage({ params }: ListingPageProps) {
  const listing = await getListing(params.slug)

  if (!listing) {
    notFound()
  }

  const relatedListings = await getRelatedListings(listing.id, listing.type, listing.brand)
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27123456789'
  const whatsappMessage = `Hi, I'm interested in the ${listing.title} (ID: ${listing.id.slice(0, 8)})`

  // Get tag labels
  const tagLabels = listing.rider_tags?.map((tag: string) => {
    const found = RIDER_TAGS.find((t) => t.value === tag)
    return found?.label || tag
  }) || []

  // Parse specs
  const specs = listing.specs as Record<string, any> || {}

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/inventory"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Left Column - Images */}
          <div>
            <ImageGallery
              images={listing.listing_images || []}
              title={listing.title}
            />
          </div>

          {/* Right Column - Details */}
          <div className="mt-8 lg:mt-0">
            {/* Title & Location */}
            <div className="mb-6">
              {listing.featured && (
                <Badge className="mb-2 bg-gomoto-500">Featured</Badge>
              )}
              <h1 className="text-3xl font-display font-bold mb-2">
                {listing.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{listing.year}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {tagLabels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tagLabels.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Pricing Card */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Weekly</p>
                    <p className="text-3xl font-bold text-primary">
                      {formatCurrency(listing.price_weekly)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(listing.price_monthly)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3 border-t border-b">
                  <span className="text-muted-foreground">Deposit</span>
                  <span className="font-semibold">{formatCurrency(listing.deposit)}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-muted-foreground">Cash Price</span>
                  <span className="font-semibold">{formatCurrency(listing.price_cash)}</span>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Maintenance included</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Roadside assistance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Swap bike if unavailable</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button size="lg" className="w-full" asChild>
                <Link href={`/apply?listing=${listing.id}`}>
                  Apply for This Bike
                </Link>
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" asChild>
                  <Link href={`/contact?listing=${listing.id}&type=viewing`}>
                    Request Viewing
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                  asChild
                >
                  <a
                    href={getWhatsAppUrl(whatsappNumber, whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <Tabs defaultValue="specs">
            <TabsList>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="calculator">Earnings Calculator</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
            </TabsList>

            <TabsContent value="specs" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium capitalize">{listing.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Gauge className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Engine</p>
                        <p className="font-medium">{listing.engine_cc}cc</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Year</p>
                        <p className="font-medium">{listing.year}</p>
                      </div>
                    </div>
                    {listing.mileage && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Gauge className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Mileage</p>
                          <p className="font-medium">{listing.mileage.toLocaleString()} km</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Condition</p>
                        <p className="font-medium capitalize">{listing.condition}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Brand</p>
                        <p className="font-medium capitalize">{listing.brand}</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Specs */}
                  {Object.keys(specs).length > 0 && (
                    <>
                      <Separator className="my-6" />
                      <div className="grid sm:grid-cols-2 gap-4">
                        {Object.entries(specs).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground capitalize">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calculator" className="mt-6">
              <EarningsCalculator weeklyPayment={listing.price_weekly} />
            </TabsContent>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {listing.description || 'No description available for this listing.'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Listings */}
        {relatedListings.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-display font-bold mb-6">
              Similar Bikes
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedListings.map((related) => (
                <ListingCard
                  key={related.id}
                  listing={related}
                  showFavorite={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
