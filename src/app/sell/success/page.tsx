import Link from 'next/link'
import { CheckCircle2, ArrowRight, Clock, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getWhatsAppUrl } from '@/lib/utils'

export default function SellSuccessPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27123456789'

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12 px-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Submission Received!</CardTitle>
          <CardDescription>
            Thank you for submitting your bike details. Our team will review your submission and get back to you with a valuation.
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
                  <p className="font-medium">Valuation (24 hours)</p>
                  <p className="text-sm text-muted-foreground">
                    We'll review your bike details and send you an offer.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Inspection</p>
                  <p className="text-sm text-muted-foreground">
                    If you're happy with the offer, bring your bike in for a quick check.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Get Paid</p>
                  <p className="text-sm text-muted-foreground">
                    Accept the final offer and receive payment same day.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Have questions or want to speed things up?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1" asChild>
                <a
                  href={getWhatsAppUrl(whatsappNumber, 'Hi, I just submitted my bike for valuation and have a question.')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp Us
                </a>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/inventory">
                  Browse Our Bikes
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
