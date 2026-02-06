// @ts-nocheck
/**
 * @deprecated Stripe checkout - Use iKhokha payment checkout instead.
 * See /api/payments/ikhokha/create-checkout for the new checkout handler.
 * This file is kept for backward compatibility.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, createCheckoutSession } from '@/lib/stripe'

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
    
    // Fetch the plan from database (cast to any to avoid type issues with new table)
    const { data: plan, error: planError } = await supabase
      .from('listing_plans')
      .select('*')
      .eq('id', planId)
      .single() as { data: any; error: any }
    
    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }
    
    // Check for existing subscription (cast to any)
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single() as { data: any; error: any }
    
    if (existingSub) {
      return NextResponse.json(
        { error: 'You already have an active subscription' },
        { status: 400 }
      )
    }
    
    // Get or create Stripe customer
    let stripeCustomerId: string | undefined = undefined
    
    if (stripe) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single() as { data: any; error: any }
      
      if (profile?.stripe_customer_id) {
        stripeCustomerId = profile.stripe_customer_id
      } else {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_user_id: user.id,
          },
        })
        
        stripeCustomerId = customer.id
        
        // Save customer ID to profile (use raw query for new column)
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customer.id } as any)
          .eq('id', user.id)
      }
    }
    
    // Create checkout session
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    
    const result = await createCheckoutSession({
      customerId: stripeCustomerId,
      userId: user.id,
      userEmail: user.email || undefined,
      planId: plan.id,
      priceId: plan.stripe_price_id,
      successUrl: `${baseUrl}/seller?success=1`,
      cancelUrl: `${baseUrl}/list-your-bike?plan=${planSlug}`,
      metadata: {
        userId: user.id,
        planId: plan.id,
        planSlug: plan.slug,
      },
    })
    
    if (result.isDemo) {
      // Demo mode - no Stripe configured
      return NextResponse.json({
        isDemo: true,
        message: 'Stripe is not configured. Running in demo mode.',
      })
    }
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ url: result.url })
    
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
