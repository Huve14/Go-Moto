import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search, MoreHorizontal, Eye, CheckCircle, XCircle, Phone, DollarSign } from 'lucide-react'
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

async function getSellRequests(searchParams: { status?: string; search?: string }) {
  const supabase = createClient()
  
  let query = supabase
    .from('sell_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('status', searchParams.status)
  }

  if (searchParams.search) {
    query = query.or(`full_name.ilike.%${searchParams.search}%,email.ilike.%${searchParams.search}%`)
  }

  const { data } = await query
  return (data || []) as any[]
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  quoted: 'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800',
}

export default async function AdminSellRequestsPage({
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

  const requests = await getSellRequests(searchParams)

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <AdminSidebar active="/admin/sell-requests" />
        
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold">Sell/Trade Requests</h1>
            <p className="text-muted-foreground">
              Review bikes submitted for sale or trade
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <form>
                      <Input
                        name="search"
                        placeholder="Search requests..."
                        defaultValue={searchParams.search}
                        className="pl-10"
                      />
                    </form>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    {['all', 'pending', 'reviewing', 'quoted', 'accepted', 'completed'].map((status) => (
                      <Button
                        key={status}
                        variant={searchParams.status === status || (!searchParams.status && status === 'all') ? 'default' : 'outline'}
                        size="sm"
                        asChild
                      >
                        <Link href={`/admin/sell-requests?status=${status}${searchParams.search ? `&search=${searchParams.search}` : ''}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests Table */}
          <Card>
            <CardContent className="pt-6">
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No sell/trade requests found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-4 font-medium">Customer</th>
                        <th className="pb-4 font-medium">Bike Details</th>
                        <th className="pb-4 font-medium">Expected Price</th>
                        <th className="pb-4 font-medium">Status</th>
                        <th className="pb-4 font-medium">Date</th>
                        <th className="pb-4 font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request) => {
                        const details = request.details as Record<string, any> || {}
                        return (
                        <tr key={request.id} className="border-b last:border-0">
                          <td className="py-4">
                            <div>
                              <p className="font-medium">{request.full_name}</p>
                              <p className="text-sm text-muted-foreground">{request.email}</p>
                              <p className="text-sm text-muted-foreground">{request.phone}</p>
                            </div>
                          </td>
                          <td className="py-4">
                            <div>
                              <p className="font-medium">{details.brand || ''} {details.model || ''}</p>
                              <p className="text-sm text-muted-foreground">
                                {details.year || ''} {details.mileage ? `• ${Number(details.mileage).toLocaleString()} km` : ''}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 font-medium">
                            {request.expected_price ? formatCurrency(request.expected_price) : '—'}
                          </td>
                          <td className="py-4">
                            <Badge className={STATUS_COLORS[request.status] || 'bg-gray-100 text-gray-800'}>
                              {(request.status || '').replace('-', ' ')}
                            </Badge>
                          </td>
                          <td className="py-4 text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
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
                                  <Link href={`/admin/sell-requests/${request.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                {request.status === 'pending' && (
                                  <DropdownMenuItem className="text-blue-600">
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Make Quote
                                  </DropdownMenuItem>
                                )}
                                {request.status !== 'completed' && request.status !== 'declined' && (
                                  <DropdownMenuItem className="text-destructive">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Decline
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )})}
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
