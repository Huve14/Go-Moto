import Link from 'next/link'
import { CheckCircle2, ArrowRight, Clock, Mail, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getWhatsAppUrl } from '@/lib/utils'

export default function ApplySuccessPage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  const applicationId = searchParams.id?.slice(0, 8).toUpperCase() || 'PENDING'
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27123456789'

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12 px-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Application Submitted!</CardTitle>
          <CardDescription>
            Thank you for applying. Your application reference number is:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-4">
            <p className="font-mono text-2xl font-bold tracking-wider">
              {applicationId}
            </p>
          </div>

          <div className="text-left space-y-4">
            <h3 className="font-semibold">What happens next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Review (24-48 hours)</p>
                  <p className="text-sm text-muted-foreground">
                    Our team will review your application and verify your documents.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">We'll contact you</p>
                  <p className="text-sm text-muted-foreground">
                    Once approved, we'll call or email you to arrange bike collection.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Have questions about your application?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1" asChild>
                <a
                  href={getWhatsAppUrl(whatsappNumber, `Hi, I just submitted an application (Ref: ${applicationId}) and have a question.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp Us
                </a>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/inventory">
                  Browse More Bikes
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            A confirmation email has been sent to your email address. 
            Please check your spam folder if you don't see it.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
