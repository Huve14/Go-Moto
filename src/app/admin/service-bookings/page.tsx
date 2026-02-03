import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search, MoreHorizontal, Eye, CheckCircle, XCircle, Phone, Mail, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

async function getServiceBookings(searchParams: { status?: string; search?: string }) {
  const supabase = createClient()
  
  let query = supabase
    .from('service_bookings')
    .select('*')
    .order('preferred_date', { ascending: true })

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  if (searchParams.search) {
    query = query.or(`full_name.ilike.%${searchParams.search}%,email.ilike.%${searchParams.search}%,phone.ilike.%${searchParams.search}%`)
  }

  const { data } = await query
  return (data || []) as any[]
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const SERVICE_TYPES: Record<string, string> = {
  'general-service': 'General Service',
  'oil-change': 'Oil Change',
  'brake-service': 'Brake Service',
  'tire-service': 'Tire Service',
  'electrical': 'Electrical',
  'engine-repair': 'Engine Repair',
  'diagnostics': 'Diagnostics',
  'other': 'Other',
}

export default async function AdminServiceBookingsPage({
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

  const bookings = await getServiceBookings(searchParams)

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <AdminSidebar active="/admin/service-bookings" />
        
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold">Service Bookings</h1>
            <p className="text-muted-foreground">
              Manage service appointments and repairs
            </p>
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
                      placeholder="Search bookings..."
                      defaultValue={searchParams.search}
                      className="pl-10"
                    />
                  </form>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map((status) => (
                    <Button
                      key={status}
                      variant={searchParams.status === status || (!searchParams.status && status === 'all') ? 'default' : 'outline'}
                      size="sm"
                      asChild
                    >
                      <Link href={`/admin/service-bookings?status=${status}${searchParams.search ? `&search=${searchParams.search}` : ''}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Table */}
          <Card>
            <CardContent className="pt-6">
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No service bookings found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-4 font-medium">Customer</th>
                        <th className="pb-4 font-medium">Service Type</th>
                        <th className="pb-4 font-medium">Bike Details</th>
                        <th className="pb-4 font-medium">Date</th>
                        <th className="pb-4 font-medium">Status</th>
                        <th className="pb-4 font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b last:border-0">
                          <td className="py-4">
                            <div>
                              <p className="font-medium">{booking.full_name}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {booking.phone}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            {SERVICE_TYPES[booking.service_type] || booking.service_type}
                          </td>
                          <td className="py-4 text-muted-foreground">
                            {booking.bike_make} {booking.bike_model}
                            <br />
                            <span className="text-sm">{booking.bike_year}</span>
                          </td>
                          <td className="py-4">
                            <div>
                              <p className="font-medium">
                                {new Date(booking.preferred_date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {booking.preferred_time}
                              </p>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge className={STATUS_COLORS[booking.status]}>
                              {booking.status.replace('-', ' ')}
                            </Badge>
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
                                  <Link href={`/admin/service-bookings/${booking.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                {booking.status === 'pending' && (
                                  <DropdownMenuItem className="text-green-600">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Confirm
                                  </DropdownMenuItem>
                                )}
                                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                  <DropdownMenuItem className="text-destructive">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                )}
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
