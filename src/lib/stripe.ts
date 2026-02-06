// @ts-nocheck
/**
 * Stripe Integration Layer for Go-Moto Marketplace
 * 
 * @deprecated This module is deprecated. Use iKhokha payment integration instead.
 * See src/lib/payments/ikhokha.ts for the new payment system.
 * 
 * This module is kept for backward compatibility and potential data migration.
 * It provides a clean abstraction over Stripe subscriptions.
 * If Stripe keys are not configured, it falls back to stub implementations
 * that allow the app to function in "demo mode".
 */

import Stripe from 'stripe'

// Check if Stripe is configured
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

export const isStripeConfigured = (): boolean => {
  return !!(STRIPE_SECRET_KEY && STRIPE_PUBLISHABLE_KEY)
}

// Initialize Stripe client if configured
export const stripe = STRIPE_SECRET_KEY 
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null

// Types for our payment system
export interface CreateCheckoutParams {
  customerId?: string
  userId?: string
  userEmail?: string
  planId?: string
  priceId?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

export interface CheckoutResult {
  sessionId?: string
  url?: string
  error?: string
  isDemo?: boolean
}

export interface PortalResult {
  url?: string
  error?: string
  isDemo?: boolean
}

export interface SubscriptionData {
  id: string
  status: string
  customerId: string
  priceId: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
}

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult> {
  if (!stripe) {
    // Demo mode - simulate successful checkout
    console.warn('[Stripe Stub] Creating demo checkout session')
    return {
      isDemo: true,
      url: `${params.successUrl}?demo=true&plan=${params.planId || 'demo'}`,
    }
  }

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      line_items: params.priceId ? [
        {
          price: params.priceId,
          quantity: 1,
        },
      ] : undefined,
      metadata: params.metadata || {},
    }

    // Add customer info
    if (params.customerId) {
      sessionParams.customer = params.customerId
    } else if (params.userEmail) {
      sessionParams.customer_email = params.userEmail
    }

    if (params.userId) {
      sessionParams.client_reference_id = params.userId
      sessionParams.metadata = {
        ...sessionParams.metadata,
        userId: params.userId,
      }
    }

    if (params.planId) {
      sessionParams.metadata = {
        ...sessionParams.metadata,
        planId: params.planId,
      }
      sessionParams.subscription_data = {
        metadata: {
          userId: params.userId || '',
          planId: params.planId,
        },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return {
      sessionId: session.id,
      url: session.url || undefined,
    }
  } catch (error) {
    console.error('[Stripe] Checkout error:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to create checkout session',
    }
  }
}

/**
 * Create a Stripe Customer Portal session for subscription management
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<PortalResult> {
  if (!stripe) {
    // Demo mode
    console.warn('[Stripe Stub] Creating demo portal session')
    return {
      isDemo: true,
      url: `${returnUrl}?demo=true&portal=true`,
    }
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return { url: session.url }
  } catch (error) {
    console.error('[Stripe] Portal error:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to create portal session',
    }
  }
}

/**
 * Retrieve subscription details from Stripe
 */
export async function getSubscription(subscriptionId: string): Promise<SubscriptionData | null> {
  if (!stripe) {
    console.warn('[Stripe Stub] Getting demo subscription')
    return null
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    return {
      id: subscription.id,
      status: subscription.status,
      customerId: subscription.customer as string,
      priceId: subscription.items.data[0]?.price.id || '',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    }
  } catch (error) {
    console.error('[Stripe] Get subscription error:', error)
    return null
  }
}

/**
 * Cancel a subscription at period end
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  if (!stripe) {
    console.warn('[Stripe Stub] Canceling demo subscription')
    return true
  }

  try {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
    return true
  } catch (error) {
    console.error('[Stripe] Cancel subscription error:', error)
    return false
  }
}

/**
 * Resume a canceled subscription
 */
export async function resumeSubscription(subscriptionId: string): Promise<boolean> {
  if (!stripe) {
    console.warn('[Stripe Stub] Resuming demo subscription')
    return true
  }

  try {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })
    return true
  } catch (error) {
    console.error('[Stripe] Resume subscription error:', error)
    return false
  }
}

/**
 * Construct and verify Stripe webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event | null {
  if (!stripe) {
    console.warn('[Stripe Stub] Cannot verify webhook without Stripe')
    return null
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    console.error('[Stripe] Webhook verification error:', error)
    return null
  }
}
