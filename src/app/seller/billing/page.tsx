'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Loader2,
  Zap,
  TrendingUp,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface Subscription {
  id: string
  status: string
  current_period_start: string
  current_period_end: string
  stripe_subscription_id: string | null
  listing_plans: {
    id: string
    name: string
    slug: string
    monthly_price: number
    max_active_listings: number
    features: string[]
  }
}

interface ListingPlan {
  id: string
  slug: string
  name: string
  monthly_price: number
  max_active_listings: number
  features: string[]
}

const PLAN_ICONS: Record<string, typeof Star> = {
  basic: Zap,
  pro: TrendingUp,
  featured: Star,
}

function formatPrice(cents: number): string {
  return `R${(cents / 100).toLocaleString('en-ZA')}`
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function SellerBillingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [allPlans, setAllPlans] = useState<ListingPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isManaging, setIsManaging] = useState(false)
  
  const supabase = createClient()
  
  useEffect(() => {
    async function loadBilling() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/seller/billing')
        return
      }
      
      setUser(user)
      
      // Fetch subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select(`
          id,
          status,
          current_period_start,
          current_period_end,
          stripe_subscription_id,
          listing_plans (
            id,
            name,
            slug,
            monthly_price,
            max_active_listings,
            features
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['active', 'past_due', 'canceled'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      setSubscription(sub as any)
      
      // Fetch all plans for upgrade options
      const { data: plans } = await supabase
        .from('listing_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      
      setAllPlans(plans || [])
      setIsLoading(false)
    }
    
    loadBilling()
  }, [])
  
  const handleManageSubscription = async () => {
    if (!subscription?.stripe_subscription_id) {
      // Demo mode - just show message
      alert('Stripe billing portal is not available in demo mode.')
      return
    }
    
    setIsManaging(true)
    
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      })
      
      const result = await response.json()
      
      if (result.url) {
        window.location.href = result.url
      } else {
        throw new Error(result.error || 'Failed to open billing portal')
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsManaging(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const currentPlan = subscription?.listing_plans
  const isActive = subscription?.status === 'active'
  const isPastDue = subscription?.status === 'past_due'
  const isCanceled = subscription?.status === 'canceled'

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/seller" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-display font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your seller subscription
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Current Subscription */}
          {subscription ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Current Plan
                      {isActive && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </Badge>
                      )}
                      {isPastDue && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Past Due
                        </Badge>
                      )}
                      {isCanceled && (
                        <Badge variant="secondary">Canceled</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Your subscription details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Info */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  {currentPlan && (
                    <>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {(() => {
                          const Icon = PLAN_ICONS[currentPlan.slug] || Zap
                          return <Icon className="h-6 w-6 text-primary" />
                        })()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{currentPlan.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Up to {currentPlan.max_active_listings} active listing{currentPlan.max_active_listings > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {formatPrice(currentPlan.monthly_price)}
                        </div>
                        <div className="text-sm text-muted-foreground">/month</div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Billing Dates */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      Current Period Started
                    </div>
                    <div className="font-medium">
                      {formatDate(subscription.current_period_start)}
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      {isActive ? 'Renews On' : 'Ends On'}
                    </div>
                    <div className="font-medium">
                      {formatDate(subscription.current_period_end)}
                    </div>
                  </div>
                </div>
                
                {/* Past Due Warning */}
                {isPastDue && (
                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-destructive">Payment Failed</h4>
                        <p className="text-sm text-destructive/80">
                          Your last payment failed. Please update your payment method to keep your listings active.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Button onClick={handleManageSubscription} disabled={isManaging}>
                    {isManaging ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    Manage Subscription
                  </Button>
                  
                  {subscription.stripe_subscription_id && (
                    <Button variant="outline" onClick={handleManageSubscription} disabled={isManaging}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Update Payment Method
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a plan to start listing your bikes.
                </p>
                <Link href="/list-your-bike">
                  <Button>View Plans</Button>
                </Link>
              </CardContent>
            </Card>
          )}
          
          {/* Upgrade Options */}
          {subscription && allPlans.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Upgrade Your Plan</CardTitle>
                <CardDescription>
                  Get more listings and premium features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {allPlans
                    .filter(p => p.slug !== currentPlan?.slug && p.monthly_price > (currentPlan?.monthly_price || 0))
                    .map((plan) => {
                      const Icon = PLAN_ICONS[plan.slug] || Zap
                      
                      return (
                        <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{plan.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {plan.max_active_listings} listings • {formatPrice(plan.monthly_price)}/mo
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={handleManageSubscription}>
                            Upgrade
                          </Button>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View your past invoices and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                View your complete payment history in the{' '}
                <button onClick={handleManageSubscription} className="text-primary hover:underline">
                  billing portal
                </button>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
