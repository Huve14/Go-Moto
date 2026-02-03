import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Bike, FileText, Users, Calendar, DollarSign, Settings, ChevronRight, TrendingUp, Clock, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

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

async function getStats() {
  const supabase = createClient()
  
  const [
    { count: listingsCount },
    { count: applicationsCount },
    { count: pendingApplicationsCount },
    { count: serviceBookingsCount },
    { count: sellRequestsCount },
    { count: leadsCount },
  ] = await Promise.all([
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
    supabase.from('service_bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('sell_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
  ])

  return {
    listings: listingsCount || 0,
    applications: applicationsCount || 0,
    pendingApplications: pendingApplicationsCount || 0,
    serviceBookings: serviceBookingsCount || 0,
    sellRequests: sellRequestsCount || 0,
    leads: leadsCount || 0,
  }
}

async function getRecentApplications() {
  const supabase = createClient()
  const { data } = await supabase
    .from('applications')
    .select('id, full_name, email, plan, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  return data as { id: string; full_name: string; email: string; plan: string; status: string; created_at: string }[] || []
}

async function getRecentBookings() {
  const supabase = createClient()
  const { data } = await supabase
    .from('service_bookings')
    .select('id, full_name, service_type, status, preferred_date, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  return data as { id: string; full_name: string; service_type: string; status: string; preferred_date: string; created_at: string }[] || []
}

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/listings', icon: Bike, label: 'Listings' },
  { href: '/admin/applications', icon: FileText, label: 'Applications' },
  { href: '/admin/service-bookings', icon: Calendar, label: 'Service Bookings' },
  { href: '/admin/sell-requests', icon: DollarSign, label: 'Sell/Trade Requests' },
  { href: '/admin/leads', icon: Users, label: 'Leads' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
}

export default async function AdminDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const isAdmin = await checkIsAdmin(user.id)
  if (!isAdmin) {
    redirect('/account')
  }

  const [stats, recentApplications, recentBookings] = await Promise.all([
    getStats(),
    getRecentApplications(),
    getRecentBookings(),
  ])

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-background border-r min-h-screen p-4 hidden lg:block">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gomoto-500 to-gomoto-600 flex items-center justify-center">
              <Bike className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-display font-bold">Go-Moto</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${
                  item.href === '/admin' ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your business.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Listings</p>
                    <p className="text-3xl font-bold">{stats.listings}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bike className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Applications</p>
                    <p className="text-3xl font-bold">{stats.pendingApplications}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Service Bookings</p>
                    <p className="text-3xl font-bold">{stats.serviceBookings}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sell/Trade Requests</p>
                    <p className="text-3xl font-bold">{stats.sellRequests}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Applications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>{stats.applications} total applications</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/applications">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentApplications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No applications yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentApplications.map((app) => (
                      <div key={app.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{app.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {app.plan} • {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={STATUS_COLORS[app.status]}>
                          {app.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Service Bookings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Service Bookings</CardTitle>
                  <CardDescription>Upcoming and recent bookings</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/service-bookings">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No service bookings yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{booking.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.service_type} • {new Date(booking.preferred_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={STATUS_COLORS[booking.status]}>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                <Link href="/admin/listings/new">
                  <Package className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Add Listing</p>
                    <p className="text-xs text-muted-foreground">Create new bike listing</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                <Link href="/admin/applications?status=pending">
                  <FileText className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Review Applications</p>
                    <p className="text-xs text-muted-foreground">{stats.pendingApplications} pending</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                <Link href="/admin/service-bookings">
                  <Calendar className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Manage Bookings</p>
                    <p className="text-xs text-muted-foreground">View service schedule</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                <Link href="/admin/leads">
                  <Users className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">View Leads</p>
                    <p className="text-xs text-muted-foreground">{stats.leads} total leads</p>
                  </div>
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
