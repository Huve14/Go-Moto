'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  ArrowRight, 
  Check, 
  Camera, 
  FileText, 
  CreditCard,
  Shield,
  TrendingUp,
  Zap,
  Star,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

const signUpSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Valid phone number required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignUpForm = z.infer<typeof signUpSchema>

interface ListingPlan {
  id: string
  slug: string
  name: string
  description: string | null
  monthly_price: number
  max_active_listings: number
  features: string[]
}

const PLAN_ICONS: Record<string, typeof Star> = {
  basic: Zap,
  pro: TrendingUp,
  featured: Star,
}

function formatPrice(cents: number): string {
  return `R${(cents / 100).toLocaleString('en-ZA')}`
}

function ListYourBikeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedPlanSlug = searchParams.get('plan')
  
  const [step, setStep] = useState<'plans' | 'signup' | 'checkout'>('plans')
  const [plans, setPlans] = useState<ListingPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<ListingPlan | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const supabase = createClient()
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  })
  
  useEffect(() => {
    async function init() {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Fetch plans (cast to any for new table)
      const { data: plansData } = await supabase
        .from('listing_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true }) as { data: any[]; error: any }
      
      if (plansData) {
        setPlans(plansData as ListingPlan[])
        
        // Pre-select plan from URL
        if (selectedPlanSlug) {
          const plan = plansData.find((p: any) => p.slug === selectedPlanSlug)
          if (plan) {
            setSelectedPlan(plan)
            setStep(user ? 'checkout' : 'signup')
          }
        }
      }
      
      // If user has subscription, redirect to dashboard
      if (user) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single() as { data: any; error: any }
        
        if (subscription) {
          router.push('/seller/listings/new')
          return
        }
      }
      
      setIsLoading(false)
    }
    
    init()
  }, [selectedPlanSlug])
  
  const handlePlanSelect = (plan: ListingPlan) => {
    setSelectedPlan(plan)
    setStep(user ? 'checkout' : 'signup')
  }
  
  const handleSignUp = async (data: SignUpForm) => {
    setIsSubmitting(true)
    setError('')
    
    try {
      // Sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
        },
      })
      
      if (authError) throw authError
      
      if (authData.user) {
        // Update profile with phone (cast to any for flexibility)
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          full_name: data.name,
          phone: data.phone,
          role: 'user',
        } as any)
        
        setUser(authData.user)
        setStep('checkout')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleCheckout = async () => {
    if (!selectedPlan || !user) return
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          planSlug: selectedPlan.slug,
        }),
      })
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      if (result.url) {
        window.location.href = result.url
      } else if (result.isDemo) {
        // Demo mode - simulate subscription creation (cast to any)
        await supabase.from('subscriptions').upsert({
          user_id: user.id,
          plan_id: selectedPlan.id,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        } as any)
        router.push('/seller?success=1')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            Seller Marketplace
          </Badge>
          <h1 className="text-4xl font-display font-bold mb-4">
            List Your Bike on Go-Moto
          </h1>
          <p className="text-lg text-white max-w-2xl mx-auto">
            Reach thousands of buyers across South Africa. Create your listing in minutes 
            and start receiving inquiries from serious buyers.
          </p>
        </div>
      </section>
      
      {/* Progress Steps */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { key: 'plans', label: 'Choose Plan' },
            { key: 'signup', label: 'Create Account' },
            { key: 'checkout', label: 'Subscribe' },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step === s.key 
                  ? 'bg-primary text-white' 
                  : (step === 'checkout' && s.key !== 'checkout') || (step === 'signup' && s.key === 'plans')
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {(step === 'checkout' && s.key !== 'checkout') || (step === 'signup' && s.key === 'plans')
                  ? <Check className="h-4 w-4" />
                  : i + 1
                }
              </div>
              <span className={`text-sm ${step === s.key ? 'font-semibold' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
              {i < 2 && <div className="w-8 h-px bg-border mx-2" />}
            </div>
          ))}
        </div>
        
        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}
        
        {/* Step: Choose Plan */}
        {step === 'plans' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-center mb-8">
              Choose your seller plan
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const Icon = PLAN_ICONS[plan.slug] || Zap
                const isPopular = plan.slug === 'pro'
                
                return (
                  <Card 
                    key={plan.id}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      isPopular ? 'border-primary ring-2 ring-primary/20' : ''
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary">Most Popular</Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="text-center">
                      <div className="mb-6">
                        <span className="text-3xl font-bold">{formatPrice(plan.monthly_price)}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      
                      <ul className="space-y-2 text-left text-sm">
                        {plan.features.slice(0, 4).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <Button className="w-full mt-6" variant={isPopular ? 'default' : 'outline'}>
                        Select Plan
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-8">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        )}
        
        {/* Step: Sign Up */}
        {step === 'signup' && selectedPlan && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Create your seller account</CardTitle>
                <CardDescription>
                  You selected the {selectedPlan.name} plan ({formatPrice(selectedPlan.monthly_price)}/month)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Your full name"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="082 123 4567"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...register('password')}
                      placeholder="Min 8 characters"
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Continue to Payment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setStep('plans')}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Choose a different plan
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Step: Checkout */}
        {step === 'checkout' && selectedPlan && user && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Complete your subscription</CardTitle>
                <CardDescription>
                  You're subscribing to the {selectedPlan.name} plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{selectedPlan.name} Plan</span>
                    <span className="font-bold">{formatPrice(selectedPlan.monthly_price)}/mo</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedPlan.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Subscribe - {formatPrice(selectedPlan.monthly_price)}/month
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Secure payment powered by Stripe. Cancel anytime.
                </p>
                
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setStep('plans')}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Choose a different plan
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Benefits */}
      <section className="py-16 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <Camera className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Easy Listing Creation</h3>
              <p className="text-sm text-muted-foreground">
                Upload photos, add details, and publish in minutes.
              </p>
            </div>
            <div>
              <FileText className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Lead Management</h3>
              <p className="text-sm text-muted-foreground">
                All buyer inquiries delivered to your dashboard and email.
              </p>
            </div>
            <div>
              <Shield className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Seller Protection</h3>
              <p className="text-sm text-muted-foreground">
                Your contact info is protected. Respond on your terms.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function ListYourBikePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ListYourBikeContent />
    </Suspense>
  )
}
