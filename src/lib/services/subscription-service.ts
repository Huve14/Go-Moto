/**
 * Subscription Service
 * Handles subscription logic for the marketplace with iKhokha payments
 */

import { createClient } from '@/lib/supabase/server'

export type SubscriptionStatus = 'pending' | 'active' | 'past_due' | 'paused' | 'canceled'

export interface ListingPlan {
  id: string
  slug: string
  name: string
  description: string | null
  monthly_price: number
  max_active_listings: number
  features: string[]
  is_active: boolean
  display_order: number
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  next_payment_due: string | null
  grace_until: string | null
  cancel_at_period_end: boolean
  plan?: ListingPlan
}

export interface PaymentTransaction {
  id: string
  user_id: string
  subscription_id: string | null
  plan_id: string
  reference: string
  amount: number
  status: 'pending' | 'paid' | 'failed'
  provider: string
  provider_transaction_id: string | null
  created_at: string
  paid_at: string | null
}

export interface PublishStatus {
  can_publish: boolean
  reason?: string
  current_count: number
  max_count: number
  remaining: number
}

/**
 * Get all active listing plans
 */
export async function getListingPlans(): Promise<ListingPlan[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('listing_plans')
    .select('id, slug, name, description, monthly_price, max_active_listings, features, is_active, display_order')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching listing plans:', error)
    return []
  }

  return data as ListingPlan[]
}

/**
 * Get a specific listing plan by slug
 */
export async function getListingPlanBySlug(slug: string): Promise<ListingPlan | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('listing_plans')
    .select('id, slug, name, description, monthly_price, max_active_listings, features, is_active, display_order')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching plan:', error)
    return null
  }

  return data as ListingPlan
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      id,
      user_id,
      plan_id,
      status,
      current_period_start,
      current_period_end,
      next_payment_due,
      grace_until,
      cancel_at_period_end,
      plan:listing_plans(id, slug, name, description, monthly_price, max_active_listings, features, is_active, display_order)
    `)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No rows found
    console.error('Error fetching subscription:', error)
    return null
  }

  return data as unknown as UserSubscription
}

/**
 * Check if user can publish a new listing
 */
export async function checkPublishStatus(userId: string): Promise<PublishStatus> {
  const supabase = await createClient()
  
  // Get subscription with plan details
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) {
    return {
      can_publish: false,
      reason: 'No active subscription. Please subscribe to a plan first.',
      current_count: 0,
      max_count: 0,
      remaining: 0,
    }
  }

  // Check subscription status
  if (subscription.status === 'canceled' || subscription.status === 'paused') {
    return {
      can_publish: false,
      reason: 'Your subscription is not active. Please reactivate to publish listings.',
      current_count: 0,
      max_count: 0,
      remaining: 0,
    }
  }

  // Check if subscription is within grace period for past_due
  if (subscription.status === 'past_due') {
    const graceDate = subscription.grace_until ? new Date(subscription.grace_until) : null
    if (!graceDate || graceDate < new Date()) {
      return {
        can_publish: false,
        reason: 'Your subscription payment is overdue. Please pay to continue.',
        current_count: 0,
        max_count: 0,
        remaining: 0,
      }
    }
  }

  // Count active listings (published + pending_review)
  const { count, error } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId)
    .in('listing_status', ['published', 'pending_review'])

  if (error) {
    console.error('Error counting listings:', error)
    return {
      can_publish: false,
      reason: 'Error checking listing count',
      current_count: 0,
      max_count: 0,
      remaining: 0,
    }
  }

  const currentCount = count || 0
  const maxCount = subscription.plan?.max_active_listings || 0
  const remaining = maxCount - currentCount

  if (currentCount >= maxCount) {
    return {
      can_publish: false,
      reason: `Listing limit reached (${currentCount}/${maxCount}). Upgrade your plan for more listings.`,
      current_count: currentCount,
      max_count: maxCount,
      remaining: 0,
    }
  }

  return {
    can_publish: true,
    current_count: currentCount,
    max_count: maxCount,
    remaining,
  }
}

/**
 * Get user's payment history
 */
export async function getPaymentHistory(userId: string): Promise<PaymentTransaction[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching payment history:', error)
    return []
  }

  return data as PaymentTransaction[]
}

/**
 * Handle subscription status change (pause/unpause listings)
 */
export async function handleSubscriptionStatusChange(
  userId: string,
  newStatus: SubscriptionStatus
): Promise<void> {
  const supabase = await createClient()
  
  if (newStatus === 'canceled' || newStatus === 'paused') {
    // Pause all published listings
    await (supabase as any)
      .from('listings')
      .update({ 
        listing_status: 'paused',
        updated_at: new Date().toISOString(),
      })
      .eq('owner_id', userId)
      .eq('listing_status', 'published')
  } else if (newStatus === 'active') {
    // Get subscription to check plan limits
    const subscription = await getUserSubscription(userId)
    if (!subscription) return

    const maxListings = subscription.plan?.max_active_listings || 0
    
    // Unpause listings up to the limit
    const { data: pausedListings } = await supabase
      .from('listings')
      .select('id')
      .eq('owner_id', userId)
      .eq('listing_status', 'paused')
      .order('updated_at', { ascending: false })
      .limit(maxListings)

    if (pausedListings && pausedListings.length > 0) {
      await (supabase as any)
        .from('listings')
        .update({
          listing_status: 'published',
          updated_at: new Date().toISOString(),
        })
        .in('id', pausedListings.map((l: { id: string }) => l.id))
    }
  }
}

/**
 * Get subscriptions due for payment
 */
export async function getSubscriptionsDueForPayment(): Promise<UserSubscription[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:listing_plans(*)
    `)
    .eq('status', 'active')
    .lte('next_payment_due', today)

  if (error) {
    console.error('Error fetching due subscriptions:', error)
    return []
  }

  return data as unknown as UserSubscription[]
}

/**
 * Get overdue subscriptions past grace period
 */
export async function getOverdueSubscriptions(): Promise<UserSubscription[]> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:listing_plans(*)
    `)
    .eq('status', 'past_due')
    .lt('grace_until', now)

  if (error) {
    console.error('Error fetching overdue subscriptions:', error)
    return []
  }

  return data as unknown as UserSubscription[]
}

/**
 * Get seller's listing stats
 */
export async function getSellerStats(userId: string) {
  const supabase = await createClient()
  
  interface ListingWithMetrics {
    id: string
    listing_status: string
    listing_metrics: {
      views: number
      leads: number
      whatsapp_clicks: number
    } | null
  }
  
  // Get listings with metrics
  const { data: listingsData } = await supabase
    .from('listings')
    .select(`
      id,
      listing_status,
      listing_metrics(views, leads, whatsapp_clicks)
    `)
    .eq('owner_id', userId)

  const listings = listingsData as unknown as ListingWithMetrics[] | null

  // Count inquiries
  const { count: totalInquiries } = await supabase
    .from('listing_inquiries')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId)

  const { count: newInquiries } = await supabase
    .from('listing_inquiries')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId)
    .eq('status', 'new')

  // Aggregate metrics
  let totalViews = 0
  let totalLeads = 0
  let totalWhatsappClicks = 0
  
  const statusCounts = {
    draft: 0,
    pending_review: 0,
    published: 0,
    paused: 0,
    rejected: 0,
    sold: 0,
  }

  listings?.forEach(listing => {
    const status = listing.listing_status as keyof typeof statusCounts
    if (status in statusCounts) {
      statusCounts[status]++
    }
    
    const metrics = listing.listing_metrics
    if (metrics) {
      totalViews += metrics.views || 0
      totalLeads += metrics.leads || 0
      totalWhatsappClicks += metrics.whatsapp_clicks || 0
    }
  })

  return {
    totalListings: listings?.length || 0,
    statusCounts,
    metrics: {
      views: totalViews,
      leads: totalLeads,
      whatsappClicks: totalWhatsappClicks,
    },
    inquiries: {
      total: totalInquiries || 0,
      new: newInquiries || 0,
    },
  }
}

/**
 * Check if subscription is active and valid
 */
export function isSubscriptionActive(subscription: UserSubscription | null): boolean {
  if (!subscription) return false
  
  if (subscription.status === 'active') return true
  
  // Allow past_due within grace period
  if (subscription.status === 'past_due' && subscription.grace_until) {
    return new Date(subscription.grace_until) > new Date()
  }
  
  return false
}

/**
 * Get days until next payment
 */
export function getDaysUntilPayment(subscription: UserSubscription | null): number | null {
  if (!subscription?.next_payment_due) return null
  
  const now = new Date()
  const due = new Date(subscription.next_payment_due)
  const diffTime = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}
