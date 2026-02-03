import Link from 'next/link'
import { CheckCircle2, ArrowRight, Clock, MessageCircle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getWhatsAppUrl } from '@/lib/utils'

export default function FleetSuccessPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27123456789'

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12 px-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Enquiry Received!</CardTitle>
          <CardDescription>
            Thank you for your interest in Go-Moto fleet solutions. Our business team will be in touch shortly.
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
                  <p className="font-medium">Review (24-48 hours)</p>
                  <p className="text-sm text-muted-foreground">
                    Our fleet team will review your requirements and prepare a customized proposal.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Discovery Call</p>
                  <p className="text-sm text-muted-foreground">
                    We'll schedule a call to understand your needs better and discuss solutions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Custom Proposal</p>
                  <p className="text-sm text-muted-foreground">
                    Receive a tailored fleet solution with pricing and implementation plan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              Want to fast-track the conversation?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1" asChild>
                <a
                  href={getWhatsAppUrl(whatsappNumber, 'Hi, I just submitted a fleet enquiry and would like to discuss further.')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp Fleet Team
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
