# Go-Moto - Premium Bike Rental & Sales Platform

> The Operating System for Bike Ownership & Earning

Go-Moto is a full-stack web application built for the South African market, providing bike rental, rent-to-own, and sales services. Designed specifically for gig economy riders, commuters, and businesses.

Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Email**: Resend
- **Forms**: React Hook Form + Zod

Features

### Public Features
- Browse bike inventory with filters
- Responsive design (mobile-first)
- Earnings calculator for gig riders
- Multi-step application form
- Service booking system
- Sell/trade your bike
- Fleet solutions for businesses

### User Features
- User authentication (email/password)
- Save favorite bikes
- Track applications
- Profile management

### Admin Features
- Dashboard with stats
- Listing management (CRUD)
- Application review & approval
- Service booking management
- Sell/trade request handling
- Lead management
- Site settings

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/go-moto.git
cd go-moto
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend (Email)
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabase Setup

1. Create a new Supabase project
2. Run the SQL migrations in `supabase/migrations/` folder
3. Enable Row Level Security on all tables
4. Create storage buckets:
   - `listing-images` (public)
   - `documents` (private)

### 5. Seed the Database

```bash
npx tsx scripts/seed.ts
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth pages (login, register)
│   ├── account/          # User dashboard
│   ├── admin/            # Admin dashboard
│   ├── api/              # API routes
│   ├── apply/            # Application flow
│   ├── fleet/            # Fleet solutions
│   ├── inventory/        # Bike listings
│   ├── plans/            # Pricing plans
│   ├── sell/             # Sell/trade
│   ├── service/          # Service booking
│   └── page.tsx          # Homepage
├── components/
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   ├── listings/         # Listing components
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── actions.ts        # Server actions
│   ├── email.ts          # Email service
│   └── utils.ts          # Utilities
└── types/
    └── database.ts       # Database types
```

## 🗄️ Database Schema

### Main Tables
- `profiles` - User profiles
- `listings` - Bike listings
- `listing_images` - Listing photos
- `applications` - Rental applications
- `favorites` - User saved bikes
- `service_bookings` - Service appointments
- `sell_requests` - Sell/trade submissions
- `leads` - Contact form & fleet inquiries
- `testimonials` - Customer reviews
- `faqs` - FAQ content
- `site_settings` - Site configuration

### Row Level Security
All tables have RLS enabled with appropriate policies for:
- Public read access (listings, testimonials, FAQs)
- Authenticated user access (own data)
- Admin full access

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

```bash
npm run build
```

### Other Platforms

The app can be deployed to any platform supporting Node.js 18+:
- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify

## Email Templates

The app sends emails for:
- Application confirmation
- Application status updates
- Service booking confirmation
- Contact form responses
- Fleet inquiry responses

Configure your Resend domain for production.

## Security

- All database access uses Row Level Security
- Authentication via Supabase Auth (JWT)
- CSRF protection via Next.js
- Input validation with Zod
- File upload size limits (10MB)

## PWA Support

The app includes basic PWA support:
- Web manifest
- Service worker ready
- Mobile-optimized design

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## License

MIT License - see LICENSE file

## Support

- Email: support@gomoto.co.za
- WhatsApp: +27 82 123 4567

---

Built with ❤️ for South African riders
