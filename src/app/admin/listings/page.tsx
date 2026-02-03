import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Bike } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/utils'
import AdminSidebar from '../components/sidebar'

async function checkIsAdmin(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  const profile = data as any
  return profile?.role === 'admin'
}

async function getListings(searchParams: { status?: string; search?: string }) {
  const supabase = createClient()
  
  let query = supabase
    .from('listings')
    .select('*, listing_images(url)')
    .order('created_at', { ascending: false })

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  if (searchParams.search) {
    query = query.or(`title.ilike.%${searchParams.search}%,brand.ilike.%${searchParams.search}%,model.ilike.%${searchParams.search}%`)
  }

  const { data } = await query
  return (data || []) as any[]
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  rented: 'bg-blue-100 text-blue-800',
  sold: 'bg-purple-100 text-purple-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
}

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = await checkIsAdmin(user.id)
  if (!isAdmin) {
    redirect('/account')
  }

  const listings = await getListings(searchParams)

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <AdminSidebar active="/admin/listings" />
        
        <main className="flex-1 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold">Listings</h1>
              <p className="text-muted-foreground">
                Manage your bike inventory
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/listings/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Listing
              </Link>
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <form>
                    <Input
                      name="search"
                      placeholder="Search listings..."
                      defaultValue={searchParams.search}
                      className="pl-10"
                    />
                  </form>
                </div>
                <div className="flex gap-2">
                  {['all', 'published', 'draft', 'rented', 'sold', 'maintenance'].map((status) => (
                    <Button
                      key={status}
                      variant={searchParams.status === status || (!searchParams.status && status === 'all') ? 'default' : 'outline'}
                      size="sm"
                      asChild
                    >
                      <Link href={`/admin/listings?status=${status}${searchParams.search ? `&search=${searchParams.search}` : ''}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listings Table */}
          <Card>
            <CardContent className="pt-6">
              {listings.length === 0 ? (
                <div className="text-center py-12">
                  <Bike className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No listings found</p>
                  <Button asChild>
                    <Link href="/admin/listings/new">Add Your First Listing</Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-4 font-medium">Listing</th>
                        <th className="pb-4 font-medium">Status</th>
                        <th className="pb-4 font-medium">Weekly Price</th>
                        <th className="pb-4 font-medium">Location</th>
                        <th className="pb-4 font-medium">Created</th>
                        <th className="pb-4 font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map((listing) => (
                        <tr key={listing.id} className="border-b last:border-0">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                                {listing.listing_images?.[0]?.url ? (
                                  <img
                                    src={listing.listing_images[0].url}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Bike className="h-5 w-5 text-muted-foreground/30" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{listing.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {listing.year} • {listing.brand}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge className={STATUS_COLORS[listing.status]}>
                              {listing.status}
                            </Badge>
                          </td>
                          <td className="py-4 font-medium">
                            {formatCurrency(listing.price_weekly)}
                          </td>
                          <td className="py-4 text-muted-foreground capitalize">
                            {listing.location}
                          </td>
                          <td className="py-4 text-muted-foreground">
                            {new Date(listing.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/inventory/${listing.slug}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/listings/${listing.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
