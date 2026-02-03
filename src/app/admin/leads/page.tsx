import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search, MoreHorizontal, Eye, Phone, Mail, Users, Building2 } from 'lucide-react'
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

async function getLeads(searchParams: { type?: string; search?: string }) {
  const supabase = createClient()
  
  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (searchParams.type && searchParams.type !== 'all') {
    query = query.eq('type', searchParams.type)
  }

  if (searchParams.search) {
    query = query.or(`full_name.ilike.%${searchParams.search}%,email.ilike.%${searchParams.search}%`)
  }

  const { data } = await query
  return (data || []) as any[]
}

const TYPE_COLORS: Record<string, string> = {
  contact: 'bg-blue-100 text-blue-800',
  fleet: 'bg-purple-100 text-purple-800',
  newsletter: 'bg-green-100 text-green-800',
  other: 'bg-gray-100 text-gray-800',
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: { type?: string; search?: string }
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

  const leads = await getLeads(searchParams)

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <AdminSidebar active="/admin/leads" />
        
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold">Leads</h1>
            <p className="text-muted-foreground">
              Contact form submissions and inquiries
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
                      placeholder="Search leads..."
                      defaultValue={searchParams.search}
                      className="pl-10"
                    />
                  </form>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'contact', 'fleet', 'newsletter'].map((type) => (
                    <Button
                      key={type}
                      variant={searchParams.type === type || (!searchParams.type && type === 'all') ? 'default' : 'outline'}
                      size="sm"
                      asChild
                    >
                      <Link href={`/admin/leads?type=${type}${searchParams.search ? `&search=${searchParams.search}` : ''}`}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          <Card>
            <CardContent className="pt-6">
              {leads.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No leads found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-4 font-medium">Contact</th>
                        <th className="pb-4 font-medium">Source</th>
                        <th className="pb-4 font-medium">Company</th>
                        <th className="pb-4 font-medium">Message</th>
                        <th className="pb-4 font-medium">Date</th>
                        <th className="pb-4 font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr key={lead.id} className="border-b last:border-0">
                          <td className="py-4">
                            <div>
                              <p className="font-medium">{lead.full_name}</p>
                              <div className="flex flex-col text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {lead.email}
                                </span>
                                {lead.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {lead.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge className={TYPE_COLORS[lead.type] || 'bg-gray-100 text-gray-800'}>
                              {lead.type}
                            </Badge>
                          </td>
                          <td className="py-4 text-muted-foreground">
                            {'—'}
                          </td>
                          <td className="py-4 max-w-xs">
                            <p className="text-sm text-muted-foreground truncate">
                              {lead.message || '—'}
                            </p>
                          </td>
                          <td className="py-4 text-muted-foreground">
                            {new Date(lead.created_at).toLocaleDateString()}
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
                                  <Link href={`/admin/leads/${lead.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Phone className="h-4 w-4 mr-2" />
                                  Call
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
