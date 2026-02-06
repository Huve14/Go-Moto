import { Metadata } from 'next'
import Link from 'next/link'
import { Check, ArrowRight, Star, Shield, TrendingUp, Zap, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Pricing - List Your Bike | Go-Moto',
  description: 'Choose a plan to list your bike on South Africa\'s leading motorcycle marketplace. Reach thousands of buyers with our marketing platform.',
}

// Hardcoded pricing plans
const PRICING_PLANS = [
  {
    id: 'basic',
    slug: 'basic',
    name: 'Basic',
    description: 'Perfect for private sellers with a single bike',
    price: 199,
    features: [
      '1 active listing',
      '30-day listing duration',
      'Up to 5 photos',
      'Email lead notifications',
      'Basic seller dashboard',
      'Standard search placement',
    ],
  },
  {
    id: 'pro',
    slug: 'pro',
    name: 'Pro',
    description: 'Best value for serious sellers',
    price: 349,
    features: [
      '3 active listings',
      '60-day listing duration',
      'Up to 15 photos per listing',
      'Email + SMS lead notifications',
      'Full analytics dashboard',
      'Priority search placement',
      'Highlight badge on listings',
      'Social media promotion',
    ],
  },
  {
    id: 'featured',
    slug: 'featured',
    name: 'Featured',
    description: 'Maximum visibility for premium bikes',
    price: 599,
    features: [
      '5 active listings',
      '90-day listing duration',
      'Unlimited photos',
      'Instant lead notifications',
      'Advanced analytics & insights',
      'Top search placement',
      'Featured homepage banner',
      'Social media spotlight',
      'Dedicated support',
    ],
  },
]

const PLAN_ICONS: Record<string, typeof Star> = {
  basic: Zap,
  pro: TrendingUp,
  featured: Star,
}

const PLAN_COLORS: Record<string, string> = {
  basic: 'border-border',
  pro: 'border-primary ring-2 ring-primary/20',
  featured: 'border-amber-500 ring-2 ring-amber-500/20',
}

export default function PricingPage() {
  const plans = PRICING_PLANS

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background to-muted text-foreground py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4 bg-primary/20 text-primary border-primary/30">
            Seller Plans
          </Badge>
          <h1 className="text-4xl font-display font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your selling needs. All plans include lead notifications, 
            seller dashboard, and access to thousands of potential buyers.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => {
              const Icon = PLAN_ICONS[plan.slug] || Zap
              const isPopular = plan.slug === 'pro'
              const colorClass = PLAN_COLORS[plan.slug] || 'border-border'
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative ${colorClass} ${isPopular ? 'scale-105 shadow-lg' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
                      plan.slug === 'featured' 
                        ? 'bg-amber-500/20 text-amber-500' 
                        : 'bg-primary/20 text-primary'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="text-center pb-6">
                    <div className="mb-6">
                      <span className="text-4xl font-bold">R{plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    
                    <div className="space-y-3 text-left">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-2">
                          <Check className={`h-5 w-5 mt-0.5 shrink-0 ${
                            plan.slug === 'featured' ? 'text-amber-500' : 'text-primary'
                          }`} />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={isPopular ? 'default' : 'outline'}
                      size="lg"
                      asChild
                    >
                      <Link href={`/list-your-bike?plan=${plan.slug}`}>
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          {/* Request a Quote Section */}
          <div className="mt-12 max-w-3xl mx-auto">
            <Card className="bg-gradient-to-r from-muted/50 to-muted border-dashed border-2">
              <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 py-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Need a Custom Solution?</h3>
                    <p className="text-muted-foreground text-sm">
                      Dealerships, fleets, or bulk listings? Get a tailored quote for your business needs.
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="lg" className="shrink-0" asChild>
                  <Link href="/contact?subject=quote">
                    Request a Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-display font-bold text-center mb-12">
            Why list with Go-Moto?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Maximum Exposure</h3>
              <p className="text-sm text-muted-foreground">
                Reach thousands of motivated buyers actively searching for bikes like yours.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Verified Leads</h3>
              <p className="text-sm text-muted-foreground">
                All inquiries are captured and delivered to your inbox. No spam, just real buyers.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Seller Tools</h3>
              <p className="text-sm text-muted-foreground">
                Track views, manage leads, and optimize your listing with our seller dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-display font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Yes! You can cancel your subscription at any time. Your listing will remain active 
                  until the end of your billing period.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens when I sell my bike?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Simply mark your listing as "Sold" and it will be removed from public search. 
                  You can use your remaining slots for other bikes.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do I receive buyer inquiries?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  All inquiries are sent to your email and appear in your seller dashboard. 
                  Pro and Featured plans also include SMS notifications.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I upgrade my plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Absolutely! You can upgrade anytime from your billing settings. 
                  The price difference will be prorated for the current billing period.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Ready to sell your bike?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Create your listing in minutes and start receiving inquiries from serious buyers.
          </p>
          <Button size="xl" variant="secondary" asChild>
            <Link href="/list-your-bike">
              List Your Bike Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
