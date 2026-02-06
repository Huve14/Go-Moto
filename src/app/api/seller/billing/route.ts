/**
 * Seller Billing API
 * Fetches current subscription and payment history for the authenticated seller
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Get user's subscription with plan details
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        status,
        next_payment_due,
        grace_until,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        plan:listing_plans(
          id,
          name,
          slug,
          monthly_price,
          max_active_listings,
          features
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError)
      throw subError
    }

    // Get payment history
    const { data: transactions, error: txError } = await supabase
      .from('payment_transactions')
      .select('id, reference, amount, status, created_at, paid_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (txError) {
      console.error('Error fetching transactions:', txError)
      // Don't throw - transactions are optional
    }

    return NextResponse.json({
      subscription: subscription || null,
      transactions: transactions || [],
    })

  } catch (error) {
    console.error('Billing API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing data' },
      { status: 500 }
    )
  }
}
