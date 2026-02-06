/**
 * iKhokha Payment Cancel Handler
 * 
 * GET /api/payments/ikhokha/cancel
 * 
 * User is redirected here if they cancel payment on iKhokha.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const reference = searchParams.get('reference')

  // Get the base URL for redirects
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin

  if (reference) {
    try {
      const supabase = await createClient()

      // Update transaction as cancelled if it exists
      // Note: payment_transactions table will exist after running ikhokha-migration.sql
      await (supabase as any)
        .from('payment_transactions')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('reference', reference)
        .eq('status', 'pending')

      console.log('[iKhokha Cancel] Payment cancelled:', reference)
    } catch (error) {
      console.error('[iKhokha Cancel] Error updating transaction:', error)
    }
  }

  return NextResponse.redirect(
    `${baseUrl}/pricing?cancelled=true`
  )
}
