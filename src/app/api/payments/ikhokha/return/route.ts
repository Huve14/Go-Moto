/**
 * iKhokha Payment Return Handler
 * 
 * GET /api/payments/ikhokha/return
 * 
 * User is redirected here after completing payment on iKhokha.
 * We verify the payment server-side and redirect to the appropriate page.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPaymentStatus } from '@/lib/payments/ikhokha'

interface PaymentTransaction {
  id: string
  user_id: string
  plan_id: string
  reference: string
  status: 'pending' | 'paid' | 'failed'
  subscriptions?: {
    id: string
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const reference = searchParams.get('reference')
  const demo = searchParams.get('demo')
  const status = searchParams.get('status')

  // Get the base URL for redirects
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin

  if (!reference) {
    console.error('[iKhokha Return] Missing reference')
    return NextResponse.redirect(
      `${baseUrl}/seller?error=missing_reference`
    )
  }

  try {
    const supabase = await createClient()

    // Find the payment transaction
    const { data: txData, error: findError } = await supabase
      .from('payment_transactions')
      .select('*, subscriptions(*)')
      .eq('reference', reference)
      .single()

    if (findError || !txData) {
      console.error('[iKhokha Return] Transaction not found:', reference)
      return NextResponse.redirect(
        `${baseUrl}/seller?error=transaction_not_found`
      )
    }

    const transaction = txData as unknown as PaymentTransaction

    // If already paid, redirect to success
    if (transaction.status === 'paid') {
      return NextResponse.redirect(
        `${baseUrl}/seller?success=payment_completed&plan=${transaction.plan_id}`
      )
    }

    // Handle demo mode
    if (demo === 'true' && status === 'paid') {
      const now = new Date()
      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      // Update transaction as paid in demo mode
      await (supabase as any)
        .from('payment_transactions')
        .update({
          status: 'paid',
          paid_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('id', transaction.id)

      // Update subscription
      if (transaction.subscriptions) {
        await (supabase as any)
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            next_payment_due: periodEnd.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('id', transaction.subscriptions.id)
      }

      return NextResponse.redirect(
        `${baseUrl}/seller?success=payment_completed&demo=true`
      )
    }

    // Verify payment with iKhokha
    const verifyResult = await verifyPaymentStatus(reference)

    if (!verifyResult.success || verifyResult.status !== 'paid') {
      // Payment not confirmed yet - could be pending or failed
      // The notify webhook will handle the actual update
      console.log('[iKhokha Return] Payment not yet confirmed:', verifyResult.status)
      
      if (verifyResult.status === 'pending') {
        return NextResponse.redirect(
          `${baseUrl}/seller?pending=payment_processing`
        )
      }

      return NextResponse.redirect(
        `${baseUrl}/seller?error=payment_not_confirmed`
      )
    }

    // Payment verified - update records
    const now = new Date()
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    await (supabase as any)
      .from('payment_transactions')
      .update({
        status: 'paid',
        paid_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', transaction.id)

    if (transaction.subscriptions) {
      await (supabase as any)
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          next_payment_due: periodEnd.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('id', transaction.subscriptions.id)
    }

    return NextResponse.redirect(
      `${baseUrl}/seller?success=payment_completed`
    )
  } catch (error) {
    console.error('[iKhokha Return] Error:', error)
    return NextResponse.redirect(
      `${baseUrl}/seller?error=verification_failed`
    )
  }
}
