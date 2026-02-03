import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, FileText, Heart, Settings, LogOut, ChevronRight, Calendar, Bike } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

async function getProfile(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data as any
}

async function getUserApplications(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('applications')
    .select('*, listings:preferred_listing_id(title, brand, model)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)
  return (data || []) as any[]
}

async function getUserFavorites(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('favorites')
    .select('*, listings(id, title, slug, brand, price_weekly, listing_images(url))')
    .eq('user_id', userId)
    .limit(4)
  return (data || []) as any[]
}

async function getServiceBookings(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('service_bookings')
    .select('*')
    .eq('email', userId) // Using email as reference since service_bookings might not have user_id
    .order('created_at', { ascending: false })
    .limit(3)
  return (data || []) as any[]
}

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  docs_required: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
}

export default async function AccountPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [profile, applications, favorites] = await Promise.all([
    getProfile(user.id),
    getUserApplications(user.id),
    getUserFavorites(user.id),
  ])

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">My Account</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name || user.email}
            </p>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="outline" type="submit">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </form>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Stats & Navigation */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{profile?.full_name || 'User'}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {profile?.phone && (
                      <p className="text-sm text-muted-foreground">{profile.phone}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link
                    href="/account/settings"
                    className="flex items-center justify-between py-2 text-sm hover:text-primary"
                  >
                    <span className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <Link
                  href="/account/applications"
                  className="flex items-center justify-between py-2 text-sm hover:text-primary"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    My Applications
                  </span>
                  <div className="flex items-center gap-2">
                    {applications.length > 0 && (
                      <Badge variant="secondary">{applications.length}</Badge>
                    )}
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </Link>
                <Link
                  href="/account/favorites"
                  className="flex items-center justify-between py-2 text-sm hover:text-primary"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Saved Bikes
                  </span>
                  <div className="flex items-center gap-2">
                    {favorites.length > 0 && (
                      <Badge variant="secondary">{favorites.length}</Badge>
                    )}
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </Link>
                <Link
                  href="/service"
                  className="flex items-center justify-between py-2 text-sm hover:text-primary"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Book Service
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/inventory"
                  className="flex items-center justify-between py-2 text-sm hover:text-primary"
                >
                  <span className="flex items-center gap-2">
                    <Bike className="h-4 w-4" />
                    Browse Bikes
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Applications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Track your application status</CardDescription>
                </div>
                {applications.length > 0 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/account/applications">View All</Link>
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No applications yet</p>
                    <Button asChild>
                      <Link href="/apply">Apply for a Bike</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">
                            {app.listings?.title || `${app.plan || 'starter'} Application`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={STATUS_COLORS[app.status] || 'bg-gray-100'}>
                          {app.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved Bikes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Saved Bikes</CardTitle>
                  <CardDescription>Bikes you've saved for later</CardDescription>
                </div>
                {favorites.length > 0 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/account/favorites">View All</Link>
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No saved bikes</p>
                    <Button variant="outline" asChild>
                      <Link href="/inventory">Browse Inventory</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {favorites.map((fav) => (
                      <Link
                        key={fav.id}
                        href={`/inventory/${fav.listings?.slug}`}
                        className="flex gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                          {fav.listings?.listing_images?.[0]?.url ? (
                            <img
                              src={fav.listings.listing_images[0].url}
                              alt={fav.listings.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Bike className="h-6 w-6 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{fav.listings?.title}</p>
                          <p className="text-sm text-muted-foreground">{fav.listings?.brand}</p>
                          <p className="text-sm font-semibold text-primary">
                            {formatCurrency(fav.listings?.price_weekly || 0)}/week
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Need Help?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our team is here to assist you with any questions about your application, 
                      bike servicing, or account.
                    </p>
                    <div className="flex gap-3">
                      <Button size="sm" asChild>
                        <Link href="/contact">Contact Support</Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27123456789'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
