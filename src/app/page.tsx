import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, Bike, FileCheck, Key, Shield, Clock, Wrench, Star, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ListingCard } from '@/components/listings/listing-card'
import { Section, SectionHeader } from '@/components/ui/section'
import { StatsGrid } from '@/components/ui/stats-counter'
import { BrandMarquee } from '@/components/ui/brand-marquee'
import { TestimonialCarousel } from '@/components/ui/testimonial-carousel'
import { PricingCard } from '@/components/ui/pricing-card'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, getWhatsAppUrl } from '@/lib/utils'
import { PLANS } from '@/types/constants'

async function getFeaturedListings() {
  const supabase = createClient()
  const { data } = await supabase
    .from('listings')
    .select('*, listing_images(*)')
    .eq('status', 'published')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(4)
  return (data || []) as any[]
}

async function getCmsContent(key: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('cms_content')
    .select('data')
    .eq('key', key)
    .single()
  const content = data as any
  return (content?.data || null) as any
}

export default async function HomePage() {
  const [featuredListings, testimonials, faqs] = await Promise.all([
    getFeaturedListings(),
    getCmsContent('testimonials'),
    getCmsContent('faqs'),
  ])

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27123456789'

  // Partner/brand names for marquee
  const deliveryPartners = ['Uber Eats', 'Mr D Food', 'Bolt Food', 'Sixty60', 'Takealot', 'Checkers', 'Woolworths', 'Pick n Pay']

  // Stats for the counter section
  const stats = [
    { value: 500, label: 'Active Riders', suffix: '+' },
    { value: 98, label: 'On-Time Support', suffix: '%' },
    { value: 450, label: 'From Per Week', prefix: 'R' },
    { value: 24, label: 'Hour Approval', suffix: 'hr' },
  ]

  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section - Autovent Style */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-background">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-autovent-500/20 rounded-full blur-[150px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[120px]" />
        
        {/* Decorative floating elements */}
        <div className="absolute top-1/4 right-10 w-3 h-3 rounded-full bg-gradient-to-r from-autovent-500 to-teal-500 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-teal-500/50 animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container relative mx-auto px-4 py-32 sm:px-6 lg:px-8 lg:py-40 pt-40">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              {/* Event-style date badge like Autovent */}
              <div className="flex flex-wrap gap-4" data-animate="fade-up">
                <Badge variant="outline" className="bg-autovent-500/10 text-autovent-400 border-autovent-500/30 px-4 py-2 text-sm font-medium">
                  🏍️ Now in Johannesburg, Cape Town & Durban
                </Badge>
              </div>
              
              {/* Hero headline with Autovent typography */}
              <h1 data-animate="fade-up" className="text-5xl font-display font-bold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1] uppercase text-foreground">
                <span className="text-line">Get Ready</span>{' '}
                <span>to</span>{' '}
                <span className="text-gradient">Experience</span>{' '}
                <span className="text-foreground">the Road</span>
              </h1>
              
              <p data-animate="fade-up" className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                The operating system for bike ownership & earning. Rent, buy, or rent-to-own 
                bikes and scooters for delivery, commuting, or fleet operations.
              </p>
              
              {/* CTA buttons */}
              <div data-animate="fade-up" className="flex flex-col sm:flex-row gap-4">
                <Button size="xl" asChild className="bg-gradient-to-r from-autovent-500 to-teal-500 border-0 hover:shadow-autovent-500/30">
                  <Link href="/inventory">
                    Get a Bike
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <Link href="/apply">
                    Apply Now
                  </Link>
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap gap-8 pt-6" data-animate="fade-up">
                {[  
                  'No credit check required',
                  'Maintenance included',
                  'Flexible weekly payments',
                ].map((text) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    </div>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Stats Card - Autovent style */}
            <div className="relative hidden lg:block" data-animate="fade-left">
              <div className="absolute -top-10 -right-10 w-80 h-80 bg-autovent-500/15 rounded-full blur-[100px]" />
              <div className="relative z-10 glass rounded-3xl p-10 shadow-2xl">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center p-6 rounded-2xl surface-muted">
                    <p className="text-5xl font-bold text-gradient">500+</p>
                    <p className="text-sm text-muted-foreground mt-2 font-medium uppercase tracking-wider">Active Riders</p>
                  </div>
                  <div className="text-center p-6 rounded-2xl surface-muted">
                    <p className="text-5xl font-bold text-line">98%</p>
                    <p className="text-sm text-muted-foreground mt-2 font-medium uppercase tracking-wider">On-Time Support</p>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                    <p className="text-5xl font-bold text-gradient">R450</p>
                    <p className="text-sm text-muted-foreground mt-2 font-medium uppercase tracking-wider">From /week</p>
                  </div>
                  <div className="text-center p-6 rounded-2xl surface-muted">
                    <p className="text-5xl font-bold text-line">24hr</p>
                    <p className="text-sm text-muted-foreground mt-2 font-medium uppercase tracking-wider">Approval Time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Gradient edge at bottom */}
        <div className="de-gradient-edge-bottom" />
      </section>

      {/* Brand Marquee - Autovent Style */}
      <section className="bg-muted py-8 border-y border-border">
        <BrandMarquee brands={deliveryPartners} speed="medium" />
      </section>

      {/* How It Works - Autovent Style */}
      <section className="py-24 bg-background relative">
        <div className="de-gradient-edge-top" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div data-animate="fade-up" className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="heading-lg text-foreground mb-6">
              <span className="text-line">How</span>{' '}
              <span className="text-gradient">It Works</span>
            </h2>
            <p className="body-lg">
              We've made getting a bike as simple as possible so you can start earning faster.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileCheck,
                step: '01',
                title: 'Apply Online',
                description: 'Fill out our simple application form. No credit check required, just basic documentation.',
              },
              {
                icon: CheckCircle2,
                step: '02',
                title: 'Get Approved',
                description: 'Our team reviews your application within 24-48 hours and gets you approved.',
              },
              {
                icon: Key,
                step: '03',
                title: 'Collect & Earn',
                description: 'Pick up your bike, complete a quick orientation, and start earning on the road.',
              },
            ].map((item, index) => (
              <div 
                key={index} 
                data-animate="scale" 
                className="relative overflow-hidden rounded-2xl card-premium p-8 card-hover group"
              >
                {/* Step number background */}
                <div className="absolute top-4 right-4 text-7xl font-bold text-muted-foreground/10 group-hover:text-primary/10 transition-colors">
                  {item.step}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                
                {/* Corner decoration */}
                <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-accent/20 rounded-br-2xl" />
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button size="lg" asChild className="bg-gradient-to-r from-autovent-500 to-teal-500 border-0">
              <Link href="/apply">
                Start Your Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Listings - Autovent Style */}
      {featuredListings.length > 0 && (
        <section className="py-24 bg-muted relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div data-animate="fade-up" className="flex items-center justify-between mb-16">
              <div>
                <Badge variant="accent" className="mb-4">Top Picks</Badge>
                <h2 className="heading-lg text-foreground">
                  <span className="text-line">Featured</span>{' '}
                  <span className="text-gradient">Bikes</span>
                </h2>
                <p className="text-muted-foreground text-lg mt-2">
                  Hand-picked selection of our best bikes for delivery riders
                </p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex">
                <Link href="/inventory">
                  View All Inventory
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {featuredListings.map((listing, index) => (
                <div key={listing.id} data-animate="fade-up" className="h-full">
                  <ListingCard
                    listing={listing}
                    showFavorite={false}
                  />
                </div>
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/inventory">
                  View All Inventory
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Plans Preview - Autovent Pricing Style */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div data-animate="fade-up" className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="heading-lg text-foreground mb-4">
              <span className="text-line">Get</span>{' '}
              <span className="text-gradient">Your Plan</span>
            </h2>
            <p className="body-lg">
              Flexible options designed for gig riders, commuters, and businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan, index) => (
              <PricingCard
                key={plan.id}
                title={plan.name}
                subtitle={plan.description}
                price={plan.price_weekly}
                priceLabel="/week"
                featured={plan.popular}
                ctaText={`Choose ${plan.name}`}
                ctaHref={`/apply?plan=${plan.id}`}
                features={plan.features.slice(0, 5).map(f => ({ text: f, included: true }))}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="link" asChild className="text-accent hover:text-accent/80">
              <Link href="/pricing">
                Compare all plan features
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Go-Moto - Autovent Style */}
      <section className="py-24 bg-muted relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div data-animate="fade-up" className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="heading-lg text-foreground mb-4">
              <span className="text-line">Why</span>{' '}
              <span className="text-gradient">Riders Choose Us</span>
            </h2>
            <p className="body-lg">
              We understand the gig economy. That's why we've built services specifically for riders.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'No Credit Check',
                description: 'We assess based on your earning potential, not your credit score.',
              },
              {
                icon: Clock,
                title: '24-48hr Approval',
                description: 'Quick turnaround so you can get on the road faster.',
              },
              {
                icon: Wrench,
                title: 'Maintenance Included',
                description: 'Focus on earning while we handle the servicing.',
              },
              {
                icon: Bike,
                title: 'Swap Bike Option',
                description: 'Bike in for service? Get a replacement to keep earning.',
              },
            ].map((item, index) => (
              <div 
                key={index} 
                data-animate="fade-up" 
                className="text-center p-8 card-premium card-hover group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center mx-auto mb-5 group-hover:from-primary group-hover:to-accent transition-all">
                  <item.icon className="h-8 w-8 text-accent group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Autovent Carousel Style */}
      {testimonials && Array.isArray(testimonials) && testimonials.length > 0 && (
        <section className="py-24 bg-background relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div data-animate="fade-up" className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="heading-lg text-foreground mb-4">
                <span className="text-line">What</span>{' '}
                <span className="text-gradient">They Say</span>
              </h2>
              <p className="body-lg">
                Join hundreds of riders who are already earning with Go-Moto.
              </p>
            </div>

            <TestimonialCarousel
              testimonials={testimonials.slice(0, 6).map((t: any, i: number) => ({
                id: i,
                content: t.content,
                author: t.name,
                role: `${t.platform} rider, ${t.location}`,
                rating: t.rating,
              }))}
            />
          </div>
        </section>
      )}

      {/* FAQs - Autovent Style */}
      {faqs && Array.isArray(faqs) && faqs.length > 0 && (
        <section className="py-24 bg-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div data-animate="fade-up" className="text-center mb-16">
                <h2 className="heading-lg text-foreground mb-4">
                  <span className="text-line">Frequently</span>{' '}
                  <span className="text-gradient">Asked</span>
                </h2>
                <p className="body-lg">
                  Got questions? We've got answers.
                </p>
              </div>

              <Accordion data-animate="fade-up" type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq: any, index: number) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`} 
                    className="border border-border rounded-xl card-premium px-6 data-[state=open]:border-primary/30"
                  >
                    <AccordionTrigger className="text-left text-foreground hover:text-accent font-medium py-5 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="text-center mt-12">
                <p className="text-muted-foreground mb-5">
                  Still have questions?
                </p>
                <Button size="lg" asChild className="bg-gradient-to-r from-autovent-500 to-teal-500 border-0">
                  <a
                    href={getWhatsAppUrl(whatsappNumber, 'Hi, I have a question about Go-Moto')}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Chat with us on WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Autovent Style */}
      <section className="py-24 bg-background relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[120px]" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 data-animate="fade-up" className="heading-lg text-foreground mb-6">
            <span className="text-line">Ready to</span>{' '}
            <span className="text-gradient">Start Earning?</span>
          </h2>
          <p data-animate="fade-up" className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of riders who are already on the road with Go-Moto. 
            Apply today and get approved within 24-48 hours.
          </p>
          <div data-animate="fade-up" className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" asChild className="bg-gradient-to-r from-autovent-500 to-teal-500 border-0 hover:shadow-autovent-500/30">
              <Link href="/apply">
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/inventory">
                Browse Bikes
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
