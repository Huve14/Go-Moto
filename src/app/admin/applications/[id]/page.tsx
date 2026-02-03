'use client'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Briefcase, FileText, Phone, Mail, MapPin, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'

interface Application {
  id: string
  full_name: string
  email: string
  phone: string
  id_number: string
  date_of_birth: string
  address: string
  city: string
  province: string
  postal_code: string
  employment_status: string
  employer_name?: string
  employer_phone?: string
  monthly_income?: number
  plan: string
  has_license: boolean
  license_code?: string
  id_document_url?: string
  proof_of_income_url?: string
  proof_of_address_url?: string
  selfie_url?: string
  status: string
  notes?: string
  created_at: string
  updated_at: string
  preferred_listing_id?: string
  listings?: {
    id: string
    title: string
    slug: string
  }
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

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function loadApplication() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Check admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const profileData = profile as any
      if (profileData?.role !== 'admin') {
        router.push('/account')
        return
      }

      // Get application
      const { data } = await supabase
        .from('applications')
        .select('*, listings:preferred_listing_id(id, title, slug)')
        .eq('id', params.id)
        .single()

      if (data) {
        const appData = data as any
        setApplication(appData)
        setNotes(appData.notes || '')
      }
      setLoading(false)
    }

    loadApplication()
  }, [params.id, router])

  async function updateStatus(newStatus: string) {
    if (!application) return
    setUpdating(true)

    const supabase = createClient()
    const { error } = await (supabase
      .from('applications') as any)
      .update({ 
        status: newStatus, 
        notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', application.id)

    if (!error) {
      setApplication({ ...application, status: newStatus, notes: notes })
    }
    setUpdating(false)
  }

  async function saveNotes() {
    if (!application) return
    setUpdating(true)

    const supabase = createClient()
    await (supabase
      .from('applications') as any)
      .update({ notes: notes })
      .eq('id', application.id)

    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Application not found</p>
          <Button asChild>
            <Link href="/admin/applications">Back to Applications</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/applications">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-display font-bold">
                {application.full_name}
              </h1>
              <p className="text-muted-foreground">
                Application #{application.id.slice(0, 8)} • Submitted {new Date(application.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge className={`${STATUS_COLORS[application.status]} text-sm px-3 py-1`}>
            {application.status.toUpperCase()}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="personal">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="employment">Employment</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Full Name</Label>
                        <p className="font-medium">{application.full_name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">ID Number</Label>
                        <p className="font-medium">{application.id_number}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Date of Birth</Label>
                        <p className="font-medium">{new Date(application.date_of_birth).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Phone</Label>
                        <p className="font-medium">{application.phone}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium">{application.email}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-muted-foreground">Address</Label>
                        <p className="font-medium">{application.address}</p>
                        <p className="text-muted-foreground">{application.city}, {application.postal_code}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Has License</Label>
                        <p className="font-medium">{application.has_license ? 'Yes' : 'No'}</p>
                      </div>
                      {application.license_code && (
                        <div>
                          <Label className="text-muted-foreground">License Code</Label>
                          <p className="font-medium">{application.license_code}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="employment" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Employment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Employment Status</Label>
                        <p className="font-medium capitalize">{application.employment_status.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Monthly Income</Label>
                        <p className="font-medium">
                          {application.monthly_income ? formatCurrency(application.monthly_income) : '—'}
                        </p>
                      </div>
                      {application.employer_name && (
                        <div>
                          <Label className="text-muted-foreground">Employer</Label>
                          <p className="font-medium">{application.employer_name}</p>
                        </div>
                      )}
                      {application.employer_phone && (
                        <div>
                          <Label className="text-muted-foreground">Employer Phone</Label>
                          <p className="font-medium">{application.employer_phone}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Uploaded Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <DocumentLink 
                        label="ID Document" 
                        url={application.id_document_url} 
                      />
                      <DocumentLink 
                        label="Proof of Income" 
                        url={application.proof_of_income_url} 
                      />
                      <DocumentLink 
                        label="Proof of Address" 
                        url={application.proof_of_address_url} 
                      />
                      <DocumentLink 
                        label="Selfie with ID" 
                        url={application.selfie_url} 
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Application Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Plan Type</Label>
                  <p className="font-medium capitalize">{application.plan?.replace('-', ' ') || ''}</p>
                </div>
                {application.listings && (
                  <div>
                    <Label className="text-muted-foreground">Selected Bike</Label>
                    <Link 
                      href={`/inventory/${application.listings.slug}`}
                      className="text-primary hover:underline font-medium block"
                    >
                      {application.listings.title}
                    </Link>
                  </div>
                )}
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="text-sm">{new Date(application.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <p className="text-sm">{new Date(application.updated_at).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Admin Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
                <CardDescription>Internal notes about this application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  rows={4}
                />
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={saveNotes}
                  disabled={updating}
                >
                  Save Notes
                </Button>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {application.status === 'submitted' && (
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => updateStatus('in_review')}
                    disabled={updating}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Mark as Reviewing
                  </Button>
                )}
                {(application.status === 'submitted' || application.status === 'in_review') && (
                  <>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => updateStatus('approved')}
                      disabled={updating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Application
                    </Button>
                    <Button 
                      className="w-full"
                      variant="destructive"
                      onClick={() => updateStatus('declined')}
                      disabled={updating}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Application
                    </Button>
                  </>
                )}
                {application.status === 'approved' && (
                  <Button 
                    className="w-full"
                    onClick={() => updateStatus('active')}
                    disabled={updating}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Active
                  </Button>
                )}
                {application.status === 'active' && (
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => updateStatus('completed')}
                    disabled={updating}
                  >
                    Complete Contract
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentLink({ label, url }: { label: string; url?: string }) {
  return (
    <div className="p-4 border rounded-lg">
      <Label className="text-muted-foreground text-sm">{label}</Label>
      {url ? (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium block mt-1"
        >
          View Document
        </a>
      ) : (
        <p className="text-muted-foreground mt-1">Not uploaded</p>
      )}
    </div>
  )
}
