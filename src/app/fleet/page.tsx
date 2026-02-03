'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, CheckCircle2, Loader2, Building2, Users, TrendingUp, Shield, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createFleetLead } from '@/lib/actions'
import { LOCATIONS } from '@/types/constants'
import { getWhatsAppUrl } from '@/lib/utils'

const fleetSchema = z.object({
  // Company Info
  company_name: z.string().min(2, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  company_size: z.enum(['1-10', '11-50', '51-200', '201+']),
  
  // Contact Info
  contact_name: z.string().min(2, 'Contact name is required'),
  contact_role: z.string().min(2, 'Role is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  
  // Fleet Requirements
  fleet_size: z.string().min(1, 'Fleet size is required'),
  timeline: z.enum(['immediate', '1-3-months', '3-6-months', 'exploring']),
  use_case: z.string().min(10, 'Please describe your use case'),
  
  // Location
  location: z.string().min(1, 'Location is required'),
  multiple_locations: z.boolean().optional(),
  
  // Additional
  current_provider: z.string().optional(),
  budget_range: z.string().optional(),
  notes: z.string().optional(),
})

type FleetFormData = z.infer<typeof fleetSchema>

const INDUSTRIES = [
  { value: 'delivery', label: 'Food Delivery' },
  { value: 'logistics', label: 'Logistics & Courier' },
  { value: 'retail', label: 'Retail' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'other', label: 'Other' },
]

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201+', label: '200+ employees' },
]

const FLEET_SIZES = [
  { value: '5-10', label: '5-10 bikes' },
  { value: '11-25', label: '11-25 bikes' },
  { value: '26-50', label: '26-50 bikes' },
  { value: '51-100', label: '51-100 bikes' },
  { value: '100+', label: '100+ bikes' },
]

const TIMELINES = [
  { value: 'immediate', label: 'Immediately', desc: 'Ready to start now' },
  { value: '1-3-months', label: '1-3 months', desc: 'Planning ahead' },
  { value: '3-6-months', label: '3-6 months', desc: 'Future expansion' },
  { value: 'exploring', label: 'Just exploring', desc: 'Gathering info' },
]

export default function FleetPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FleetFormData>({
    resolver: zodResolver(fleetSchema),
    defaultValues: {
      company_size: '11-50',
      timeline: 'immediate',
      multiple_locations: false,
    },
  })

  const watchedValues = watch()
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27123456789'

  const onSubmit = async (data: FleetFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, typeof value === 'boolean' ? value.toString() : value.toString())
        }
      })

      const result = await createFleetLead(formData)

      if (result.success) {
        router.push('/fleet/success')
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
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <Badge variant="secondary" className="mb-4 bg-gomoto-500/20 text-gomoto-400 border-gomoto-500/30">
            For Business
          </Badge>
          <h1 className="text-4xl font-display font-bold mb-4">
            Fleet Solutions
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Scale your delivery operations with Go-Moto fleet management. 
            Custom packages for businesses with 5+ bikes, including maintenance, 
            tracking, and dedicated support.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, title: 'Volume Discounts', desc: 'Save up to 25% on larger fleets' },
              { icon: Shield, title: 'Full Maintenance', desc: 'All servicing included' },
              { icon: Users, title: 'Dedicated Manager', desc: 'Single point of contact' },
              { icon: Building2, title: 'Flexible Terms', desc: 'Scale up or down as needed' },
            ].map((item, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Tell us about your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      {...register('company_name')}
                      placeholder="Your company name"
                    />
                    {errors.company_name && (
                      <p className="text-sm text-destructive">{errors.company_name.message}</p>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry *</Label>
                      <Select
                        value={watchedValues.industry}
                        onValueChange={(value) => setValue('industry', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDUSTRIES.map((industry) => (
                            <SelectItem key={industry.value} value={industry.value}>
                              {industry.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.industry && (
                        <p className="text-sm text-destructive">{errors.industry.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Company Size *</Label>
                      <Select
                        value={watchedValues.company_size}
                        onValueChange={(value) => setValue('company_size', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPANY_SIZES.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Person</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_name">Full Name *</Label>
                      <Input
                        id="contact_name"
                        {...register('contact_name')}
                        placeholder="Your full name"
                      />
                      {errors.contact_name && (
                        <p className="text-sm text-destructive">{errors.contact_name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_role">Your Role *</Label>
                      <Input
                        id="contact_role"
                        {...register('contact_role')}
                        placeholder="e.g., Operations Manager"
                      />
                      {errors.contact_role && (
                        <p className="text-sm text-destructive">{errors.contact_role.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="your@company.com"
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

              {/* Fleet Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>Fleet Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fleet Size Needed *</Label>
                      <Select
                        value={watchedValues.fleet_size}
                        onValueChange={(value) => setValue('fleet_size', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select fleet size" />
                        </SelectTrigger>
                        <SelectContent>
                          {FLEET_SIZES.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.fleet_size && (
                        <p className="text-sm text-destructive">{errors.fleet_size.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Primary Location *</Label>
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
                  </div>

                  <div className="space-y-2">
                    <Label>Timeline *</Label>
                    <RadioGroup
                      value={watchedValues.timeline}
                      onValueChange={(value) => setValue('timeline', value as any)}
                      className="grid sm:grid-cols-2 gap-3"
                    >
                      {TIMELINES.map((timeline) => (
                        <div
                          key={timeline.value}
                          className={`flex items-start space-x-2 border rounded-lg p-3 cursor-pointer ${
                            watchedValues.timeline === timeline.value ? 'border-primary ring-1 ring-primary' : ''
                          }`}
                        >
                          <RadioGroupItem value={timeline.value} id={`timeline-${timeline.value}`} className="mt-1" />
                          <Label htmlFor={`timeline-${timeline.value}`} className="cursor-pointer flex-1">
                            <span className="font-medium">{timeline.label}</span>
                            <p className="text-xs text-muted-foreground">{timeline.desc}</p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="use_case">Describe Your Use Case *</Label>
                    <Textarea
                      id="use_case"
                      {...register('use_case')}
                      placeholder="Tell us how you plan to use the fleet (e.g., food delivery, last-mile logistics, field sales, etc.)"
                      rows={4}
                    />
                    {errors.use_case && (
                      <p className="text-sm text-destructive">{errors.use_case.message}</p>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="current_provider">Current Provider (if any)</Label>
                      <Input
                        id="current_provider"
                        {...register('current_provider')}
                        placeholder="Who do you currently use?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget_range">Budget Range (per bike/month)</Label>
                      <Input
                        id="budget_range"
                        {...register('budget_range')}
                        placeholder="e.g., R1,500 - R2,000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      {...register('notes')}
                      placeholder="Any other requirements or questions?"
                      rows={3}
                    />
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
                    Submitting...
                  </>
                ) : (
                  <>
                    Request Fleet Quote
                    <CheckCircle2 className="h-4 w-4 ml-2" />
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
                  <CardTitle>Fleet Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    'Volume pricing from 5+ bikes',
                    'Dedicated account manager',
                    'Priority support & servicing',
                    'Replacement bikes for maintenance',
                    'Custom reporting dashboard',
                    'Flexible terms & scaling',
                    'Central billing & invoicing',
                    'Rider training included',
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      {benefit}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gomoto-500/10 to-gomoto-600/10 border-gomoto-500/30">
                <CardHeader>
                  <CardTitle>Trusted by Leading Brands</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join businesses across South Africa who trust Go-Moto for their fleet needs.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Delivery Services', 'Restaurants', 'Retailers', 'Logistics'].map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Prefer to discuss directly? Our fleet team is ready to help.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={getWhatsAppUrl(whatsappNumber, 'Hi, I\'m interested in Go-Moto fleet solutions for my business')}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat with Fleet Team
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
