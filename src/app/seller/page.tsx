'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Plus,
  Eye,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Loader2,
  CreditCard,
  CheckCircle,
  Clock,
  Pause,
  FileText,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'

interface Subscription {
  id: string
  status: string
  current_period_end: string
  listing_plans: {
    name: string
    slug: string
    max_active_listings: number
  }
}

interface Listing {
  id: string
  title: string
  slug: string
  price: number
  listing_status: string
  created_at: string
  updated_at: string
  listing_metrics: {
    views: number
    inquiries: number
  }[]
  images: { url: string }[]
}

interface Lead {
  id: string
  created_at: string
  name: string
  email: string
  message: string
  is_read: boolean
  listings: {
    title: string
    slug: string
  }
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  draft: { label: 'Draft', variant: 'secondary', icon: FileText },
  pending_review: { label: 'Pending Review', variant: 'outline', icon: Clock },
  published: { label: 'Published', variant: 'default', icon: CheckCircle },
  paused: { label: 'Paused', variant: 'outline', icon: Pause },
  rejected: { label: 'Rejected', variant: 'destructive', icon: AlertCircle },
  sold: { label: 'Sold', variant: 'secondary', icon: CheckCircle },
}

function formatPrice(amount: number): string {
  return `R${amount.toLocaleString('en-ZA')}`
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function SellerDashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const showSuccess = searchParams.get('success') === '1'
  
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState({
    totalViews: 0,
    totalInquiries: 0,
    activeListings: 0,
    listingLimit: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = createClient()
  
  useEffect(() => {
    async function loadDashboard() {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/seller')
        return
      }
      
      setUser(user)
      
      // Fetch subscription (cast to any for new tables)
      const { data: sub } = await supabase
        .from('subscriptions')
        .select(`
          id,
          status,
          current_period_end,
          listing_plans (
            name,
            slug,
            max_active_listings
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['active', 'past_due'])
        .single() as { data: any; error: any }
      
      setSubscription(sub as any)
      
      // Fetch listings with metrics (cast to any for new columns)
      const { data: listingsData } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          slug,
          price,
          listing_status,
          created_at,
          updated_at,
          listing_metrics (
            views,
            inquiries
          ),
          images
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10) as { data: any; error: any }
      
      setListings((listingsData as Listing[]) || [])
      
      // Fetch recent leads (cast to any for new table)
      const { data: leadsData } = await supabase
        .from('listing_inquiries')
        .select(`
          id,
          created_at,
          name,
          email,
          message,
          is_read,
          listings (
            title,
            slug
          )
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5) as { data: any; error: any }
      
      setRecentLeads((leadsData as Lead[]) || [])
      
      // Calculate stats
      const totalViews = (listingsData || []).reduce((sum: number, l: any) => 
        sum + (l.listing_metrics?.[0]?.views || 0), 0
      )
      const totalInquiries = (listingsData || []).reduce((sum: number, l: any) => 
        sum + (l.listing_metrics?.[0]?.inquiries || 0), 0
      )
      const activeListings = (listingsData || []).filter((l: any) => 
        l.listing_status === 'published'
      ).length
      
      setStats({
        totalViews,
        totalInquiries,
        activeListings,
        listingLimit: (sub as any)?.listing_plans?.max_active_listings || 0,
      })
      
      setIsLoading(false)
    }
    
    loadDashboard()
  }, [])
  
  const canCreateListing = subscription && stats.activeListings < stats.listingLimit
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold">Seller Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your listings and track performance
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/seller/billing">
                <Button variant="outline" size="sm">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing
                </Button>
              </Link>
              
              <Link href="/seller/listings/new">
                <Button size="sm" disabled={!canCreateListing}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Listing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                Subscription activated!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                You can now create and publish your listings.
              </p>
            </div>
          </div>
        )}
        
        {/* No Subscription Warning */}
        {!subscription && (
          <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                    No Active Subscription
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    You need an active subscription to publish listings. Choose a plan to get started.
                  </p>
                  <Link href="/list-your-bike">
                    <Button size="sm" className="mt-3">
                      View Plans
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Subscription Info */}
        {subscription && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {subscription.listing_plans.name} Plan
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Renews {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Listings Used</div>
                  <div className="text-lg font-semibold">
                    {stats.activeListings} / {stats.listingLimit}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Eye className="h-4 w-4" />
                Total Views
              </div>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <MessageSquare className="h-4 w-4" />
                Inquiries
              </div>
              <div className="text-2xl font-bold">{stats.totalInquiries.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <FileText className="h-4 w-4" />
                Active Listings
              </div>
              <div className="text-2xl font-bold">{stats.activeListings}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingUp className="h-4 w-4" />
                Conversion Rate
              </div>
              <div className="text-2xl font-bold">
                {stats.totalViews > 0 
                  ? `${((stats.totalInquiries / stats.totalViews) * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Listings Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Listings</CardTitle>
                  <CardDescription>Manage your bike listings</CardDescription>
                </div>
                <Link href="/seller/listings">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {listings.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No listings yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first listing to start selling.
                    </p>
                    {canCreateListing && (
                      <Link href="/seller/listings/new">
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Listing
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Listing</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                        <TableHead className="text-right">Leads</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listings.map((listing) => {
                        const status = STATUS_CONFIG[listing.listing_status] || STATUS_CONFIG.draft
                        const StatusIcon = status.icon
                        
                        return (
                          <TableRow key={listing.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-muted rounded overflow-hidden shrink-0">
                                  {listing.images?.[0] && (
                                    <img 
                                      src={listing.images[0].url} 
                                      alt="" 
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium line-clamp-1">{listing.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatPrice(listing.price)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={status.variant} className="gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {listing.listing_metrics?.[0]?.views || 0}
                            </TableCell>
                            <TableCell className="text-right">
                              {listing.listing_metrics?.[0]?.inquiries || 0}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/seller/listings/${listing.id}/edit`}>
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  {listing.listing_status === 'published' && (
                                    <DropdownMenuItem asChild>
                                      <Link href={`/inventory/${listing.slug}`} target="_blank">
                                        View Live
                                        <ExternalLink className="h-3 w-3 ml-2" />
                                      </Link>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Leads */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Inquiries</CardTitle>
                  <CardDescription>Buyer messages</CardDescription>
                </div>
                <Link href="/seller/leads">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentLeads.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No inquiries yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Inquiries from buyers will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentLeads.map((lead) => (
                      <div 
                        key={lead.id}
                        className={`p-3 rounded-lg border ${
                          !lead.is_read ? 'bg-primary/5 border-primary/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-medium text-sm">{lead.name}</span>
                          {!lead.is_read && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {lead.message}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Re: {lead.listings?.title}
                          </span>
                          <span className="text-muted-foreground">
                            {formatDate(lead.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
