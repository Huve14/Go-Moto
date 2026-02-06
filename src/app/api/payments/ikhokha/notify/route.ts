/**
 * iKhokha Payment Notification Webhook
 * 
 * POST /api/payments/ikhokha/notify
 * 
 * This endpoint receives server-to-server payment notifications from iKhokha.
 * It verifies the signature, updates the payment transaction, and activates subscriptions.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  validateNotificationSignature, 
  parseNotification,
  verifyPaymentStatus,
  mapPaymentStatusToSubscriptionStatus 
} from '@/lib/payments/ikhokha'

interface PaymentTransaction {
  id: string
  user_id: string
  subscription_id: string | null
  plan_id: string
  reference: string
  amount: number
  status: 'pending' | 'paid' | 'failed'
  subscriptions?: {
    id: string
    listing_plans?: {
      max_active_listings: number
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    
    // Get headers for signature validation
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value
    })

    // Validate signature
    const isValid = validateNotificationSignature(headers, body)
    if (!isValid) {
      console.error('[iKhokha Notify] Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse notification payload
    const notification = parseNotification(body)
    if (!notification) {
      console.error('[iKhokha Notify] Failed to parse notification')
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      )
    }

    const { reference, transactionId, status } = notification
    console.log('[iKhokha Notify] Received:', { reference, transactionId, status })

    const supabase = await createClient()

    // Find the payment transaction by reference
    const { data: txData, error: findError } = await supabase
      .from('payment_transactions')
      .select('*, subscriptions(*, listing_plans(*))')
      .eq('reference', reference)
      .single()

    if (findError || !txData) {
      console.error('[iKhokha Notify] Transaction not found:', reference)
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    const transaction = txData as unknown as PaymentTransaction

    // Idempotency check: if already paid, do nothing
    if (transaction.status === 'paid') {
      console.log('[iKhokha Notify] Transaction already paid:', reference)
      return NextResponse.json({ received: true, message: 'Already processed' })
    }

    // Verify payment status with iKhokha (server-side verification)
    const verifyResult = await verifyPaymentStatus(reference)
    
    if (!verifyResult.success) {
      console.error('[iKhokha Notify] Verification failed:', verifyResult.error)
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 500 }
      )
    }

    const paymentStatus = verifyResult.status
    const now = new Date().toISOString()

    // Update payment transaction
    await (supabase as any)
      .from('payment_transactions')
      .update({
        status: paymentStatus === 'paid' ? 'paid' : 
                paymentStatus === 'failed' ? 'failed' : 
                paymentStatus === 'cancelled' ? 'failed' : 'pending',
        provider_transaction_id: transactionId,
        paid_at: paymentStatus === 'paid' ? now : null,
        updated_at: now,
      })
      .eq('id', transaction.id)

    // If payment succeeded, update subscription
    if (paymentStatus === 'paid') {
      const subscription = transaction.subscriptions
      const plan = subscription?.listing_plans

      if (subscription) {
        // Calculate new period dates
        const periodStart = new Date()
        const periodEnd = new Date()
        periodEnd.setMonth(periodEnd.getMonth() + 1) // Add 1 month

        // Update subscription to active
        await (supabase as any)
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_start: periodStart.toISOString(),
            current_period_end: periodEnd.toISOString(),
            next_payment_due: periodEnd.toISOString(),
            grace_until: null,
            updated_at: now,
          })
          .eq('id', subscription.id)

        // Unpause any paused listings (up to plan limit)
        if (plan?.max_active_listings) {
          const { data: pausedListings } = await supabase
            .from('listings')
            .select('id')
            .eq('owner_id', transaction.user_id)
            .eq('listing_status', 'paused')
            .order('updated_at', { ascending: false })
            .limit(plan.max_active_listings)

          if (pausedListings && pausedListings.length > 0) {
            await (supabase as any)
              .from('listings')
              .update({
                listing_status: 'published',
                updated_at: now,
              })
              .in('id', pausedListings.map((l: { id: string }) => l.id))
          }
        }

        console.log('[iKhokha Notify] Subscription activated for user:', transaction.user_id)
      }
    }

    // If payment failed, update subscription status
    if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
      const subscription = transaction.subscriptions

      if (subscription) {
        await (supabase as any)
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: now,
          })
          .eq('id', subscription.id)
      }
    }

    return NextResponse.json({ received: true, status: paymentStatus })
  } catch (error) {
    console.error('[iKhokha Notify] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
