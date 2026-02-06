/**
 * iKhokha Payment Integration for Go-Moto Marketplace
 * 
 * This module provides integration with iKhokha's iK Pay Gateway
 * for processing seller subscription payments.
 * 
 * API Documentation: https://developer.ikhokha.com/
 */

import crypto from 'crypto'

// Environment configuration
const IKHOKHA_APPLICATION_KEY_ID = process.env.IKHOKHA_APPLICATION_KEY_ID
const IKHOKHA_APPLICATION_KEY_SECRET = process.env.IKHOKHA_APPLICATION_KEY_SECRET
const IKHOKHA_BASE_URL = process.env.IKHOKHA_BASE_URL || 'https://api.ikhokha.com/ikhokha-api/v1'
const IKHOKHA_RETURN_URL = process.env.IKHOKHA_RETURN_URL || ''
const IKHOKHA_NOTIFY_URL = process.env.IKHOKHA_NOTIFY_URL || ''
const IKHOKHA_CANCEL_URL = process.env.IKHOKHA_CANCEL_URL || ''

export const isIkhokhaConfigured = (): boolean => {
  return !!(IKHOKHA_APPLICATION_KEY_ID && IKHOKHA_APPLICATION_KEY_SECRET)
}

// Types
export interface CreatePaymentParams {
  userId: string
  planId: string
  amount: number // in cents (e.g., 19900 = R199.00)
  reference: string
  description?: string
  returnUrl?: string
  cancelUrl?: string
  notifyUrl?: string
  metadata?: Record<string, string>
}

export interface PaymentResult {
  success: boolean
  paymentUrl?: string
  reference?: string
  transactionId?: string
  error?: string
  isDemo?: boolean
}

export interface PaymentStatusResult {
  success: boolean
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'unknown'
  transactionId?: string
  paidAt?: Date
  error?: string
  isDemo?: boolean
}

export interface NotificationPayload {
  reference: string
  transactionId: string
  status: string
  amount: number
  timestamp: string
}

/**
 * Generate a unique payment reference
 * Format: GM-{userId-short}-{planId-short}-{timestamp}
 */
export function generatePaymentReference(userId: string, planId: string): string {
  const userShort = userId.slice(0, 8)
  const planShort = planId.slice(0, 8)
  const timestamp = Date.now().toString(36)
  return `GM-${userShort}-${planShort}-${timestamp}`.toUpperCase()
}

/**
 * Generate HMAC signature for iKhokha API requests
 */
function generateSignature(payload: string): string {
  if (!IKHOKHA_APPLICATION_KEY_SECRET) {
    throw new Error('iKhokha secret key not configured')
  }
  return crypto
    .createHmac('sha256', IKHOKHA_APPLICATION_KEY_SECRET)
    .update(payload)
    .digest('hex')
}

/**
 * Make authenticated request to iKhokha API
 */
async function ikhokhaRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'POST',
  body?: Record<string, unknown>
): Promise<T> {
  if (!IKHOKHA_APPLICATION_KEY_ID || !IKHOKHA_APPLICATION_KEY_SECRET) {
    throw new Error('iKhokha credentials not configured')
  }

  const url = `${IKHOKHA_BASE_URL}${endpoint}`
  const timestamp = new Date().toISOString()
  const bodyString = body ? JSON.stringify(body) : ''
  
  // Create signature payload: method + endpoint + timestamp + body
  const signaturePayload = `${method}${endpoint}${timestamp}${bodyString}`
  const signature = generateSignature(signaturePayload)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-IK-Application-Key': IKHOKHA_APPLICATION_KEY_ID,
    'X-IK-Timestamp': timestamp,
    'X-IK-Signature': signature,
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? bodyString : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[iKhokha] API Error:', response.status, errorText)
    throw new Error(`iKhokha API error: ${response.status}`)
  }

  return response.json()
}

/**
 * Create a payment request with iKhokha
 * Returns a payment URL to redirect the user to
 */
export async function createPaymentRequest(params: CreatePaymentParams): Promise<PaymentResult> {
  // Demo mode if not configured
  if (!isIkhokhaConfigured()) {
    console.warn('[iKhokha Demo] Creating demo payment request')
    const returnUrl = params.returnUrl || IKHOKHA_RETURN_URL
    return {
      success: true,
      isDemo: true,
      reference: params.reference,
      paymentUrl: `${returnUrl}?reference=${params.reference}&status=paid&demo=true`,
    }
  }

  try {
    const amountInRands = params.amount / 100 // Convert cents to rands

    const requestBody = {
      amount: amountInRands,
      currency: 'ZAR',
      reference: params.reference,
      description: params.description || 'Go-Moto Listing Subscription',
      returnUrl: params.returnUrl || IKHOKHA_RETURN_URL,
      cancelUrl: params.cancelUrl || IKHOKHA_CANCEL_URL,
      notifyUrl: params.notifyUrl || IKHOKHA_NOTIFY_URL,
      metadata: {
        userId: params.userId,
        planId: params.planId,
        ...params.metadata,
      },
    }

    const response = await ikhokhaRequest<{
      paymentUrl: string
      transactionId: string
      reference: string
    }>('/payments/initiate', 'POST', requestBody)

    return {
      success: true,
      paymentUrl: response.paymentUrl,
      transactionId: response.transactionId,
      reference: response.reference,
    }
  } catch (error) {
    console.error('[iKhokha] Create payment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment request',
    }
  }
}

/**
 * Verify payment status with iKhokha
 */
export async function verifyPaymentStatus(reference: string): Promise<PaymentStatusResult> {
  // Demo mode if not configured
  if (!isIkhokhaConfigured()) {
    console.warn('[iKhokha Demo] Verifying demo payment')
    return {
      success: true,
      isDemo: true,
      status: 'paid',
      paidAt: new Date(),
    }
  }

  try {
    const response = await ikhokhaRequest<{
      reference: string
      status: string
      transactionId: string
      paidAt?: string
    }>(`/payments/status/${reference}`, 'GET')

    const statusMap: Record<string, PaymentStatusResult['status']> = {
      'SUCCESSFUL': 'paid',
      'PENDING': 'pending',
      'FAILED': 'failed',
      'CANCELLED': 'cancelled',
    }

    return {
      success: true,
      status: statusMap[response.status.toUpperCase()] || 'unknown',
      transactionId: response.transactionId,
      paidAt: response.paidAt ? new Date(response.paidAt) : undefined,
    }
  } catch (error) {
    console.error('[iKhokha] Verify payment error:', error)
    return {
      success: false,
      status: 'unknown',
      error: error instanceof Error ? error.message : 'Failed to verify payment',
    }
  }
}

/**
 * Validate webhook/notification signature from iKhokha
 */
export function validateNotificationSignature(
  headers: Record<string, string>,
  body: string
): boolean {
  if (!IKHOKHA_APPLICATION_KEY_SECRET) {
    console.warn('[iKhokha] No secret configured, skipping signature validation')
    return true // Allow in demo mode
  }

  const receivedSignature = headers['x-ik-signature'] || headers['X-IK-Signature']
  const timestamp = headers['x-ik-timestamp'] || headers['X-IK-Timestamp']

  if (!receivedSignature || !timestamp) {
    console.error('[iKhokha] Missing signature or timestamp headers')
    return false
  }

  // Recreate the signature
  const signaturePayload = `POST/payments/notify${timestamp}${body}`
  const expectedSignature = generateSignature(signaturePayload)

  const isValid = crypto.timingSafeEqual(
    Buffer.from(receivedSignature),
    Buffer.from(expectedSignature)
  )

  if (!isValid) {
    console.error('[iKhokha] Signature validation failed')
  }

  return isValid
}

/**
 * Parse notification payload from iKhokha
 */
export function parseNotification(body: string): NotificationPayload | null {
  try {
    const data = JSON.parse(body)
    
    return {
      reference: data.reference || data.externalReference,
      transactionId: data.transactionId || data.id,
      status: data.status || data.paymentStatus,
      amount: data.amount,
      timestamp: data.timestamp || data.createdAt,
    }
  } catch (error) {
    console.error('[iKhokha] Failed to parse notification:', error)
    return null
  }
}

/**
 * Map iKhokha status to our subscription status
 */
export function mapPaymentStatusToSubscriptionStatus(
  paymentStatus: PaymentStatusResult['status']
): 'active' | 'past_due' | 'pending' {
  switch (paymentStatus) {
    case 'paid':
      return 'active'
    case 'pending':
      return 'pending'
    case 'failed':
    case 'cancelled':
    default:
      return 'past_due'
  }
}
