import Link from 'next/link'
import {
  ArrowRight,
  Bike,
  TrendingUp,
  Shield,
  Wrench,
  Star,
  CheckCircle2,
  Zap,
  Users,
  MapPin,
  Clock,
  ChevronRight,
  Play,
  MessageCircle,
  Package,
  HeadphonesIcon,
  BarChart3,
  BadgeCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

/* ─────────────────────────────────────────────
   HERO SECTION
───────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#07080f]">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid opacity-100" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] hero-orb blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] hero-orb-blue blur-3xl pointer-events-none" />

      {/* Red accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <span className="badge-pill">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E53935] pulse-glow inline-block" aria-hidden="true" />
            <span className="sr-only">Live: </span>
            South Africa&apos;s #1 Bike Platform
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] tracking-tight max-w-5xl mx-auto mb-6">
          Ride More.{' '}
          <span className="gradient-text-hero">Earn More.</span>
          <br />
          Stay on the Road.
        </h1>

        <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          The operating system for bike ownership and earning in South Africa. 
          Rent, rent-to-own, or buy bikes and scooters built for delivery, 
          commuting, and fleet operations.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            asChild
            size="lg"
            className="bg-[#E53935] hover:bg-[#C62828] text-white text-base font-semibold px-8 py-6 rounded-xl glow-red-sm transition-all duration-300 hover:glow-red hover:scale-105"
          >
            <Link href="/apply">
              Apply Now — It&apos;s Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/40 text-base font-semibold px-8 py-6 rounded-xl transition-all duration-300 backdrop-blur-sm"
          >
            <Link href="/inventory">
              Browse Bikes
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-white/40 text-sm">
          {['No deposit required', 'Same-day approval', 'Nationwide coverage', 'Fleet management'].map((item) => (
            <span key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#E53935]" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative z-10 w-full border-t border-white/8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '2,500+', label: 'Bikes on the Road', suffix: '' },
              { value: '98%', label: 'Rider Satisfaction', suffix: '' },
              { value: '4', label: 'Major Cities', suffix: '' },
              { value: 'R12M+', label: 'Earned by Riders', suffix: '' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl sm:text-4xl font-bold text-white counter-value mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   PLATFORM LOGOS / TRUST BAR
───────────────────────────────────────────── */
function TrustBar() {
  const platforms = [
    { name: 'Uber Eats', abbr: 'UE' },
    { name: 'Mr D Food', abbr: 'MRD' },
    { name: 'Bolt Food', abbr: 'BF' },
    { name: 'Checkers Sixty60', abbr: 'S60' },
    { name: 'Pargo', abbr: 'PGO' },
    { name: 'Takealot', abbr: 'TKL' },
  ]

  return (
    <section className="bg-[#0a0b14] border-y border-white/6 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold tracking-widest uppercase text-white/30 mb-8">
          Trusted by riders delivering for South Africa&apos;s top platforms
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {platforms.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors duration-300"
            >
              <div className="w-8 h-8 rounded-lg bg-white/6 flex items-center justify-center text-xs font-bold">
                {p.abbr}
              </div>
              <span className="text-sm font-medium hidden sm:block">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   CORE SOLUTIONS
───────────────────────────────────────────── */
function CoreSolutions() {
  const solutions = [
    {
      icon: Bike,
      title: 'Rent-to-Own',
      tagline: 'Own it. Keep it.',
      description:
        'Start riding today with zero deposit. Weekly payments that build toward ownership — your bike, your asset.',
      cta: 'Apply Now',
      href: '/apply',
      accent: 'from-red-500/20 to-red-500/5',
      iconBg: 'bg-red-500/15',
      iconColor: 'text-red-400',
    },
    {
      icon: TrendingUp,
      title: 'Delivery Fleet',
      tagline: 'Scale your operations.',
      description:
        'Fully managed fleets for logistics companies. Real-time tracking, maintenance included, flexible pricing per rider.',
      cta: 'View Fleet Plans',
      href: '/fleet',
      accent: 'from-blue-500/20 to-blue-500/5',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-400',
    },
    {
      icon: Package,
      title: 'Buy Outright',
      tagline: 'Browse. Choose. Ride.',
      description:
        'Purchase verified, serviced bikes from our curated inventory. Finance options available. No surprise fees.',
      cta: 'Browse Inventory',
      href: '/inventory',
      accent: 'from-emerald-500/20 to-emerald-500/5',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
    },
    {
      icon: BarChart3,
      title: 'Sell Your Bike',
      tagline: 'List. Earn. Repeat.',
      description:
        'Turn your idle bike into income. List on Go-Moto, reach thousands of verified buyers and renters instantly.',
      cta: 'List Your Bike',
      href: '/list-your-bike',
      accent: 'from-purple-500/20 to-purple-500/5',
      iconBg: 'bg-purple-500/15',
      iconColor: 'text-purple-400',
    },
  ]

  return (
    <section className="bg-[#07080f] py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-40 pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="badge-pill mb-6 inline-flex">Core Solutions</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Everything you need to{' '}
            <span className="gradient-text-hero">get on the road</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Whether you&apos;re a gig worker, fleet operator, or private buyer — Go-Moto has a solution built for you.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {solutions.map((s) => (
            <div
              key={s.title}
              className="relative hero-glass-card p-6 group neon-border-hover cursor-pointer flex flex-col"
            >
              <div className="card-accent-line" />
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center mb-5`}>
                <s.icon className={`h-6 w-6 ${s.iconColor}`} />
              </div>
              {/* Content */}
              <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-1">{s.tagline}</p>
              <h3 className="font-display text-xl font-bold text-white mb-3">{s.title}</h3>
              <p className="text-sm text-white/55 leading-relaxed flex-1 mb-6">{s.description}</p>
              {/* CTA */}
              <Link
                href={s.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors group-hover:gap-3 duration-200"
              >
                {s.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   HOW IT WORKS / FEATURE HIGHLIGHT
───────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Choose your plan',
      description:
        'Pick rent-to-own, outright purchase, or fleet solutions. Transparent pricing — no hidden fees.',
    },
    {
      number: '02',
      title: 'Apply in minutes',
      description:
        'Complete a quick online application. Our team reviews same-day and contacts you within hours.',
    },
    {
      number: '03',
      title: 'Get your bike',
      description:
        'Pick up your verified, serviced bike or we deliver to you. All maintenance is included.',
    },
    {
      number: '04',
      title: 'Ride & earn',
      description:
        'Start earning immediately on Uber Eats, Mr D, Bolt Food, or any platform you choose.',
    },
  ]

  return (
    <section className="bg-[#0a0b14] py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: content */}
          <div>
            <span className="badge-pill mb-6 inline-flex">How it Works</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              From application to{' '}
              <span className="gradient-text-hero">first delivery</span>
              <br />
              in 24 hours.
            </h2>
            <p className="text-white/55 text-lg mb-10 leading-relaxed">
              Go-Moto removes every barrier between you and earning. No credit checks, no long queues, no paperwork delays.
            </p>
            <Button asChild className="bg-[#E53935] hover:bg-[#C62828] text-white font-semibold px-8 py-6 rounded-xl">
              <Link href="/apply">
                Start Your Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Right: steps */}
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="relative flex gap-5 p-5 hero-glass-card group hover:border-white/15 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#E53935]/15 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#E53935]">{step.number}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{step.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute -bottom-2.5 left-[28px] w-px h-5 bg-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   PLATFORM FEATURES
───────────────────────────────────────────── */
function PlatformFeatures() {
  const features = [
    {
      icon: Shield,
      title: 'Fully Insured Fleet',
      description: 'Every bike comes with comprehensive insurance. Ride with complete peace of mind.',
    },
    {
      icon: Wrench,
      title: 'Included Maintenance',
      description: 'Scheduled services, repairs, and roadside support — all covered in your plan.',
    },
    {
      icon: Zap,
      title: 'Same-Day Approval',
      description: 'Our streamlined process means you can be earning within 24 hours of applying.',
    },
    {
      icon: MapPin,
      title: 'Nationwide Coverage',
      description: 'Serving Johannesburg, Cape Town, Durban, Pretoria, and expanding fast.',
    },
    {
      icon: Users,
      title: 'Rider Community',
      description: 'Join 2,500+ riders. Access group training, tips, and peer support on WhatsApp.',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Our team is always on call. WhatsApp, phone, or walk-in support available.',
    },
  ]

  return (
    <section className="bg-[#07080f] py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] hero-orb blur-3xl opacity-50 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="badge-pill mb-6 inline-flex">Platform Benefits</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Built for riders who{' '}
            <span className="gradient-text-hero">earn for a living</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Every feature is designed to keep you riding, earning, and growing — without the headaches.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="hero-glass-card p-6 neon-border-hover transition-all duration-300 relative">
              <div className="card-accent-line" />
              <div className="w-10 h-10 rounded-xl bg-[#E53935]/12 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-[#E53935]" />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   PRICING TEASER
───────────────────────────────────────────── */
function PricingTeaser() {
  const plans = [
    {
      name: 'Starter',
      price: 'R599',
      period: '/week',
      description: 'Perfect for new delivery riders. Start earning today.',
      features: ['Daily/weekly rental', 'Included maintenance', 'Basic insurance', 'Rider support'],
      cta: 'Get Started',
      href: '/pricing',
      featured: false,
    },
    {
      name: 'Rent-to-Own',
      price: 'R749',
      period: '/week',
      description: 'Build toward ownership. Every payment counts.',
      features: ['Own your bike in 18–24 months', 'Full insurance coverage', 'Priority maintenance', 'Earn-back programme'],
      cta: 'Apply Now',
      href: '/apply',
      featured: true,
    },
    {
      name: 'Fleet',
      price: 'Custom',
      period: 'pricing',
      description: 'Scalable solutions for logistics operators.',
      features: ['10+ bike packages', 'Dedicated fleet manager', 'GPS tracking', 'Volume discounts'],
      cta: 'Contact Us',
      href: '/fleet',
      featured: false,
    },
  ]

  return (
    <section className="bg-[#0a0b14] py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="badge-pill mb-6 inline-flex">Pricing</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple, transparent{' '}
            <span className="gradient-text-hero">pricing</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            No hidden fees. No lock-ins. Pay only for what you use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-7 flex flex-col transition-all duration-300 ${
                plan.featured
                  ? 'bg-[#E53935] text-white glow-red'
                  : 'hero-glass-card neon-border-hover'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-[#E53935] text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className={`font-display text-xl font-bold mb-1 ${plan.featured ? 'text-white' : 'text-white'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.featured ? 'text-white/80' : 'text-white/50'}`}>
                  {plan.description}
                </p>
                <div className="flex items-end gap-1">
                  <span className={`font-display text-4xl font-bold ${plan.featured ? 'text-white' : 'text-white'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm pb-1 ${plan.featured ? 'text-white/70' : 'text-white/40'}`}>
                    {plan.period}
                  </span>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <CheckCircle2
                      className={`h-4 w-4 flex-shrink-0 ${plan.featured ? 'text-white' : 'text-[#E53935]'}`}
                    />
                    <span className={plan.featured ? 'text-white/90' : 'text-white/70'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={
                  plan.featured
                    ? 'bg-white text-[#E53935] hover:bg-white/90 font-semibold w-full rounded-xl py-6'
                    : 'bg-white/8 hover:bg-white/15 text-white border border-white/15 font-semibold w-full rounded-xl py-6'
                }
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-sm mt-8">
          All plans include maintenance, support and insurance.{' '}
          <Link href="/pricing" className="text-[#E53935] hover:text-red-400 underline underline-offset-2">
            View full pricing →
          </Link>
        </p>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   SERVICE & SUPPORT
───────────────────────────────────────────── */
function ServiceSupport() {
  const options = [
    {
      icon: Wrench,
      title: 'Book a Service',
      description: 'Schedule maintenance, repairs or a roadworthy check at one of our service centres.',
      cta: 'Book Now',
      href: '/service',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Support',
      description: 'Chat directly with our team 7 days a week. Quick answers, real humans.',
      cta: 'Chat Now',
      href: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27123456789'}?text=Hi%20Go-Moto`,
    },
    {
      icon: HeadphonesIcon,
      title: 'Rider Helpdesk',
      description: 'Access guides, FAQs, and documentation for everything from applications to bike care.',
      cta: 'View Docs',
      href: '/contact',
    },
  ]

  return (
    <section className="bg-[#07080f] py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-30 pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="badge-pill mb-6 inline-flex">Support</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            We&apos;re here when{' '}
            <span className="gradient-text-hero">you need us</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Go-Moto doesn&apos;t disappear after signup. We&apos;re with you every kilometer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {options.map((opt) => (
            <div key={opt.title} className="hero-glass-card p-7 text-center flex flex-col items-center neon-border-hover transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-[#E53935]/12 flex items-center justify-center mb-5">
                <opt.icon className="h-7 w-7 text-[#E53935]" />
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-2">{opt.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed mb-6 flex-1">{opt.description}</p>
              <Button asChild variant="outline" className="border-white/15 text-white bg-white/5 hover:bg-white/10 rounded-xl w-full">
                <Link href={opt.href}>{opt.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────── */
function Testimonials() {
  const testimonials = [
    {
      quote:
        "I applied on Monday, had my bike by Wednesday, and made my first delivery on Thursday. Go-Moto changed my life.",
      name: 'Sipho M.',
      role: 'Uber Eats Rider — Johannesburg',
      rating: 5,
    },
    {
      quote:
        "As a fleet operator I've tried other platforms but nothing compares. The management tools, the maintenance support — it all just works.",
      name: 'Andre van R.',
      role: 'Fleet Manager — Cape Town',
      rating: 5,
    },
    {
      quote:
        "The rent-to-own programme is incredible. I'm 8 months in and I can already see myself owning this bike outright. No stress.",
      name: 'Thabo K.',
      role: 'Mr D Food Rider — Pretoria',
      rating: 5,
    },
  ]

  return (
    <section className="bg-[#0a0b14] py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="badge-pill mb-6 inline-flex">Testimonials</span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Trusted by riders{' '}
            <span className="gradient-text-hero">across South Africa</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="hero-glass-card p-7 flex flex-col relative neon-border-hover transition-all duration-300">
              <div className="card-accent-line" />
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-white/75 text-base leading-relaxed flex-1 mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E53935]/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#E53935]">
                    {t.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   PLATFORM SHOWCASE / STATS HIGHLIGHT
───────────────────────────────────────────── */
function PlatformShowcase() {
  return (
    <section className="bg-[#07080f] py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] hero-orb-blue blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] hero-orb blur-3xl opacity-40 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-pill mb-6 inline-flex">Platform</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              The smartest way to manage{' '}
              <span className="gradient-text-hero">your fleet</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Go-Moto&apos;s platform gives fleet managers real-time visibility, maintenance tracking, and payment processing in one dashboard.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { icon: BarChart3, label: 'Real-time Analytics' },
              { icon: MapPin, label: 'GPS Tracking' },
              { icon: Wrench, label: 'Maintenance Alerts' },
              { icon: BadgeCheck, label: 'Compliance Tools' },
            ].map((item) => (
              <div key={item.label} className="hero-glass-card p-5 text-center flex flex-col items-center gap-3 neon-border-hover transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-white/60" />
                </div>
                <span className="text-xs font-medium text-white/60">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Platform CTA */}
          <div className="hero-glass-card p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E53935]/50 to-transparent" />
            <div className="absolute bottom-0 right-0 w-64 h-64 hero-orb blur-3xl opacity-30 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-display text-2xl font-bold text-white mb-2">
                  Managing a fleet of 10+ bikes?
                </h3>
                <p className="text-white/50 text-sm">
                  Get a custom demo and see how Go-Moto can cut your operational costs by up to 30%.
                </p>
              </div>
              <Button asChild className="bg-[#E53935] hover:bg-[#C62828] text-white font-semibold px-8 py-6 rounded-xl whitespace-nowrap flex-shrink-0">
                <Link href="/fleet">
                  Request a Demo
                  <Play className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   FINAL CTA
───────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="bg-[#07080f] py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] hero-orb blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to{' '}
            <span className="gradient-text-hero">start earning?</span>
          </h2>
          <p className="text-white/55 text-xl mb-10 leading-relaxed">
            Join thousands of riders who&apos;ve taken control of their income with Go-Moto. Apply in under 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-[#E53935] hover:bg-[#C62828] text-white font-bold text-lg px-10 py-7 rounded-xl glow-red-sm hover:glow-red transition-all duration-300 hover:scale-105"
            >
              <Link href="/apply">
                Apply Now — Free &amp; Fast
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 text-white bg-white/5 hover:bg-white/10 text-lg font-semibold px-10 py-7 rounded-xl"
            >
              <Link href="/contact">Talk to a Specialist</Link>
            </Button>
          </div>

          {/* Bottom trust */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/35 text-sm">
            {['No credit checks', 'Same-day response', 'Cancel anytime', 'POPIA compliant'].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#E53935]/70" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   PAGE EXPORT
───────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <CoreSolutions />
      <HowItWorks />
      <PlatformFeatures />
      <PricingTeaser />
      <ServiceSupport />
      <PlatformShowcase />
      <Testimonials />
      <FinalCTA />
    </>
  )
}
