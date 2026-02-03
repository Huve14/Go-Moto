import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search, MoreHorizontal, Eye, CheckCircle, XCircle, FileText } from 'lucide-react'
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

async function getApplications(searchParams: { status?: string; search?: string }) {
  const supabase = createClient()
  
  let query = supabase
    .from('applications')
    .select('*, listings:preferred_listing_id(title)')
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
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
}

export default async function AdminApplicationsPage({
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

  const applications = await getApplications(searchParams)

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <AdminSidebar active="/admin/applications" />
        
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold">Applications</h1>
            <p className="text-muted-foreground">
              Review and manage rental applications
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
                      placeholder="Search applications..."
                      defaultValue={searchParams.search}
                      className="pl-10"
                    />
                  </form>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'submitted', 'in_review', 'approved', 'declined', 'active'].map((status) => (
                    <Button
                      key={status}
                      variant={searchParams.status === status || (!searchParams.status && status === 'all') ? 'default' : 'outline'}
                      size="sm"
                      asChild
                    >
                      <Link href={`/admin/applications?status=${status}${searchParams.search ? `&search=${searchParams.search}` : ''}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card>
            <CardContent className="pt-6">
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No applications found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-4 font-medium">Applicant</th>
                        <th className="pb-4 font-medium">Plan</th>
                        <th className="pb-4 font-medium">Listing</th>
                        <th className="pb-4 font-medium">Status</th>
                        <th className="pb-4 font-medium">Date</th>
                        <th className="pb-4 font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id} className="border-b last:border-0">
                          <td className="py-4">
                            <div>
                              <p className="font-medium">{app.full_name}</p>
                              <p className="text-sm text-muted-foreground">{app.email}</p>
                              <p className="text-sm text-muted-foreground">{app.phone}</p>
                            </div>
                          </td>
                          <td className="py-4 capitalize">{app.plan?.replace('-', ' ') || ''}</td>
                          <td className="py-4 text-muted-foreground">
                            {app.listings?.title || '—'}
                          </td>
                          <td className="py-4">
                            <Badge className={STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-800'}>
                              {app.status}
                            </Badge>
                          </td>
                          <td className="py-4 text-muted-foreground">
                            {new Date(app.created_at).toLocaleDateString()}
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
                                  <Link href={`/admin/applications/${app.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                {app.status === 'submitted' && (
                                  <>
                                    <DropdownMenuItem className="text-green-600">
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
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
