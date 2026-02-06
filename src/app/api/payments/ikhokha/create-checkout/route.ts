/**
 * Create Payment Checkout
 * 
 * POST /api/payments/ikhokha/create-checkout
 * 
 * Creates a payment request and returns the iKhokha payment URL.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  createPaymentRequest, 
  generatePaymentReference,
  isIkhokhaConfigured 
} from '@/lib/payments/ikhokha'

interface ListingPlan {
  id: string
  name: string
  slug: string
  monthly_price: number
  max_active_listings: number
}

interface ExistingSubscription {
  id: string
  status: string
}

interface NewSubscription {
  id: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { planId, planSlug } = body
    
    if (!planId || !planSlug) {
      return NextResponse.json(
        { error: 'Plan ID and slug are required' },
        { status: 400 }
      )
    }
    
    // Fetch the plan from database
    const { data: planData, error: planError } = await supabase
      .from('listing_plans')
      .select('*')
      .eq('id', planId)
      .single()
    
    if (planError || !planData) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }
    
    const plan = planData as unknown as ListingPlan
    
    // Check for existing active subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()
    
    if (existingSub) {
      return NextResponse.json(
        { error: 'You already have an active subscription' },
        { status: 400 }
      )
    }

    // Generate unique payment reference
    const reference = generatePaymentReference(user.id, planId)

    // Get or create subscription record
    let subscriptionId: string

    const { data: pendingSubData } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['pending', 'past_due', 'paused'])
      .single()

    const existingPendingSub = pendingSubData as unknown as ExistingSubscription | null

    if (existingPendingSub) {
      // Update existing subscription with new plan
      await (supabase as any)
        .from('subscriptions')
        .update({
          plan_id: planId,
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPendingSub.id)
      
      subscriptionId = existingPendingSub.id
    } else {
      // Create new subscription
      const { data: newSubData, error: subError } = await (supabase as any)
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: 'pending',
        })
        .select('id')
        .single()

      if (subError || !newSubData) {
        console.error('Failed to create subscription:', subError)
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        )
      }

      const newSub = newSubData as unknown as NewSubscription
      subscriptionId = newSub.id
    }

    // Create payment transaction record
    const { error: transactionError } = await (supabase as any)
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        subscription_id: subscriptionId,
        plan_id: planId,
        reference: reference,
        amount: plan.monthly_price,
        status: 'pending',
        provider: 'ikhokha',
      })

    if (transactionError) {
      console.error('Failed to create transaction:', transactionError)
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      )
    }

    // Create iKhokha payment request
    const result = await createPaymentRequest({
      userId: user.id,
      planId: planId,
      amount: plan.monthly_price,
      reference: reference,
      description: `Go-Moto ${plan.name} Plan - Monthly Subscription`,
      metadata: {
        planSlug: planSlug,
        subscriptionId: subscriptionId,
      },
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentUrl: result.paymentUrl,
      reference: result.reference,
      isDemo: result.isDemo,
    })
  } catch (error) {
    console.error('[Create Checkout] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
