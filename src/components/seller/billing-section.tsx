'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  RefreshCw,
  Receipt,
  ArrowRight
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface Plan {
  id: string
  name: string
  monthly_price: number
  max_active_listings: number
}

interface Subscription {
  id: string
  status: 'pending' | 'active' | 'past_due' | 'paused' | 'canceled'
  next_payment_due: string | null
  grace_until: string | null
  current_period_end: string | null
  plan: Plan
}

interface PaymentTransaction {
  id: string
  reference: string
  amount: number
  status: 'pending' | 'paid' | 'failed'
  created_at: string
  paid_at: string | null
}

interface BillingData {
  subscription: Subscription | null
  transactions: PaymentTransaction[]
}

const statusConfig = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  past_due: {
    label: 'Payment Due',
    color: 'bg-red-100 text-red-800',
    icon: AlertTriangle,
  },
  paused: {
    label: 'Paused',
    color: 'bg-gray-100 text-gray-800',
    icon: XCircle,
  },
  canceled: {
    label: 'Canceled',
    color: 'bg-gray-100 text-gray-800',
    icon: XCircle,
  },
}

const paymentStatusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
  },
  paid: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800',
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800',
  },
}

export function BillingSection() {
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBillingData()
  }, [])

  async function fetchBillingData() {
    try {
      setLoading(true)
      const response = await fetch('/api/seller/billing')
      if (!response.ok) throw new Error('Failed to fetch billing data')
      const data = await response.json()
      setBillingData(data)
    } catch (err) {
      setError('Failed to load billing information')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handlePayNow() {
    if (!billingData?.subscription) return

    try {
      setPaymentLoading(true)
      const response = await fetch('/api/payments/ikhokha/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: billingData.subscription.plan.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create payment')
      }

      const { paymentUrl } = await response.json()
      
      // Redirect to iKhokha payment page
      window.location.href = paymentUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setPaymentLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchBillingData} 
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const { subscription, transactions } = billingData || { subscription: null, transactions: [] }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing & Subscription
          </CardTitle>
          <CardDescription>
            You don't have an active subscription yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Subscribe to a plan to start listing your motorcycles and reach thousands of buyers.
          </p>
          <Button asChild>
            <a href="/pricing">
              View Plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const StatusIcon = statusConfig[subscription.status].icon
  const showPayButton = ['past_due', 'paused'].includes(subscription.status)
  const isInGracePeriod = subscription.status === 'past_due' && subscription.grace_until
  const graceEndsIn = isInGracePeriod 
    ? formatDistanceToNow(new Date(subscription.grace_until!), { addSuffix: true })
    : null

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Banner for Past Due */}
          {subscription.status === 'past_due' && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Payment Overdue</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Your payment is overdue. Your listings will be paused {graceEndsIn}.
                    Pay now to keep your listings visible.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status Banner for Paused */}
          {subscription.status === 'paused' && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Subscription Paused</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Your subscription is paused and your listings are hidden.
                    Pay now to reactivate your listings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Plan Details */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold">{subscription.plan.name}</h3>
                <Badge className={statusConfig[subscription.status].color}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {statusConfig[subscription.status].label}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Up to {subscription.plan.max_active_listings} active listings
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">R{subscription.plan.monthly_price}</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
          </div>

          {/* Billing Cycle */}
          <div className="border-t pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {subscription.next_payment_due ? (
                    <>
                      Next payment: {format(new Date(subscription.next_payment_due), 'dd MMM yyyy')}
                    </>
                  ) : (
                    'No upcoming payment'
                  )}
                </span>
              </div>
              {subscription.current_period_end && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Period ends: {format(new Date(subscription.current_period_end), 'dd MMM yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {showPayButton && (
              <Button 
                onClick={handlePayNow}
                disabled={paymentLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {paymentLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now
                  </>
                )}
              </Button>
            )}
            {subscription.status === 'active' && (
              <Button variant="outline" asChild>
                <a href="/pricing">
                  Upgrade Plan
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            Your recent payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No payment history yet
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">R{transaction.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.created_at), 'dd MMM yyyy, HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={paymentStatusConfig[transaction.status].color}>
                      {paymentStatusConfig[transaction.status].label}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ref: {transaction.reference}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
