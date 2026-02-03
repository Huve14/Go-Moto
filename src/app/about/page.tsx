import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Target, Heart, Users, Bike, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'About Us - Go-Moto',
  description: 'Learn about Go-Moto\'s mission to make bike ownership accessible for South African delivery riders and commuters.',
}

const VALUES = [
  {
    icon: Target,
    title: 'Rider-First',
    description: 'Everything we do is designed with riders in mind. From flexible payments to included maintenance, we remove barriers to bike ownership.',
  },
  {
    icon: Heart,
    title: 'Transparency',
    description: 'No hidden fees, no surprises. We believe in clear communication and honest pricing so you always know what you\'re paying for.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'We\'re building more than a rental company - we\'re building a community of riders who support each other on the road.',
  },
]

const STATS = [
  { value: '500+', label: 'Active Riders' },
  { value: '3', label: 'Cities Served' },
  { value: '98%', label: 'Customer Satisfaction' },
  { value: '24hr', label: 'Avg. Approval Time' },
]

const TEAM = [
  {
    name: 'Thabo Mokoena',
    role: 'Founder & CEO',
    bio: 'Former Uber Eats rider who saw the need for accessible bike ownership in SA.',
  },
  {
    name: 'Sarah van der Berg',
    role: 'Operations Director',
    bio: 'Logistics expert with 10+ years in fleet management.',
  },
  {
    name: 'David Naidoo',
    role: 'Head of Service',
    bio: 'Master mechanic ensuring our bikes stay on the road.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-gomoto-500/20 text-gomoto-400 border-gomoto-500/30">
              Our Story
            </Badge>
            <h1 className="text-4xl font-display font-bold mb-6">
              Making bike ownership accessible for every South African rider
            </h1>
            <p className="text-lg text-gray-300">
              Go-Moto was born from a simple observation: thousands of hardworking South Africans 
              want to earn through delivery platforms, but traditional financing makes bike ownership 
              out of reach. We're changing that.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold mb-6">
                From rider frustration to rider freedom
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  In 2021, our founder Thabo was a full-time Uber Eats rider in Johannesburg. 
                  Like many riders, he faced a frustrating reality: banks wouldn't give him a loan 
                  for a bike, and rental options were expensive with no path to ownership.
                </p>
                <p>
                  He saw countless talented, hardworking people stuck in the same situation. 
                  The gig economy was growing rapidly, but the infrastructure to support workers 
                  wasn't keeping up.
                </p>
                <p>
                  That's when Go-Moto was born. We built a system that assesses riders on their 
                  earning potential, not their credit history. We included maintenance because 
                  we know breakdowns mean lost income. We created flexible payment options that 
                  work with how riders actually earn.
                </p>
                <p>
                  Today, we've helped hundreds of riders get on the road and start building their 
                  futures. And we're just getting started.
                </p>
              </div>
            </div>
            <div className="bg-muted rounded-2xl aspect-square flex items-center justify-center">
              <Bike className="h-32 w-32 text-muted-foreground/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground">
              These principles guide everything we do at Go-Moto.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {VALUES.map((value, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">
              What makes Go-Moto different
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              'No credit check required',
              'Maintenance included in all plans',
              'Weekly payment options',
              'Rent-to-own path to ownership',
              'Replacement bike during service',
              'Dedicated rider support',
              '24-48 hour approval',
              'Flexible terms',
              'WhatsApp-first communication',
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">
              Meet the team
            </h2>
            <p className="text-muted-foreground">
              The people behind Go-Moto who make it all happen.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {TEAM.map((member, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-primary mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-gomoto-600 to-gomoto-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Ready to join the Go-Moto family?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Whether you're looking to rent, rent-to-own, or buy - we're here to help you get on the road.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="secondary" asChild>
              <Link href="/apply">
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" className="border-white/30 hover:bg-white/10" asChild>
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
