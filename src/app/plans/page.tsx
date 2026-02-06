import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { PLANS } from '@/types/constants'
import { formatCurrency } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Plans & Pricing - Go-Moto',
  description: 'Compare Go-Moto plans: Rent, Rent-to-Own, and Buy. Flexible weekly payments with maintenance included. Find the perfect plan for your needs.',
}

const PLAN_DETAILS = {
  starter: {
    ideal: 'New riders getting started with delivery, need flexibility, or want lower weekly payments',
    commitment: 'No minimum commitment, cancel anytime with 2 weeks notice',
    ownership: 'Bike remains Go-Moto property',
    extras: ['Quick approval', 'Easy bike swaps', 'Lower entry cost'],
  },
  pro: {
    ideal: 'Serious riders building a delivery business, want premium bikes',
    commitment: 'Flexible terms, cancel with 2 weeks notice',
    ownership: 'Bike remains Go-Moto property, rent-to-own option available',
    extras: ['Premium bike selection', 'Full support', 'Best value for serious riders'],
  },
  fleet: {
    ideal: 'Businesses running multiple riders, need bulk pricing',
    commitment: 'Flexible contracts, volume discounts',
    ownership: 'Fleet management with Go-Moto support',
    extras: ['Volume discounts', 'Dedicated account manager', 'Fleet dashboard'],
  },
}

const PLAN_FAQS = [
  {
    question: 'What documents do I need to apply?',
    answer: 'You\'ll need a valid South African ID or passport, proof of address (utility bill or bank statement), and if you\'re employed, your latest payslip. For self-employed riders, 3 months of bank statements will work.',
  },
  {
    question: 'Is there a credit check?',
    answer: 'No! We don\'t do traditional credit checks. We assess your application based on your earning potential and stability. Many of our riders have had credit issues in the past - we focus on your future, not your history.',
  },
  {
    question: 'What\'s included in the maintenance?',
    answer: 'All regular servicing (oil changes, brake pads, etc.), tire replacements, and minor repairs are included. Major repairs due to accidents or negligence may not be covered. We\'ll always discuss any charges before work is done.',
  },
  {
    question: 'Can I switch between plans?',
    answer: 'Yes! If you\'re on a Rent plan and want to switch to Rent-to-Own, we can arrange that. Similarly, if you want to buy out your bike early, just let us know and we\'ll calculate the remaining balance.',
  },
  {
    question: 'What happens if my bike needs repairs?',
    answer: 'Contact us and we\'ll arrange to either pick up the bike or have it serviced near you. For Rent and Rent-to-Own plans, we offer a replacement bike while yours is being repaired so you don\'t lose earning days.',
  },
  {
    question: 'What if I want to cancel my rental?',
    answer: 'We require 2 weeks notice to cancel a rental. Your deposit will be refunded (minus any outstanding charges) once the bike is returned in good condition.',
  },
  {
    question: 'Can I use the bike for personal use?',
    answer: 'Absolutely! While most of our riders use bikes for delivery or commuting, you\'re free to use it for personal trips too. Just remember to keep it maintained and within the terms of your agreement.',
  },
  {
    question: 'What areas do you serve?',
    answer: 'We currently operate in Johannesburg, Cape Town, and Durban. We\'re expanding to other cities soon - sign up for our newsletter to be notified when we arrive in your area.',
  },
]

export default function PlansPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-background to-muted text-foreground py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4 bg-primary/20 text-primary border-primary/30">
            Flexible Options
          </Badge>
          <h1 className="text-4xl font-display font-bold mb-4">
            Plans & Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you want to rent, rent-to-own, or buy outright - we have a plan that fits your needs and budget.
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PLANS.map((plan) => {
              const details = PLAN_DETAILS[plan.id as keyof typeof PLAN_DETAILS]
              
              return (
                <Card
                  key={plan.id}
                  className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-xl scale-105' : ''}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center py-4 border-y">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-lg text-muted-foreground">From</span>
                        <span className="text-4xl font-bold">{formatCurrency(plan.price_weekly)}</span>
                        <span className="text-muted-foreground">/week</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Ideal for</p>
                        <p className="text-sm">{details.ideal}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Commitment</p>
                        <p className="text-sm">{details.commitment}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Ownership</p>
                        <p className="text-sm">{details.ownership}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <p className="text-sm font-medium">Includes:</p>
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                      asChild
                    >
                      <Link href={`/apply?plan=${plan.id}`}>
                        Choose {plan.name}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">
              Detailed Comparison
            </h2>
            <p className="text-muted-foreground">
              See exactly what's included with each plan
            </p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium">Feature</th>
                  {PLANS.map((plan) => (
                    <th key={plan.id} className="text-center py-4 px-4 font-medium">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Weekly payments', rent: '✓', rentToOwn: '✓', buy: '—' },
                  { feature: 'Maintenance included', rent: '✓', rentToOwn: '✓', buy: '6 months' },
                  { feature: 'Roadside assistance', rent: '✓', rentToOwn: '✓', buy: '6 months' },
                  { feature: 'Swap bike if unavailable', rent: '✓', rentToOwn: '✓', buy: '—' },
                  { feature: 'Build equity', rent: '—', rentToOwn: '✓', buy: '✓' },
                  { feature: 'Own at end of term', rent: '—', rentToOwn: '✓', buy: '✓' },
                  { feature: 'No credit check', rent: '✓', rentToOwn: '✓', buy: '✓' },
                  { feature: 'Flexible commitment', rent: '✓', rentToOwn: '—', buy: '✓' },
                  { feature: 'Lower weekly cost', rent: '✓', rentToOwn: '—', buy: '—' },
                  { feature: 'Best total value', rent: '—', rentToOwn: '—', buy: '✓' },
                ].map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-4 px-4 text-muted-foreground">{row.feature}</td>
                    <td className="text-center py-4 px-4">
                      {row.rent === '✓' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                      ) : row.rent === '—' ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        row.rent
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {row.rentToOwn === '✓' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                      ) : row.rentToOwn === '—' ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        row.rentToOwn
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {row.buy === '✓' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                      ) : row.buy === '—' ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        row.buy
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-3xl font-display font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about our plans
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {PLAN_FAQS.map((faq, index) => (
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
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Apply now and get approved within 24-48 hours. No credit check required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="secondary" asChild>
              <Link href="/apply">
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" className="border-white/30 hover:bg-white/10" asChild>
              <Link href="/inventory">
                Browse Bikes First
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
