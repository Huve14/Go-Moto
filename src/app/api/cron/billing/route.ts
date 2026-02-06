/**
 * Daily Billing Cron Job
 * 
 * This endpoint should be called daily by an external cron service (e.g., Vercel Cron, GitHub Actions)
 * It handles:
 * 1. Marking subscriptions as past_due when payment is due
 * 2. Pausing subscriptions that exceed grace period
 * 3. Sending payment reminder emails
 * 
 * Protected by CRON_SECRET environment variable
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface DueSubscription {
  id: string
  user_id: string
  plan_id: string
  next_payment_due: string
}

interface OverdueSubscription {
  id: string
  user_id: string
  grace_until: string
}

// Create admin client for cron operations
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey)
}

async function getUserEmail(supabase: ReturnType<typeof getAdminClient>, userId: string): Promise<{ email: string | null; name: string | null }> {
  const { data } = await supabase.auth.admin.getUserById(userId)
  return {
    email: data?.user?.email || null,
    name: data?.user?.user_metadata?.full_name || null,
  }
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()
  const results = {
    markedPastDue: 0,
    paused: 0,
    remindersSent: 0,
    errors: [] as string[],
  }

  try {
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()

    // =========================================================================
    // 1. Mark active subscriptions as past_due if payment is due
    // =========================================================================
    const { data: dueSubscriptions, error: dueError } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan_id, next_payment_due')
      .eq('status', 'active')
      .lte('next_payment_due', today)

    if (dueError) {
      results.errors.push(`Error fetching due subscriptions: ${dueError.message}`)
    } else if (dueSubscriptions && dueSubscriptions.length > 0) {
      for (const sub of dueSubscriptions as DueSubscription[]) {
        // Calculate grace period (3 days from due date)
        const graceDate = new Date(sub.next_payment_due)
        graceDate.setDate(graceDate.getDate() + 3)
        
        // Update to past_due
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            grace_until: graceDate.toISOString(),
            updated_at: now,
          } as Record<string, unknown>)
          .eq('id', sub.id)

        if (updateError) {
          results.errors.push(`Failed to mark subscription ${sub.id} as past_due: ${updateError.message}`)
        } else {
          results.markedPastDue++

          // Send payment due email
          try {
            const { email, name } = await getUserEmail(supabase, sub.user_id)
            if (email) {
              await resend.emails.send({
                from: 'Go Moto <billing@gomoto.co.za>',
                to: email,
                subject: 'Payment Due - Your Go Moto Subscription',
                html: `
                  <h2>Payment Due for Your Go Moto Subscription</h2>
                  <p>Hi ${name || 'Seller'},</p>
                  <p>Your subscription payment is now due. To keep your listings active, please make a payment within the next 3 days.</p>
                  <p><strong>Grace Period Ends:</strong> ${graceDate.toLocaleDateString('en-ZA')}</p>
                  <p>After this date, your listings will be paused until payment is received.</p>
                  <p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/seller/billing" 
                       style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Pay Now
                    </a>
                  </p>
                  <p>Thank you for being part of Go Moto!</p>
                `,
              })
              results.remindersSent++
            }
          } catch (emailError) {
            results.errors.push(`Failed to send email for subscription ${sub.id}`)
          }
        }
      }
    }

    // =========================================================================
    // 2. Pause subscriptions that exceeded grace period
    // =========================================================================
    const { data: overdueSubscriptions, error: overdueError } = await supabase
      .from('subscriptions')
      .select('id, user_id, grace_until')
      .eq('status', 'past_due')
      .lt('grace_until', now)

    if (overdueError) {
      results.errors.push(`Error fetching overdue subscriptions: ${overdueError.message}`)
    } else if (overdueSubscriptions && overdueSubscriptions.length > 0) {
      for (const sub of overdueSubscriptions as OverdueSubscription[]) {
        // Pause the subscription
        const { error: pauseError } = await supabase
          .from('subscriptions')
          .update({
            status: 'paused',
            updated_at: now,
          } as Record<string, unknown>)
          .eq('id', sub.id)

        if (pauseError) {
          results.errors.push(`Failed to pause subscription ${sub.id}: ${pauseError.message}`)
          continue
        }

        // Pause all published listings for this user
        const { error: listingError } = await supabase
          .from('listings')
          .update({
            listing_status: 'paused',
            updated_at: now,
          } as Record<string, unknown>)
          .eq('owner_id', sub.user_id)
          .eq('listing_status', 'published')

        if (listingError) {
          results.errors.push(`Failed to pause listings for user ${sub.user_id}: ${listingError.message}`)
        }

        results.paused++

        // Send subscription paused email
        try {
          const { email, name } = await getUserEmail(supabase, sub.user_id)
          if (email) {
            await resend.emails.send({
              from: 'Go Moto <billing@gomoto.co.za>',
              to: email,
              subject: 'Subscription Paused - Your Listings Are Now Hidden',
              html: `
                <h2>Your Go Moto Subscription Has Been Paused</h2>
                <p>Hi ${name || 'Seller'},</p>
                <p>Your subscription payment was not received within the grace period, so your subscription has been paused.</p>
                <p><strong>Your listings are now hidden</strong> from buyers until you reactivate your subscription.</p>
                <p>To restore your listings:</p>
                <ol>
                  <li>Go to your Seller Dashboard</li>
                  <li>Navigate to Billing</li>
                  <li>Complete your payment</li>
                </ol>
                <p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/seller/billing" 
                     style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Reactivate Now
                  </a>
                </p>
                <p>If you have any questions, please contact our support team.</p>
              `,
            })
          }
        } catch (emailError) {
          results.errors.push(`Failed to send pause email for subscription ${sub.id}`)
        }
      }
    }

    // =========================================================================
    // 3. Send reminder emails for subscriptions in grace period (day 2)
    // =========================================================================
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0]

    const { data: reminderSubscriptions, error: reminderError } = await supabase
      .from('subscriptions')
      .select('id, user_id, grace_until')
      .eq('status', 'past_due')
      .gte('grace_until', now)
      .eq('next_payment_due', twoDaysAgoStr)

    if (!reminderError && reminderSubscriptions && reminderSubscriptions.length > 0) {
      for (const sub of reminderSubscriptions as OverdueSubscription[]) {
        try {
          const { email, name } = await getUserEmail(supabase, sub.user_id)
          if (email) {
            await resend.emails.send({
              from: 'Go Moto <billing@gomoto.co.za>',
              to: email,
              subject: 'URGENT: Last Day to Pay - Listings Will Be Paused Tomorrow',
              html: `
                <h2>⚠️ Final Reminder: Your Listings Will Be Paused Tomorrow</h2>
                <p>Hi ${name || 'Seller'},</p>
                <p>This is your final reminder that your subscription payment is overdue.</p>
                <p><strong>Your listings will be hidden from buyers tomorrow</strong> if payment is not received.</p>
                <p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/seller/billing" 
                     style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Pay Now to Keep Your Listings Active
                  </a>
                </p>
                <p>Don't lose potential buyers - pay now!</p>
              `,
            })
            results.remindersSent++
          }
        } catch (emailError) {
          results.errors.push(`Failed to send reminder email for subscription ${sub.id}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Billing cron job completed',
      results,
      timestamp: now,
    })

  } catch (error) {
    console.error('Billing cron error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      results,
    }, { status: 500 })
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request)
}
