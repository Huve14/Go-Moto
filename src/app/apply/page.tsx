'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, User, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { submitApplication } from '@/lib/actions'
import { PLANS, LOCATIONS } from '@/types/constants'
import { cn } from '@/lib/utils'

const applicationSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  location: z.string().min(1, 'Preferred location is required'),
  platform: z.string().optional(),
  income_range: z.string().optional(),
  plan: z.enum(['starter', 'pro', 'fleet']),
  preferred_listing_id: z.string().uuid().optional().nullable(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
})

type ApplicationFormData = z.infer<typeof applicationSchema>

const STEPS = [
  { id: 1, title: 'Your Details', icon: User },
  { id: 2, title: 'Plan Selection', icon: Briefcase },
  { id: 3, title: 'Review', icon: CheckCircle2 },
]

const PLATFORMS = [
  { value: 'uber-eats', label: 'Uber Eats' },
  { value: 'mr-d', label: 'Mr D Food' },
  { value: 'bolt-food', label: 'Bolt Food' },
  { value: 'checkers-sixty60', label: 'Checkers Sixty60' },
  { value: 'takealot', label: 'Takealot' },
  { value: 'other', label: 'Other' },
]

const INCOME_RANGES = [
  { value: 'under-5000', label: 'Under R5,000' },
  { value: '5000-10000', label: 'R5,000 - R10,000' },
  { value: '10000-20000', label: 'R10,000 - R20,000' },
  { value: 'over-20000', label: 'Over R20,000' },
]

function ApplyFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const initialPlan = searchParams.get('plan') as 'starter' | 'pro' | 'fleet' || 'starter'
  const listingId = searchParams.get('listing')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      plan: initialPlan,
      preferred_listing_id: listingId || undefined,
      consent: false as unknown as true,
    },
  })

  const watchedValues = watch()
  const progress = (currentStep / STEPS.length) * 100

  const validateStep = async (step: number) => {
    let fieldsToValidate: (keyof ApplicationFormData)[] = []
    
    switch (step) {
      case 1:
        fieldsToValidate = ['full_name', 'email', 'phone']
        break
      case 2:
        fieldsToValidate = ['location', 'plan']
        break
      case 3:
        fieldsToValidate = ['consent']
        break
    }
    
    return await trigger(fieldsToValidate)
  }

  const nextStep = async () => {
    const isValid = await validateStep(currentStep)
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      const formData = new FormData()
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'boolean') {
            formData.append(key, value.toString())
          } else {
            formData.append(key, value.toString())
          }
        }
      })
      
      const result = await submitApplication(formData)
      
      if (result.success) {
        router.push(`/apply/success?id=${result.applicationId}`)
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
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/inventory"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Link>
          <h1 className="text-3xl font-display font-bold">Apply for a Bike</h1>
          <p className="text-muted-foreground mt-2">
            Complete the application form below. We'll review your application within 24-48 hours.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between">
            {STEPS.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                className={cn(
                  'flex items-center gap-2 text-sm',
                  step.id === currentStep && 'text-primary font-medium',
                  step.id < currentStep && 'text-primary cursor-pointer',
                  step.id > currentStep && 'text-muted-foreground'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2',
                    step.id === currentStep && 'border-primary bg-primary/10',
                    step.id < currentStep && 'border-primary bg-primary text-white',
                    step.id > currentStep && 'border-muted'
                  )}
                >
                  {step.id < currentStep ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <span className="hidden sm:block">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Your Details */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Details</CardTitle>
                <CardDescription>
                  Tell us about yourself so we can get in touch.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    {...register('full_name')}
                    placeholder="Enter your full name"
                  />
                  {errors.full_name && (
                    <p className="text-sm text-destructive">{errors.full_name.message}</p>
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
                    <Label htmlFor="phone">Phone Number *</Label>
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

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Additional Information (optional)</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform">Delivery Platform</Label>
                      <Select
                        value={watchedValues.platform}
                        onValueChange={(value) => setValue('platform', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform (if any)" />
                        </SelectTrigger>
                        <SelectContent>
                          {PLATFORMS.map((platform) => (
                            <SelectItem key={platform.value} value={platform.value}>
                              {platform.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="income_range">Monthly Income Range</Label>
                      <Select
                        value={watchedValues.income_range}
                        onValueChange={(value) => setValue('income_range', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select income range" />
                        </SelectTrigger>
                        <SelectContent>
                          {INCOME_RANGES.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Plan Selection */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Plan</CardTitle>
                <CardDescription>
                  Select a rental plan that suits your needs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Rental Plan *</Label>
                  <RadioGroup
                    value={watchedValues.plan}
                    onValueChange={(value) => setValue('plan', value as 'starter' | 'pro' | 'fleet')}
                    className="grid gap-4"
                  >
                    {PLANS.map((plan) => (
                      <div
                        key={plan.id}
                        className={cn(
                          'relative flex items-start space-x-3 rounded-lg border p-4 cursor-pointer',
                          watchedValues.plan === plan.id && 'border-primary ring-1 ring-primary'
                        )}
                      >
                        <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                        <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{plan.name}</span>
                            {plan.popular && <Badge>Popular</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                          <p className="text-sm font-medium mt-2">From R{plan.price_weekly}/week</p>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errors.plan && (
                    <p className="text-sm text-destructive">{errors.plan.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Preferred Collection Location *</Label>
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
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
                <CardDescription>
                  Please review your application details before submitting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Name:</span> {watchedValues.full_name}</div>
                    <div><span className="text-muted-foreground">Email:</span> {watchedValues.email}</div>
                    <div><span className="text-muted-foreground">Phone:</span> {watchedValues.phone}</div>
                    <div><span className="text-muted-foreground">Location:</span> {LOCATIONS.find(l => l.value === watchedValues.location)?.label}</div>
                    <div><span className="text-muted-foreground">Plan:</span> {PLANS.find(p => p.id === watchedValues.plan)?.name}</div>
                    {watchedValues.platform && (
                      <div><span className="text-muted-foreground">Platform:</span> {PLATFORMS.find(p => p.value === watchedValues.platform)?.label}</div>
                    )}
                  </div>
                </div>

                {/* Terms */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="consent"
                      checked={watchedValues.consent}
                      onCheckedChange={(checked) => setValue('consent', !!checked as unknown as true)}
                    />
                    <Label htmlFor="consent" className="text-sm cursor-pointer leading-relaxed">
                      I agree to the{' '}
                      <Link href="/terms" className="text-primary underline" target="_blank">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-primary underline" target="_blank">
                        Privacy Policy
                      </Link>
                      . I confirm that all information provided is accurate. *
                    </Label>
                  </div>
                  {errors.consent && (
                    <p className="text-sm text-destructive">{errors.consent.message}</p>
                  )}
                </div>

                {submitError && (
                  <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4">
                    {submitError}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < STEPS.length ? (
              <Button type="button" onClick={nextStep}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ApplyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/30 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading application form...</p>
        </div>
      </div>
    }>
      <ApplyFormContent />
    </Suspense>
  )
}
