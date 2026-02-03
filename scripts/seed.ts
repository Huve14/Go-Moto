// Go-Moto Database Seed Script
// Run with: npx tsx scripts/seed.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for seeding

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Sample listings data
const listings = [
  {
    title: '2024 Honda PCX 125',
    slug: '2024-honda-pcx-125',
    brand: 'Honda',
    model: 'PCX 125',
    year: 2024,
    category: 'scooter',
    engine_size: 125,
    transmission: 'automatic',
    fuel_type: 'petrol',
    mileage: 0,
    color: 'Pearl White',
    condition: 'new',
    description: 'The Honda PCX 125 is the ultimate urban commuter scooter. Featuring Honda\'s renowned reliability, excellent fuel economy of up to 45km/l, and a comfortable riding position. Perfect for delivery riders and daily commuters. Includes ABS, LED lighting, and smart key system.',
    price_weekly: 650,
    price_monthly: 2400,
    price_rent_to_own: 3200,
    price_cash: 55000,
    location: 'johannesburg',
    top_speed: 105,
    fuel_economy: 45,
    seat_height: 764,
    weight: 130,
    status: 'published',
    featured: true,
    features: ['ABS', 'LED Lighting', 'Smart Key', 'Under-seat Storage', 'USB Charging'],
  },
  {
    title: '2023 Yamaha NMAX 155',
    slug: '2023-yamaha-nmax-155',
    brand: 'Yamaha',
    model: 'NMAX 155',
    year: 2023,
    category: 'scooter',
    engine_size: 155,
    transmission: 'automatic',
    fuel_type: 'petrol',
    mileage: 2500,
    color: 'Matte Black',
    condition: 'excellent',
    description: 'The Yamaha NMAX 155 combines sporty styling with practical commuting features. VVA engine technology delivers smooth power across the rev range. Features include ABS, traction control, and Yamaha\'s connected app for smartphone integration.',
    price_weekly: 700,
    price_monthly: 2600,
    price_rent_to_own: 3400,
    price_cash: 58000,
    location: 'johannesburg',
    top_speed: 115,
    fuel_economy: 40,
    seat_height: 765,
    weight: 131,
    status: 'published',
    featured: true,
    features: ['ABS', 'Traction Control', 'VVA Engine', 'Smartphone App', 'Digital Display'],
  },
  {
    title: '2024 Suzuki Burgman Street 125',
    slug: '2024-suzuki-burgman-street-125',
    brand: 'Suzuki',
    model: 'Burgman Street 125',
    year: 2024,
    category: 'scooter',
    engine_size: 125,
    transmission: 'automatic',
    fuel_type: 'petrol',
    mileage: 500,
    color: 'Metallic Blue',
    condition: 'excellent',
    description: 'The Suzuki Burgman Street 125 offers premium maxi-scooter styling in a compact package. Features a comfortable flat floor, large under-seat storage, and Suzuki\'s fuel-efficient engine. Ideal for both city commuting and weekend rides.',
    price_weekly: 600,
    price_monthly: 2200,
    price_rent_to_own: 2900,
    price_cash: 48000,
    location: 'pretoria',
    top_speed: 100,
    fuel_economy: 50,
    seat_height: 780,
    weight: 110,
    status: 'published',
    featured: false,
    features: ['LED Headlight', 'Digital Console', 'USB Charger', 'Large Storage', 'Alloy Wheels'],
  },
  {
    title: '2023 Bajaj Pulsar NS200',
    slug: '2023-bajaj-pulsar-ns200',
    brand: 'Bajaj',
    model: 'Pulsar NS200',
    year: 2023,
    category: 'sport',
    engine_size: 200,
    transmission: 'manual',
    fuel_type: 'petrol',
    mileage: 8000,
    color: 'Racing Red',
    condition: 'good',
    description: 'The Bajaj Pulsar NS200 is a sporty naked bike with aggressive styling and strong performance. Liquid-cooled engine, perimeter frame, and monoshock suspension provide excellent handling. Great for riders wanting more power.',
    price_weekly: 750,
    price_monthly: 2800,
    price_rent_to_own: 3600,
    price_cash: 45000,
    location: 'johannesburg',
    top_speed: 136,
    fuel_economy: 35,
    seat_height: 805,
    weight: 156,
    status: 'published',
    featured: false,
    features: ['Liquid Cooled', 'Perimeter Frame', 'ABS', 'Digital Console', 'Projector Headlight'],
  },
  {
    title: '2024 NIU NQi GTS Pro',
    slug: '2024-niu-nqi-gts-pro',
    brand: 'NIU',
    model: 'NQi GTS Pro',
    year: 2024,
    category: 'electric',
    engine_size: 0,
    transmission: 'automatic',
    fuel_type: 'electric',
    mileage: 0,
    color: 'White/Blue',
    condition: 'new',
    description: 'The NIU NQi GTS Pro is a premium electric scooter with dual battery system for extended range up to 150km. Features regenerative braking, smartphone connectivity, GPS tracking, and fast charging. Zero emissions, low running costs.',
    price_weekly: 800,
    price_monthly: 3000,
    price_rent_to_own: 4000,
    price_cash: 85000,
    location: 'cape-town',
    top_speed: 70,
    fuel_economy: 0,
    seat_height: 770,
    weight: 95,
    status: 'published',
    featured: true,
    features: ['Dual Battery', 'Regenerative Braking', 'GPS Tracking', 'App Connected', 'Fast Charging'],
  },
  {
    title: '2023 Honda CB300R',
    slug: '2023-honda-cb300r',
    brand: 'Honda',
    model: 'CB300R',
    year: 2023,
    category: 'sport',
    engine_size: 286,
    transmission: 'manual',
    fuel_type: 'petrol',
    mileage: 5000,
    color: 'Candy Red',
    condition: 'excellent',
    description: 'The Honda CB300R is a neo-sports café racer with aggressive styling and agile handling. DOHC single-cylinder engine delivers smooth power, while IMU-based ABS provides confident braking. Perfect for urban riding with style.',
    price_weekly: 900,
    price_monthly: 3400,
    price_rent_to_own: 4500,
    price_cash: 95000,
    location: 'johannesburg',
    top_speed: 140,
    fuel_economy: 30,
    seat_height: 799,
    weight: 143,
    status: 'published',
    featured: true,
    features: ['IMU ABS', 'LED Lighting', 'Inverted Forks', 'Digital Display', 'Slipper Clutch'],
  },
  {
    title: '2024 TVS Apache RTR 160',
    slug: '2024-tvs-apache-rtr-160',
    brand: 'TVS',
    model: 'Apache RTR 160',
    year: 2024,
    category: 'commuter',
    engine_size: 160,
    transmission: 'manual',
    fuel_type: 'petrol',
    mileage: 1000,
    color: 'Racing Blue',
    condition: 'excellent',
    description: 'The TVS Apache RTR 160 offers race-bred performance in an affordable package. Features TVS Race Tuned fuel injection, super-moto ABS, and race-derived chassis geometry. Great value for performance-minded riders.',
    price_weekly: 550,
    price_monthly: 2000,
    price_rent_to_own: 2600,
    price_cash: 38000,
    location: 'durban',
    top_speed: 114,
    fuel_economy: 45,
    seat_height: 800,
    weight: 140,
    status: 'published',
    featured: false,
    features: ['Race Tuned FI', 'Super-Moto ABS', 'LED DRL', 'Digital Console', 'Petal Disc'],
  },
  {
    title: '2023 Vespa Primavera 150',
    slug: '2023-vespa-primavera-150',
    brand: 'Vespa',
    model: 'Primavera 150',
    year: 2023,
    category: 'scooter',
    engine_size: 150,
    transmission: 'automatic',
    fuel_type: 'petrol',
    mileage: 3000,
    color: 'Verde Relax',
    condition: 'excellent',
    description: 'The Vespa Primavera 150 is an icon of Italian design and style. Features a monocoque steel body, refined engine, and classic aesthetics with modern technology. Turn heads while enjoying a premium riding experience.',
    price_weekly: 850,
    price_monthly: 3200,
    price_rent_to_own: 4200,
    price_cash: 115000,
    location: 'johannesburg',
    top_speed: 95,
    fuel_economy: 40,
    seat_height: 790,
    weight: 130,
    status: 'published',
    featured: true,
    features: ['Steel Body', 'ABS', 'Full LED', 'Bluetooth', 'Chrome Details'],
  },
  {
    title: '2024 Hero Splendor Plus',
    slug: '2024-hero-splendor-plus',
    brand: 'Hero',
    model: 'Splendor Plus',
    year: 2024,
    category: 'commuter',
    engine_size: 100,
    transmission: 'manual',
    fuel_type: 'petrol',
    mileage: 0,
    color: 'Black/Silver',
    condition: 'new',
    description: 'The Hero Splendor Plus is India\'s most trusted commuter motorcycle. Known for its unmatched fuel efficiency of up to 70km/l and bulletproof reliability. Low maintenance costs make it perfect for budget-conscious riders.',
    price_weekly: 400,
    price_monthly: 1500,
    price_rent_to_own: 1900,
    price_cash: 28000,
    location: 'pretoria',
    top_speed: 85,
    fuel_economy: 70,
    seat_height: 785,
    weight: 112,
    status: 'published',
    featured: false,
    features: ['i3S Start/Stop', 'Integrated Braking', 'Tubeless Tyres', 'Service Indicator', 'Side Stand Indicator'],
  },
  {
    title: '2023 SYM Jet 14 125',
    slug: '2023-sym-jet-14-125',
    brand: 'Sym',
    model: 'Jet 14 125',
    year: 2023,
    category: 'scooter',
    engine_size: 125,
    transmission: 'automatic',
    fuel_type: 'petrol',
    mileage: 6000,
    color: 'Gloss Black',
    condition: 'good',
    description: 'The SYM Jet 14 125 is a practical urban scooter with sporty styling. Features 14-inch wheels for improved stability, generous storage, and fuel-efficient engine. Reliable Taiwanese engineering at an affordable price.',
    price_weekly: 500,
    price_monthly: 1800,
    price_rent_to_own: 2400,
    price_cash: 35000,
    location: 'johannesburg',
    top_speed: 95,
    fuel_economy: 48,
    seat_height: 760,
    weight: 118,
    status: 'published',
    featured: false,
    features: ['14-inch Wheels', 'LED Position Light', 'Large Footboard', 'Front Pocket', 'Alloy Wheels'],
  },
]

// Sample testimonials
const testimonials = [
  {
    name: 'Thabo Molefe',
    role: 'Mr D Food Courier',
    content: 'Go-Moto changed my life! I was struggling with taxi fares and now I own my own scooter. I make 3x what I used to make and the weekly payments are easy to manage.',
    rating: 5,
    location: 'Johannesburg',
    image_url: null,
  },
  {
    name: 'Naledi Sithole',
    role: 'Uber Eats Driver',
    content: 'The rent-to-own plan was perfect for me. No credit checks, no stress. After 12 months, the PCX is all mine. Best decision I ever made!',
    rating: 5,
    location: 'Pretoria',
    image_url: null,
  },
  {
    name: 'Michael van der Berg',
    role: 'Small Business Owner',
    content: 'We rent 5 bikes from Go-Moto for our delivery service. Great bikes, fair prices, and their service team is always helpful. Highly recommend for businesses.',
    rating: 5,
    location: 'Cape Town',
    image_url: null,
  },
  {
    name: 'Sipho Dlamini',
    role: 'Bolt Driver',
    content: 'I was worried about maintenance costs but Go-Moto includes everything in the rental. No surprises, just ride and earn. The support team is also excellent.',
    rating: 4,
    location: 'Durban',
    image_url: null,
  },
]

// Sample FAQs
const faqs = [
  {
    question: 'Do I need a driver\'s license to rent a bike?',
    answer: 'Yes, you need a valid South African driver\'s license with the appropriate code for the motorcycle you want to rent. For scooters under 125cc, a Code A1 is sufficient. For larger bikes, you\'ll need a Code A.',
    category: 'requirements',
    position: 1,
  },
  {
    question: 'What documents do I need to apply?',
    answer: 'You\'ll need your South African ID, valid driver\'s license, proof of residence (not older than 3 months), and proof of income. For rent-to-own plans, we may also require bank statements.',
    category: 'requirements',
    position: 2,
  },
  {
    question: 'Is insurance included in the rental?',
    answer: 'Yes! All our rental plans include comprehensive insurance covering theft, accident damage, and third-party liability. There\'s a small excess fee that applies in case of a claim.',
    category: 'pricing',
    position: 3,
  },
  {
    question: 'What happens if the bike breaks down?',
    answer: 'We provide 24/7 roadside assistance for all our rental customers. Simply call our support line and we\'ll send a technician or arrange a replacement bike within hours.',
    category: 'support',
    position: 4,
  },
  {
    question: 'Can I buy the bike at the end of my rental?',
    answer: 'Absolutely! With our rent-to-own plans, you automatically own the bike after completing all payments. For standard rentals, you can also choose to purchase at any time at a fair market price.',
    category: 'ownership',
    position: 5,
  },
  {
    question: 'How long does approval take?',
    answer: 'Most applications are processed within 24-48 hours. Once approved, you can collect your bike immediately from any of our locations. Same-day collection is often possible!',
    category: 'process',
    position: 6,
  },
  {
    question: 'What if I miss a payment?',
    answer: 'We understand that life happens. Contact us immediately if you\'re facing difficulties. We offer flexible solutions including payment holidays and restructuring. However, continuous missed payments may result in the bike being collected.',
    category: 'payments',
    position: 7,
  },
  {
    question: 'Can I use the bike for delivery apps?',
    answer: 'Yes! Our bikes are perfect for delivery work with Uber Eats, Mr D, Bolt Food, and other platforms. We even offer special packages for gig economy riders with extra support.',
    category: 'usage',
    position: 8,
  },
]

// Site settings
const siteSettings = {
  site_name: 'Go-Moto',
  site_description: 'The Operating System for Bike Ownership & Earning',
  contact_email: 'hello@gomoto.co.za',
  contact_phone: '+27 11 123 4567',
  contact_whatsapp: '+27 82 123 4567',
  address: '123 Main Street, Sandton',
  city: 'Johannesburg',
  operating_hours: 'Mon-Fri: 8am-5pm, Sat: 9am-1pm',
  facebook_url: 'https://facebook.com/gomotosa',
  instagram_url: 'https://instagram.com/gomotosa',
  twitter_url: 'https://twitter.com/gomotosa',
  tiktok_url: 'https://tiktok.com/@gomotosa',
  meta_title: 'Go-Moto | Premium Bike Rental & Sales in South Africa',
  meta_description: 'Rent or buy quality motorcycles and scooters for gig economy work, personal use, or fleet operations. Flexible plans, full support, and competitive pricing.',
}

async function seed() {
  console.log('🌱 Starting database seed...\n')

  // Seed listings
  console.log('📋 Seeding listings...')
  for (const listing of listings) {
    const { data, error } = await supabase
      .from('listings')
      .upsert([listing], { onConflict: 'slug' })
      .select()

    if (error) {
      console.error(`  ❌ Error seeding ${listing.title}:`, error.message)
    } else {
      console.log(`  ✅ ${listing.title}`)
    }
  }

  // Seed testimonials
  console.log('\n💬 Seeding testimonials...')
  for (const testimonial of testimonials) {
    const { error } = await supabase
      .from('testimonials')
      .insert([testimonial])

    if (error && !error.message.includes('duplicate')) {
      console.error(`  ❌ Error seeding testimonial from ${testimonial.name}:`, error.message)
    } else {
      console.log(`  ✅ ${testimonial.name}`)
    }
  }

  // Seed FAQs
  console.log('\n❓ Seeding FAQs...')
  for (const faq of faqs) {
    const { error } = await supabase
      .from('faqs')
      .insert([faq])

    if (error && !error.message.includes('duplicate')) {
      console.error(`  ❌ Error seeding FAQ:`, error.message)
    } else {
      console.log(`  ✅ ${faq.question.substring(0, 50)}...`)
    }
  }

  // Seed site settings
  console.log('\n⚙️ Seeding site settings...')
  const { error: settingsError } = await supabase
    .from('site_settings')
    .upsert([siteSettings])

  if (settingsError) {
    console.error('  ❌ Error seeding settings:', settingsError.message)
  } else {
    console.log('  ✅ Site settings created')
  }

  console.log('\n✨ Seed completed!')
}

// Run seed
seed().catch(console.error)
