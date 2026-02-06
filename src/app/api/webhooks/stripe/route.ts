// @ts-nocheck
/**
 * @deprecated Stripe webhook handler - Use iKhokha payment notifications instead.
 * See /api/payments/ikhokha/notify for the new webhook handler.
 * This file is kept for backward compatibility.
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { stripe, constructWebhookEvent } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    
    if (!stripe) {
      console.log('Stripe not configured, skipping webhook')
      return NextResponse.json({ received: true, mode: 'demo' })
    }
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }
    
    const event = constructWebhookEvent(body, signature)
    
    if (!event) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        
        const userId = session.metadata?.userId
        const planId = session.metadata?.planId
        
        if (!userId || !planId) {
          console.error('Missing metadata in checkout session')
          break
        }
        
        // Fetch the subscription from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
        
        // Create subscription record
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          plan_id: planId,
          stripe_subscription_id: stripeSubscription.id,
          stripe_customer_id: session.customer,
          status: stripeSubscription.status,
          current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        }, {
          onConflict: 'user_id',
        })
        
        console.log(`Subscription created for user ${userId}`)
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        
        // Find subscription by Stripe ID
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', subscription.id)
          .single()
        
        if (!existingSub) {
          console.error('Subscription not found:', subscription.id)
          break
        }
        
        // Update subscription status
        await supabase.from('subscriptions').update({
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }).eq('id', existingSub.id)
        
        // If subscription became inactive, pause listings
        if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          await supabase.rpc('pause_seller_listings', {
            seller_id: existingSub.user_id,
          })
        }
        
        // If subscription became active again, unpause listings
        if (subscription.status === 'active' && existingSub.status !== 'active') {
          await supabase.rpc('unpause_seller_listings', {
            seller_id: existingSub.user_id,
          })
        }
        
        console.log(`Subscription ${subscription.id} updated to ${subscription.status}`)
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        
        // Find and update subscription
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', subscription.id)
          .single()
        
        if (existingSub) {
          await supabase.from('subscriptions').update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
          }).eq('id', existingSub.id)
          
          // Pause all seller listings
          await supabase.rpc('pause_seller_listings', {
            seller_id: existingSub.user_id,
          })
          
          console.log(`Subscription ${subscription.id} canceled, listings paused`)
        }
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any
        
        // Find subscription
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', invoice.subscription)
          .single()
        
        if (existingSub) {
          await supabase.from('subscriptions').update({
            status: 'past_due',
          }).eq('id', existingSub.id)
          
          console.log(`Subscription ${invoice.subscription} marked as past_due`)
        }
        break
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
    
    return NextResponse.json({ received: true })
    
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Disable body parsing, we need raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}
