'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock, MessageCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createLead } from '@/lib/actions'
import { getWhatsAppUrl } from '@/lib/utils'

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Please provide more details'),
})

type ContactFormData = z.infer<typeof contactSchema>

const SUBJECTS = [
  { value: 'general', label: 'General Enquiry' },
  { value: 'rental', label: 'Bike Rental' },
  { value: 'application', label: 'Application Status' },
  { value: 'service', label: 'Service & Repairs' },
  { value: 'sell', label: 'Sell/Trade My Bike' },
  { value: 'fleet', label: 'Fleet Solutions' },
  { value: 'other', label: 'Other' },
]

const LOCATIONS = [
  {
    city: 'Johannesburg',
    address: '123 Commissioner Street, Johannesburg CBD, 2001',
    phone: '011 123 4567',
    hours: 'Mon-Fri: 8am-5pm, Sat: 8am-1pm',
  },
  {
    city: 'Cape Town',
    address: '456 Long Street, Cape Town City Centre, 8001',
    phone: '021 123 4567',
    hours: 'Mon-Fri: 8am-5pm, Sat: 8am-1pm',
  },
  {
    city: 'Durban',
    address: '789 Florida Road, Morningside, Durban, 4001',
    phone: '031 123 4567',
    hours: 'Mon-Fri: 8am-5pm, Sat: 8am-1pm',
  },
]

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27123456789'

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      subject: 'general',
    },
  })

  const watchedValues = watch()

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value)
      })
      formData.append('source', 'contact-page')
      formData.append('type', data.subject)

      const result = await createLead(formData)

      if (result.success) {
        setIsSubmitted(true)
        reset()
      } else {
        setSubmitError(result.error || 'An error occurred. Please try again.')
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-display font-bold mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-gray-300">
              Have a question or need help? We're here for you. Reach out via the form below, 
              WhatsApp, or visit one of our locations.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground mb-6">
                      Thank you for reaching out. We'll respond within 24 hours.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          {...register('name')}
                          placeholder="Your name"
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          placeholder="your@email.com"
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...register('phone')}
                          placeholder="0XX XXX XXXX"
                        />
                        {errors.phone && (
                          <p className="text-sm text-destructive">{errors.phone.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Subject *</Label>
                        <Select
                          value={watchedValues.subject}
                          onValueChange={(value) => setValue('subject', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBJECTS.map((subject) => (
                              <SelectItem key={subject.value} value={subject.value}>
                                {subject.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.subject && (
                          <p className="text-sm text-destructive">{errors.subject.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        {...register('message')}
                        placeholder="How can we help you?"
                        rows={6}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message.message}</p>
                      )}
                    </div>

                    {submitError && (
                      <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 text-sm">
                        {submitError}
                      </div>
                    )}

                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* WhatsApp CTA */}
            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Quick Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  Need a faster response? Chat with us on WhatsApp for immediate assistance.
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                  <a
                    href={getWhatsAppUrl(whatsappNumber, 'Hi, I have a question about Go-Moto')}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp Us
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>General Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:hello@gomoto.co.za" className="text-sm text-primary hover:underline">
                      hello@gomoto.co.za
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href="tel:+27123456789" className="text-sm text-primary hover:underline">
                      +27 12 345 6789
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Hours</p>
                    <p className="text-sm text-muted-foreground">
                      Mon-Fri: 8am-5pm<br />
                      Sat: 8am-1pm<br />
                      Sun: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Locations */}
        <div className="mt-12">
          <h2 className="text-2xl font-display font-bold mb-6">Our Locations</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {LOCATIONS.map((location, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {location.city}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${location.phone.replace(/\s/g, '')}`} className="hover:text-primary">
                      {location.phone}
                    </a>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">{location.hours}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
