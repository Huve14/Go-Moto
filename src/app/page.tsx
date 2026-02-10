import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, Bike, FileCheck, Key, Shield, Clock, Wrench, Star, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ListingCard } from '@/components/listings/listing-card'
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

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/50 to-primary" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
        
        <div className="container relative mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge data-animate="fade-up" variant="outline" className="bg-white/20 text-white border-white/30 px-4 py-1.5">
                🚀 Now serving Johannesburg, Cape Town & Durban
              </Badge>
              
              <h1 data-animate="fade-up" className="text-4xl font-display font-bold tracking-tight sm:text-5xl lg:text-6xl stagger-1">
                Ride more.{' '}
                <span className="text-black">Earn more.</span>{' '}
                Stay on the road.
              </h1>
              
              <p data-animate="fade-up" className="text-lg text-white max-w-xl stagger-2">
                The operating system for bike ownership & earning. Rent, buy, or rent-to-own 
                bikes and scooters for delivery, commuting, or fleet operations.
              </p>
              
              <div data-animate="fade-up" className="flex flex-col sm:flex-row gap-4 stagger-3">
                <Button size="xl" asChild className="bg-white text-primary hover:bg-black hover:text-white">
                  <Link href="/inventory">
                    Get a Bike
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild className="bg-white text-primary border-white hover:bg-white/90">
                  <Link href="/apply">
                    Apply Now
                  </Link>
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                  <span>No credit check required</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                  <span>Maintenance included</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                  <span>Flexible weekly payments</span>
                </div>
              </div>
            </div>

            {/* Hero Image/Stats */}
            <div className="relative hidden lg:block" data-animate="fade-left">
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
              <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4">
                    <p className="text-4xl font-bold text-white">500+</p>
                    <p className="text-sm text-white/90 mt-1">Active Riders</p>
                  </div>
                  <div className="text-center p-4">
                    <p className="text-4xl font-bold text-white">98%</p>
                    <p className="text-sm text-white/90 mt-1">On-Time Support</p>
                  </div>
                  <div className="text-center p-4">
                    <p className="text-4xl font-bold text-white">R450</p>
                    <p className="text-sm text-white/90 mt-1">From /week</p>
                  </div>
                  <div className="text-center p-4">
                    <p className="text-4xl font-bold text-white">24hr</p>
                    <p className="text-sm text-white/90 mt-1">Approval Time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div data-animate="fade-up" className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">
              Get on the road in 3 easy steps
            </h2>
            <p className="text-muted-foreground">
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
              <Card key={index} data-animate="scale" className={`relative overflow-hidden card-hover stagger-${index + 1}`}>
                <CardHeader>
                  <div className="absolute top-4 right-4 text-6xl font-bold text-muted/20">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/apply">
                Start Your Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div data-animate="fade-up" className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-display font-bold mb-2">
                  Featured Bikes
                </h2>
                <p className="text-muted-foreground">
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

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map((listing, index) => (
                <div key={listing.id} data-animate="fade-up" className={`stagger-${(index % 4) + 1}`}>
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

      {/* Plans Preview */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div data-animate="fade-up" className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">
              Choose your plan
            </h2>
            <p className="text-muted-foreground">
              Flexible options designed for gig riders, commuters, and businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan, index) => (
              <Card
                key={plan.id}
                data-animate="scale"
                className={`relative card-hover stagger-${index + 1} ${
                  plan.popular ? 'ring-2 ring-primary/50 border-primary/30' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <span className="text-4xl font-bold">
                      {formatCurrency(plan.price_weekly)}
                    </span>
                    <span className="text-muted-foreground">/week</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href={`/apply?plan=${plan.id}`}>Choose {plan.name}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="link" asChild>
              <Link href="/pricing">
                Compare all plan features
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Go-Moto */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div data-animate="fade-up" className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">
              Why riders choose Go-Moto
            </h2>
            <p className="text-muted-foreground">
              We understand the gig economy. That's why we've built services specifically for riders.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div key={index} data-animate="fade-up" className={`text-center p-6 stagger-${index + 1}`}>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials && Array.isArray(testimonials) && testimonials.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div data-animate="fade-up" className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-bold mb-4">
                What our riders say
              </h2>
              <p className="text-muted-foreground">
                Join hundreds of riders who are already earning with Go-Moto.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.slice(0, 3).map((testimonial: any, index: number) => (
                <Card key={index} data-animate="fade-up" className={`card-hover stagger-${index + 1}`}>
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < testimonial.rating
                              ? 'text-primary fill-primary'
                              : 'text-muted-foreground/40'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.platform} rider, {testimonial.location}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {faqs && Array.isArray(faqs) && faqs.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div data-animate="fade-up" className="text-center mb-12">
                <h2 className="text-3xl font-display font-bold mb-4">
                  Frequently asked questions
                </h2>
                <p className="text-muted-foreground">
                  Got questions? We've got answers.
                </p>
              </div>

              <Accordion data-animate="fade-up" type="single" collapsible className="w-full stagger-1">
                {faqs.map((faq: any, index: number) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="text-center mt-8">
                <p className="text-muted-foreground mb-4">
                  Still have questions?
                </p>
                <Button variant="outline" asChild>
                  <a
                    href={getWhatsAppUrl(whatsappNumber, 'Hi, I have a question about Go-Moto')}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat with us on WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 data-animate="fade-up" className="text-3xl font-display font-bold mb-4">
            Ready to start earning?
          </h2>
          <p data-animate="fade-up" className="text-lg text-white mb-8 max-w-xl mx-auto stagger-1">
            Join hundreds of riders who are already on the road with Go-Moto. 
            Apply today and get approved within 24-48 hours.
          </p>
          <div data-animate="fade-up" className="flex flex-col sm:flex-row gap-4 justify-center stagger-2">
            <Button size="xl" variant="secondary" asChild className="bg-white text-primary hover:bg-white/90">
              <Link href="/apply">
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" className="bg-white text-primary border-white hover:bg-black hover:text-white hover:border-black" asChild>
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
