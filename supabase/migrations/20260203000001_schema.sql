-- Go-Moto Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- LISTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('scooter', 'motorcycle', 'electric')),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  engine_cc INTEGER NOT NULL,
  mileage INTEGER,
  condition TEXT NOT NULL CHECK (condition IN ('new', 'excellent', 'good', 'fair')),
  price_cash INTEGER NOT NULL,
  price_weekly INTEGER NOT NULL,
  price_monthly INTEGER NOT NULL,
  deposit INTEGER NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'reserved', 'sold')),
  rider_tags TEXT[],
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  specs JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_featured ON listings(featured);
CREATE INDEX idx_listings_type ON listings(type);
CREATE INDEX idx_listings_brand ON listings(brand);
CREATE INDEX idx_listings_price_weekly ON listings(price_weekly);

-- =====================================================
-- LISTING IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);

-- =====================================================
-- FAVORITES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

-- =====================================================
-- APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  platform TEXT,
  income_range TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro', 'fleet')),
  preferred_listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'in_review', 'docs_required', 'approved', 
    'declined', 'scheduled_pickup', 'active', 'closed'
  )),
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_email ON applications(email);

-- =====================================================
-- APPLICATION DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS application_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_application_documents_application_id ON application_documents(application_id);

-- =====================================================
-- APPLICATION EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS application_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_application_events_application_id ON application_events(application_id);

-- =====================================================
-- LEADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('viewing', 'contact', 'callback')),
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_type ON leads(type);
CREATE INDEX idx_leads_listing_id ON leads(listing_id);

-- =====================================================
-- SELL REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sell_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  expected_price INTEGER,
  details JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'quoted', 'accepted', 'declined', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sell_requests_status ON sell_requests(status);

-- =====================================================
-- SELL REQUEST IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sell_request_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sell_request_id UUID NOT NULL REFERENCES sell_requests(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sell_request_images_sell_request_id ON sell_request_images(sell_request_id);

-- =====================================================
-- SERVICE BOOKINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN (
    'minor_service', 'major_service', 'tyres', 'repairs', 'inspection'
  )),
  preferred_date DATE NOT NULL,
  location TEXT NOT NULL,
  pickup BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_service_bookings_status ON service_bookings(status);
CREATE INDEX idx_service_bookings_user_id ON service_bookings(user_id);
CREATE INDEX idx_service_bookings_preferred_date ON service_bookings(preferred_date);

-- =====================================================
-- FLEET LEADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS fleet_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  fleet_size INTEGER NOT NULL,
  locations TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'meeting_scheduled', 'proposal_sent', 'won', 'lost')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fleet_leads_status ON fleet_leads(status);

-- =====================================================
-- CMS CONTENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cms_content (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
