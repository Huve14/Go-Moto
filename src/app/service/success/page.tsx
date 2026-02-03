import Link from 'next/link'
import { CheckCircle2, ArrowRight, Clock, MessageCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getWhatsAppUrl } from '@/lib/utils'

export default function ServiceSuccessPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27123456789'

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12 px-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Service Booked!</CardTitle>
          <CardDescription>
            Your service request has been submitted. We'll confirm your appointment shortly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-left space-y-4">
            <h3 className="font-semibold">What happens next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Confirmation</p>
                  <p className="text-sm text-muted-foreground">
                    We'll call or WhatsApp you to confirm your appointment time.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Bring In / Collection</p>
                  <p className="text-sm text-muted-foreground">
                    Drop off your bike at the agreed time, or we'll arrange collection if requested.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Service Complete</p>
                  <p className="text-sm text-muted-foreground">
                    We'll let you know when your bike is ready for collection.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Have questions about your booking?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1" asChild>
                <a
                  href={getWhatsAppUrl(whatsappNumber, 'Hi, I just booked a service and have a question.')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp Us
                </a>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/">
                  Back to Home
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
