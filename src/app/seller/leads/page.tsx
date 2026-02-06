'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageSquare,
  ExternalLink,
  Check,
  Loader2,
  Inbox,
  Clock,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'

interface Lead {
  id: string
  created_at: string
  name: string
  email: string
  phone: string | null
  message: string
  is_read: boolean
  is_responded: boolean
  listings: {
    id: string
    title: string
    slug: string
    price: number
    images: { url: string }[]
  }
}

function formatDate(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return d.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

function formatPrice(amount: number): string {
  return `R${amount.toLocaleString('en-ZA')}`
}

export default function SellerLeadsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'responded'>('all')
  
  const supabase = createClient()
  
  useEffect(() => {
    async function loadLeads() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/seller/leads')
        return
      }
      
      setUser(user)
      
      const { data: leadsData } = await supabase
        .from('listing_inquiries')
        .select(`
          id,
          created_at,
          name,
          email,
          phone,
          message,
          is_read,
          is_responded,
          listings (
            id,
            title,
            slug,
            price,
            images
          )
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
      
      setLeads((leadsData as Lead[]) || [])
      setIsLoading(false)
    }
    
    loadLeads()
  }, [])
  
  const markAsRead = async (lead: Lead) => {
    if (lead.is_read) return
    
    await (supabase as any)
      .from('listing_inquiries')
      .update({ is_read: true })
      .eq('id', lead.id)
    
    setLeads(prev => prev.map(l => 
      l.id === lead.id ? { ...l, is_read: true } : l
    ))
  }
  
  const markAsResponded = async (lead: Lead) => {
    await (supabase as any)
      .from('listing_inquiries')
      .update({ is_responded: true })
      .eq('id', lead.id)
    
    setLeads(prev => prev.map(l => 
      l.id === lead.id ? { ...l, is_responded: true } : l
    ))
    
    if (selectedLead?.id === lead.id) {
      setSelectedLead({ ...selectedLead, is_responded: true })
    }
  }
  
  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead)
    markAsRead(lead)
  }
  
  const filteredLeads = leads.filter(lead => {
    if (filter === 'unread') return !lead.is_read
    if (filter === 'responded') return lead.is_responded
    return true
  })
  
  const unreadCount = leads.filter(l => !l.is_read).length
  
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
          <Link href="/seller" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Inquiries</h1>
              <p className="text-muted-foreground">
                Messages from potential buyers
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge variant="default">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {leads.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No inquiries yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                When buyers send inquiries about your listings, they'll appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Leads List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as any)}
                      className="text-sm bg-transparent border-none focus:outline-none cursor-pointer"
                    >
                      <option value="all">All ({leads.length})</option>
                      <option value="unread">Unread ({leads.filter(l => !l.is_read).length})</option>
                      <option value="responded">Responded ({leads.filter(l => l.is_responded).length})</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y max-h-[600px] overflow-auto">
                    {filteredLeads.map((lead) => (
                      <button
                        key={lead.id}
                        onClick={() => handleSelectLead(lead)}
                        className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                          selectedLead?.id === lead.id ? 'bg-muted' : ''
                        } ${!lead.is_read ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className={`font-medium ${!lead.is_read ? 'text-primary' : ''}`}>
                            {lead.name}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatDate(lead.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {lead.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground truncate">
                            Re: {lead.listings?.title}
                          </span>
                          {!lead.is_read && (
                            <Badge variant="default" className="text-xs h-5">New</Badge>
                          )}
                          {lead.is_responded && (
                            <Badge variant="outline" className="text-xs h-5 gap-1">
                              <Check className="h-3 w-3" />
                              Replied
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Lead Detail */}
            <div className="lg:col-span-2">
              {selectedLead ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{selectedLead.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(selectedLead.created_at).toLocaleString('en-ZA')}
                        </CardDescription>
                      </div>
                      {!selectedLead.is_responded && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsResponded(selectedLead)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Mark as Replied
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Contact Actions */}
                    <div className="flex flex-wrap gap-3">
                      <a href={`mailto:${selectedLead.email}`}>
                        <Button variant="default">
                          <Mail className="h-4 w-4 mr-2" />
                          Reply by Email
                        </Button>
                      </a>
                      {selectedLead.phone && (
                        <a href={`tel:${selectedLead.phone}`}>
                          <Button variant="outline">
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                        </a>
                      )}
                    </div>
                    
                    {/* Contact Info */}
                    <div className="grid sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Email</div>
                        <a href={`mailto:${selectedLead.email}`} className="text-sm text-primary hover:underline">
                          {selectedLead.email}
                        </a>
                      </div>
                      {selectedLead.phone && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Phone</div>
                          <a href={`tel:${selectedLead.phone}`} className="text-sm text-primary hover:underline">
                            {selectedLead.phone}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {/* Message */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Message
                      </h4>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{selectedLead.message}</p>
                      </div>
                    </div>
                    
                    {/* Related Listing */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Regarding Listing</h4>
                      <Link 
                        href={`/inventory/${selectedLead.listings?.slug}`}
                        target="_blank"
                        className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-16 h-16 rounded overflow-hidden bg-muted shrink-0">
                          {selectedLead.listings?.images?.[0] && (
                            <img 
                              src={selectedLead.listings.images[0].url} 
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {selectedLead.listings?.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatPrice(selectedLead.listings?.price || 0)}
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select an inquiry</h3>
                    <p className="text-muted-foreground">
                      Click on an inquiry to view details and respond.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
