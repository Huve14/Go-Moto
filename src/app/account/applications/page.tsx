import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

async function getUserApplications(userId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('applications')
    .select(`
      *,
      listings:preferred_listing_id(id, title, slug, brand, model, price_weekly, listing_images(url)),
      application_events(id, from_status, to_status, note, created_at)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data || []) as any[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  submitted: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  in_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  docs_required: { label: 'Documents Required', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-800', icon: XCircle },
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle2 },
}

export default async function ApplicationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const applications = await getUserApplications(user.id)

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8">
          <Link
            href="/account"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Account
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold">My Applications</h1>
                <p className="text-muted-foreground">
                  {applications.length} {applications.length === 1 ? 'application' : 'applications'}
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/apply">New Application</Link>
            </Button>
          </div>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <FileText className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No applications yet</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Ready to get on the road? Start your application today.
              </p>
              <Button asChild>
                <Link href="/apply">Apply for a Bike</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => {
              const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending
              const StatusIcon = statusConfig.icon
              
              return (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {app.listings?.title || `${(app.plan || 'starter').charAt(0).toUpperCase() + (app.plan || 'starter').slice(1)} Application`}
                        </CardTitle>
                        <CardDescription>
                          Applied on {new Date(app.created_at).toLocaleDateString('en-ZA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </CardDescription>
                      </div>
                      <Badge className={statusConfig.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {/* Listing Info */}
                      {app.listings && (
                        <div className="flex gap-4">
                          <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden shrink-0">
                            {app.listings.listing_images?.[0]?.url ? (
                              <img
                                src={app.listings.listing_images[0].url}
                                alt={app.listings.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileText className="h-8 w-8 text-muted-foreground/30" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{app.listings.title}</p>
                            <p className="text-sm text-muted-foreground">{app.listings.brand}</p>
                            <p className="text-sm font-semibold text-primary mt-1">
                              {formatCurrency(app.listings.price_weekly)}/week
                            </p>
                            <Link
                              href={`/inventory/${app.listings.slug}`}
                              className="text-sm text-primary hover:underline mt-2 inline-block"
                            >
                              View Listing →
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Application Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Plan Type</span>
                          <span className="font-medium capitalize">{(app.plan || '').replace('-', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location</span>
                          <span className="font-medium capitalize">{app.location || ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reference</span>
                          <span className="font-mono text-xs">{app.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    {app.application_events && app.application_events.length > 0 && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-medium mb-4">Application Timeline</h4>
                        <div className="space-y-3">
                          {app.application_events
                            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .slice(0, 5)
                            .map((event: any) => (
                              <div key={event.id} className="flex gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium capitalize">
                                      {(event.to_status || '').replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(event.created_at).toLocaleDateString('en-ZA')}
                                    </p>
                                  </div>
                                  {event.note && (
                                    <p className="text-sm text-muted-foreground">{event.note}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Actions based on status */}
                    {app.status === 'approved' && (
                      <div className="mt-6 pt-6 border-t">
                        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                            🎉 Congratulations! Your application is approved.
                          </h4>
                          <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                            Please contact us to arrange bike collection or we'll be in touch shortly.
                          </p>
                          <Button size="sm" asChild>
                            <Link href="/contact">Contact Us</Link>
                          </Button>
                        </div>
                      </div>
                    )}

                    {app.status === 'declined' && (
                      <div className="mt-6 pt-6 border-t">
                        <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4">
                          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                            Application not approved
                          </h4>
                          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                            Unfortunately, we couldn't approve this application. 
                            Please contact us for more information or to discuss alternatives.
                          </p>
                          <Button size="sm" variant="outline" asChild>
                            <Link href="/contact">Contact Support</Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
