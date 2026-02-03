import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  // If Resend is not configured, log to console (dev mode)
  if (!resend) {
    console.log('=== DEV EMAIL ===')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('HTML:', html)
    console.log('================')
    return { success: true, data: { id: 'dev-email' } }
  }

  try {
    const data = await resend.emails.send({
      from: 'Go-Moto <noreply@go-moto.co.za>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

// Email Templates
export const emailTemplates = {
  applicationSubmitted: (data: {
    fullName: string
    plan: string
    applicationId: string
  }) => ({
    subject: 'Your Go-Moto Application Has Been Received',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 12px; line-height: 60px; color: white; font-weight: bold; font-size: 24px;">GM</div>
          </div>
          
          <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Thanks for your application, ${data.fullName}!</h1>
          
          <p>We've received your application for the <strong>${data.plan}</strong> plan. Our team will review your details and get back to you within 24-48 hours.</p>
          
          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Application Reference</p>
            <p style="margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #f97316;">${data.applicationId.slice(0, 8).toUpperCase()}</p>
          </div>
          
          <h2 style="font-size: 18px; margin-top: 30px;">What happens next?</h2>
          <ol style="padding-left: 20px;">
            <li style="margin-bottom: 10px;">Our team reviews your application</li>
            <li style="margin-bottom: 10px;">We may request additional documents if needed</li>
            <li style="margin-bottom: 10px;">Once approved, we'll schedule your bike collection</li>
            <li style="margin-bottom: 10px;">Start earning on the road!</li>
          </ol>
          
          <p>If you have any questions, feel free to WhatsApp us or reply to this email.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p>Go-Moto (Pty) Ltd</p>
            <p>"Ride more. Earn more. Stay on the road."</p>
          </div>
        </body>
      </html>
    `,
  }),

  applicationStatusUpdate: (data: {
    fullName: string
    status: string
    message?: string
  }) => ({
    subject: `Application Update: ${data.status.replace('_', ' ').toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 12px; line-height: 60px; color: white; font-weight: bold; font-size: 24px;">GM</div>
          </div>
          
          <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Hi ${data.fullName},</h1>
          
          <p>Your application status has been updated to: <strong style="color: #f97316;">${data.status.replace('_', ' ').toUpperCase()}</strong></p>
          
          ${data.message ? `<div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0;"><p style="margin: 0;">${data.message}</p></div>` : ''}
          
          <p>Log in to your account to view more details or contact us if you have any questions.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p>Go-Moto (Pty) Ltd</p>
          </div>
        </body>
      </html>
    `,
  }),

  serviceBookingConfirmation: (data: {
    fullName: string
    serviceType: string
    preferredDate: string
    location: string
  }) => ({
    subject: 'Service Booking Confirmed - Go-Moto',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 12px; line-height: 60px; color: white; font-weight: bold; font-size: 24px;">GM</div>
          </div>
          
          <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Service Booking Confirmed!</h1>
          
          <p>Hi ${data.fullName}, your service booking has been received.</p>
          
          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px;"><strong>Service:</strong> ${data.serviceType}</p>
            <p style="margin: 0 0 10px;"><strong>Preferred Date:</strong> ${data.preferredDate}</p>
            <p style="margin: 0;"><strong>Location:</strong> ${data.location}</p>
          </div>
          
          <p>We'll contact you to confirm the exact appointment time.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p>Go-Moto (Pty) Ltd</p>
          </div>
        </body>
      </html>
    `,
  }),

  internalNotification: (data: {
    type: string
    details: Record<string, any>
  }) => ({
    subject: `[Go-Moto] New ${data.type}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: monospace; padding: 20px;">
          <h2>New ${data.type}</h2>
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; overflow: auto;">
${JSON.stringify(data.details, null, 2)}
          </pre>
        </body>
      </html>
    `,
  }),
}

// Helper to send internal notifications
export async function notifyAdmin(type: string, details: Record<string, any>) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@go-moto.co.za'
  const template = emailTemplates.internalNotification({ type, details })
  return sendEmail({
    to: adminEmail,
    ...template,
  })
}
