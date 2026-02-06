'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Upload, CheckCircle2, Loader2, Car, DollarSign, MessageCircle } from 'lucide-react'
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
import { FileUpload } from '@/components/forms/file-upload'
import { createSellRequest } from '@/lib/actions'
import { LOCATIONS, BIKE_BRANDS, CONDITIONS } from '@/types/constants'
import { getWhatsAppUrl } from '@/lib/utils'

const sellSchema = z.object({
  // Contact Info
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  
  // Bike Info
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.string().min(4, 'Year is required'),
  mileage: z.string().optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  
  // Documents
  has_papers: z.boolean(),
  finance_owing: z.boolean(),
  finance_amount: z.string().optional(),
  
  // Preferences
  sell_type: z.enum(['sell', 'trade']),
  expected_price: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  
  // Additional
  description: z.string().optional(),
  terms_accepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms' }),
  }),
})

type SellFormData = z.infer<typeof sellSchema>

export default function SellPage() {
  const router = useRouter()
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SellFormData>({
    resolver: zodResolver(sellSchema),
    defaultValues: {
      sell_type: 'sell',
      condition: 'good',
      has_papers: true,
      finance_owing: false,
      terms_accepted: false as unknown as true,
    },
  })

  const watchedValues = watch()
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27123456789'

  const handleImageUpload = (files: File[]) => {
    // In a real app, upload to storage and get URLs
    const previews = files.map((file) => URL.createObjectURL(file))
    setUploadedImages((prev) => [...prev, ...previews].slice(0, 6))
  }

  const onSubmit = async (data: SellFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, typeof value === 'boolean' ? value.toString() : value.toString())
        }
      })
      formData.append('images', JSON.stringify(uploadedImages))

      const result = await createSellRequest(formData)

      if (result.success) {
        router.push('/sell/success')
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
            Sell or Trade Your Bike
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Get a fair price for your bike. We buy all makes and models, or trade it in 
            towards a newer model. Quick valuation, hassle-free process.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Details</CardTitle>
                  <CardDescription>
                    How can we contact you about your bike?
                  </CardDescription>
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
                  <CardDescription>
                    Tell us about your bike
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand *</Label>
                      <Select
                        value={watchedValues.brand}
                        onValueChange={(value) => setValue('brand', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {BIKE_BRANDS.map((brand) => (
                            <SelectItem key={brand.value} value={brand.value}>
                              {brand.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.brand && (
                        <p className="text-sm text-destructive">{errors.brand.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        {...register('model')}
                        placeholder="e.g., X-Ride 125"
                      />
                      {errors.model && (
                        <p className="text-sm text-destructive">{errors.model.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        {...register('year')}
                        placeholder="e.g., 2022"
                      />
                      {errors.year && (
                        <p className="text-sm text-destructive">{errors.year.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mileage">Mileage (km)</Label>
                      <Input
                        id="mileage"
                        {...register('mileage')}
                        placeholder="e.g., 15000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Condition *</Label>
                    <RadioGroup
                      value={watchedValues.condition}
                      onValueChange={(value) => setValue('condition', value as any)}
                      className="grid sm:grid-cols-4 gap-4"
                    >
                      {CONDITIONS.map((condition: { value: string; label: string }) => (
                        <div key={condition.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={condition.value} id={`condition-${condition.value}`} />
                          <Label htmlFor={`condition-${condition.value}`} className="cursor-pointer">
                            {condition.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_papers"
                        checked={watchedValues.has_papers}
                        onCheckedChange={(checked) => setValue('has_papers', !!checked)}
                      />
                      <Label htmlFor="has_papers" className="cursor-pointer">
                        I have all the papers (registration, roadworthy, etc.)
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="finance_owing"
                          checked={watchedValues.finance_owing}
                          onCheckedChange={(checked) => setValue('finance_owing', !!checked)}
                        />
                        <Label htmlFor="finance_owing" className="cursor-pointer">
                          There is finance owing on this bike
                        </Label>
                      </div>
                      {watchedValues.finance_owing && (
                        <div className="ml-6 mt-2">
                          <Label htmlFor="finance_amount">Amount Owing (R)</Label>
                          <Input
                            id="finance_amount"
                            {...register('finance_amount')}
                            placeholder="e.g., 15000"
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Photos */}
              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                  <CardDescription>
                    Upload clear photos of your bike (up to 6 images)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFilesSelected={handleImageUpload}
                    accept={{ 'image/*': [] }}
                    maxSize={5 * 1024 * 1024}
                    maxFiles={6}
                  />
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {uploadedImages.map((url, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                          <img
                            src={url}
                            alt={`Bike photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>What would you like to do? *</Label>
                    <RadioGroup
                      value={watchedValues.sell_type}
                      onValueChange={(value) => setValue('sell_type', value as any)}
                      className="grid sm:grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-4">
                        <RadioGroupItem value="sell" id="sell" />
                        <Label htmlFor="sell" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <span className="font-medium">Sell my bike</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Get cash for your bike
                          </p>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4">
                        <RadioGroupItem value="trade" id="trade" />
                        <Label htmlFor="trade" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Car className="h-5 w-5 text-primary" />
                            <span className="font-medium">Trade in</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Upgrade to a newer model
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expected_price">Expected Price (R)</Label>
                      <Input
                        id="expected_price"
                        {...register('expected_price')}
                        placeholder="Your expected price"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Your Location *</Label>
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
                    <Label htmlFor="description">Additional Information</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Any other details about your bike (recent services, modifications, issues, etc.)"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-start space-x-2 pt-4 border-t">
                    <Checkbox
                      id="terms_accepted"
                      checked={watchedValues.terms_accepted}
                      onCheckedChange={(checked) => setValue('terms_accepted', !!checked as any)}
                    />
                    <Label htmlFor="terms_accepted" className="text-sm cursor-pointer">
                      I confirm that I am the legal owner of this bike and all information provided is accurate. *
                    </Label>
                  </div>
                  {errors.terms_accepted && (
                    <p className="text-sm text-destructive">{errors.terms_accepted.message}</p>
                  )}
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
                    Submit for Valuation
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
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { step: '1', title: 'Submit Details', desc: 'Fill out this form with your bike info and photos' },
                    { step: '2', title: 'Get Valuation', desc: 'We\'ll review and send you an offer within 24 hours' },
                    { step: '3', title: 'Inspection', desc: 'Bring your bike in for a quick inspection' },
                    { step: '4', title: 'Get Paid', desc: 'Accept the offer and get paid same day' },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">{item.step}</span>
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Prefer to chat directly? WhatsApp us with photos of your bike for a quick estimate.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={getWhatsAppUrl(whatsappNumber, 'Hi, I want to sell/trade my bike')}
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
