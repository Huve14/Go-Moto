'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, CheckCircle2, Loader2, Wrench, Clock, Shield, MessageCircle, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { createServiceBooking } from '@/lib/actions'
import { LOCATIONS } from '@/types/constants'
import { getWhatsAppUrl } from '@/lib/utils'

const serviceSchema = z.object({
  // Contact Info
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  
  // Bike Info
  bike_brand: z.string().min(1, 'Brand is required'),
  bike_model: z.string().min(1, 'Model is required'),
  bike_year: z.string().optional(),
  registration: z.string().optional(),
  
  // Service
  service_type: z.enum(['general', 'repair', 'tyres', 'brakes', 'electrical', 'other']),
  urgency: z.enum(['routine', 'soon', 'urgent']),
  description: z.string().min(10, 'Please describe the issue or service needed'),
  
  // Appointment
  preferred_date: z.string().min(1, 'Preferred date is required'),
  preferred_time: z.enum(['morning', 'afternoon', 'any']),
  location: z.string().min(1, 'Location is required'),
  
  // Options
  need_collection: z.boolean(),
  need_replacement: z.boolean(),
  is_rental_customer: z.boolean(),
  rental_reference: z.string().optional(),
})

type ServiceFormData = z.infer<typeof serviceSchema>

const SERVICE_TYPES = [
  { value: 'general', label: 'General Service', desc: 'Oil change, filters, basic check' },
  { value: 'repair', label: 'Repairs', desc: 'Fix a specific issue' },
  { value: 'tyres', label: 'Tyres', desc: 'Replacement or puncture repair' },
  { value: 'brakes', label: 'Brakes', desc: 'Pads, discs, fluid' },
  { value: 'electrical', label: 'Electrical', desc: 'Lights, battery, wiring' },
  { value: 'other', label: 'Other', desc: 'Something else' },
]

const URGENCY_OPTIONS = [
  { value: 'routine', label: 'Routine', desc: 'Within the next 2 weeks' },
  { value: 'soon', label: 'Soon', desc: 'Within the next few days' },
  { value: 'urgent', label: 'Urgent', desc: 'As soon as possible' },
]

export default function ServicePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      service_type: 'general',
      urgency: 'routine',
      preferred_time: 'any',
      need_collection: false,
      need_replacement: false,
      is_rental_customer: false,
    },
  })

  const watchedValues = watch()
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27123456789'

  const onSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, typeof value === 'boolean' ? value.toString() : value.toString())
        }
      })

      const result = await createServiceBooking(formData)

      if (result.success) {
        router.push('/service/success')
      } else {
        setSubmitError(result.error || 'An error occurred. Please try again.')
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum date (tomorrow)
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateString = minDate.toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-br from-background to-muted text-foreground py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-display font-bold mb-4">
            Book a Service
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Expert bike servicing and repairs. Whether you're a Go-Moto rental customer 
            or bringing in your own bike, we've got you covered.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer Check */}
              <Card>
                <CardHeader>
                  <CardTitle>Are you a Go-Moto customer?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_rental_customer"
                      checked={watchedValues.is_rental_customer}
                      onCheckedChange={(checked) => setValue('is_rental_customer', !!checked)}
                    />
                    <Label htmlFor="is_rental_customer" className="cursor-pointer">
                      Yes, I'm renting/rent-to-own a bike from Go-Moto
                    </Label>
                  </div>
                  {watchedValues.is_rental_customer && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Great! As a Go-Moto customer, maintenance is included in your plan.
                      </p>
                      <div className="mt-2">
                        <Label htmlFor="rental_reference">Rental Reference (optional)</Label>
                        <Input
                          id="rental_reference"
                          {...register('rental_reference')}
                          placeholder="Your application or contract reference"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Your full name"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
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
                  </div>
                </CardContent>
              </Card>

              {/* Bike Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Bike Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bike_brand">Brand *</Label>
                      <Input
                        id="bike_brand"
                        {...register('bike_brand')}
                        placeholder="e.g., Big Boy"
                      />
                      {errors.bike_brand && (
                        <p className="text-sm text-destructive">{errors.bike_brand.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bike_model">Model *</Label>
                      <Input
                        id="bike_model"
                        {...register('bike_model')}
                        placeholder="e.g., X-Ride 125"
                      />
                      {errors.bike_model && (
                        <p className="text-sm text-destructive">{errors.bike_model.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bike_year">Year</Label>
                      <Input
                        id="bike_year"
                        {...register('bike_year')}
                        placeholder="e.g., 2022"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registration">Registration</Label>
                      <Input
                        id="registration"
                        {...register('registration')}
                        placeholder="e.g., ABC 123 GP"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Required</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Service Type *</Label>
                    <RadioGroup
                      value={watchedValues.service_type}
                      onValueChange={(value) => setValue('service_type', value as any)}
                      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
                    >
                      {SERVICE_TYPES.map((type) => (
                        <div
                          key={type.value}
                          className={`flex items-start space-x-2 border rounded-lg p-3 cursor-pointer ${
                            watchedValues.service_type === type.value ? 'border-primary ring-1 ring-primary' : ''
                          }`}
                        >
                          <RadioGroupItem value={type.value} id={`service-${type.value}`} className="mt-1" />
                          <Label htmlFor={`service-${type.value}`} className="cursor-pointer flex-1">
                            <span className="font-medium">{type.label}</span>
                            <p className="text-xs text-muted-foreground">{type.desc}</p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>How urgent is this? *</Label>
                    <RadioGroup
                      value={watchedValues.urgency}
                      onValueChange={(value) => setValue('urgency', value as any)}
                      className="grid sm:grid-cols-3 gap-3"
                    >
                      {URGENCY_OPTIONS.map((option) => (
                        <div
                          key={option.value}
                          className={`flex items-start space-x-2 border rounded-lg p-3 cursor-pointer ${
                            watchedValues.urgency === option.value ? 'border-primary ring-1 ring-primary' : ''
                          }`}
                        >
                          <RadioGroupItem value={option.value} id={`urgency-${option.value}`} className="mt-1" />
                          <Label htmlFor={`urgency-${option.value}`} className="cursor-pointer flex-1">
                            <span className="font-medium">{option.label}</span>
                            <p className="text-xs text-muted-foreground">{option.desc}</p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Describe the issue or service needed *</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Tell us what's wrong or what service you need. The more detail, the better we can help."
                      rows={4}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Appointment */}
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferred_date">Preferred Date *</Label>
                      <Input
                        id="preferred_date"
                        type="date"
                        min={minDateString}
                        {...register('preferred_date')}
                      />
                      {errors.preferred_date && (
                        <p className="text-sm text-destructive">{errors.preferred_date.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred Time *</Label>
                      <Select
                        value={watchedValues.preferred_time}
                        onValueChange={(value) => setValue('preferred_time', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning (8am - 12pm)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12pm - 5pm)</SelectItem>
                          <SelectItem value="any">Any time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Service Location *</Label>
                    <Select
                      value={watchedValues.location}
                      onValueChange={(value) => setValue('location', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((location) => (
                          <SelectItem key={location.value} value={location.value}>
                            {location.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.location && (
                      <p className="text-sm text-destructive">{errors.location.message}</p>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="need_collection"
                        checked={watchedValues.need_collection}
                        onCheckedChange={(checked) => setValue('need_collection', !!checked)}
                      />
                      <Label htmlFor="need_collection" className="cursor-pointer">
                        I need my bike collected (additional fee may apply)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="need_replacement"
                        checked={watchedValues.need_replacement}
                        onCheckedChange={(checked) => setValue('need_replacement', !!checked)}
                      />
                      <Label htmlFor="need_replacement" className="cursor-pointer">
                        I need a replacement bike while mine is being serviced
                        {watchedValues.is_rental_customer && (
                          <Badge variant="secondary" className="ml-2">Included</Badge>
                        )}
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {submitError && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4">
                  {submitError}
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Service
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Why Service with Us?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: Wrench, title: 'Expert Mechanics', desc: 'Trained on all major brands' },
                    { icon: Clock, title: 'Quick Turnaround', desc: 'Most services done same day' },
                    { icon: Shield, title: 'Quality Parts', desc: 'OEM or equivalent parts used' },
                  ].map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-800 dark:text-green-200">Go-Moto Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                    Regular maintenance is included in your rental plan at no extra cost. 
                    You also get a free replacement bike while yours is being serviced!
                  </p>
                  <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                    <CheckCircle2 className="h-4 w-4" />
                    Maintenance included
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Need urgent help? WhatsApp us directly.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={getWhatsAppUrl(whatsappNumber, 'Hi, I need to book a service for my bike')}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp Us
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
