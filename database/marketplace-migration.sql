-- =============================================
-- GO-MOTO MARKETPLACE MIGRATION
-- Converts from dealer inventory to paid listings marketplace
-- =============================================

-- 1. LISTING PLANS TABLE
-- Stores configurable subscription plans for sellers
CREATE TABLE IF NOT EXISTS listing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  monthly_price INTEGER NOT NULL, -- in cents (e.g., 19900 = R199.00)
  max_active_listings INTEGER NOT NULL DEFAULT 1,
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  stripe_price_id TEXT, -- Stripe Price ID for this plan
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default listing plans
INSERT INTO listing_plans (slug, name, description, monthly_price, max_active_listings, features, display_order) VALUES
  ('basic', 'Basic', 'Perfect for selling a single bike', 14900, 1, 
   ARRAY['1 active listing', 'Standard placement', 'Email lead notifications', '30-day visibility'], 1),
  ('pro', 'Pro', 'For regular sellers with multiple bikes', 29900, 3, 
   ARRAY['3 active listings', 'Priority placement', 'Email & SMS lead notifications', 'Seller analytics', 'Featured badge'], 2),
  ('featured', 'Featured', 'Maximum exposure for serious sellers', 49900, 5, 
   ARRAY['5 active listings', 'Homepage featured section', 'Top search placement', 'Verified seller badge', 'Priority support', 'Full analytics dashboard'], 3)
ON CONFLICT (slug) DO NOTHING;

-- 2. UPDATE PROFILES TABLE
-- Add seller-related fields
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS verified_seller BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS seller_bio TEXT,
  ADD COLUMN IF NOT EXISTS seller_location TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS show_phone_on_listings BOOLEAN DEFAULT false;

-- 3. SUBSCRIPTIONS TABLE
-- Tracks seller subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES listing_plans(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, past_due, canceled, unpaid
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- One active subscription per user
);

-- 4. UPDATE LISTINGS TABLE
-- Add ownership and marketplace fields
DO $$ 
BEGIN
  -- Add owner_id if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'owner_id') THEN
    ALTER TABLE listings ADD COLUMN owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
  
  -- Add status enum-like field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'listing_status') THEN
    ALTER TABLE listings ADD COLUMN listing_status TEXT DEFAULT 'draft' 
      CHECK (listing_status IN ('draft', 'pending_review', 'published', 'paused', 'rejected', 'sold'));
  END IF;
  
  -- Add rejection reason
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'rejection_reason') THEN
    ALTER TABLE listings ADD COLUMN rejection_reason TEXT;
  END IF;
  
  -- Add boost score for sorting
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'boost_score') THEN
    ALTER TABLE listings ADD COLUMN boost_score INTEGER DEFAULT 0;
  END IF;
  
  -- Add published_at timestamp
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'published_at') THEN
    ALTER TABLE listings ADD COLUMN published_at TIMESTAMPTZ;
  END IF;
  
  -- Add expires_at for listing expiration
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'expires_at') THEN
    ALTER TABLE listings ADD COLUMN expires_at TIMESTAMPTZ;
  END IF;
END $$;

-- 5. LISTING METRICS TABLE
-- Tracks performance stats for seller dashboard
CREATE TABLE IF NOT EXISTS listing_metrics (
  listing_id UUID PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  whatsapp_clicks INTEGER DEFAULT 0,
  phone_clicks INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LEADS/INQUIRIES TABLE
-- Store buyer inquiries on listings
CREATE TABLE IF NOT EXISTS listing_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- The seller who owns the listing
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LISTING EVENTS TABLE
-- For tracking user interactions (views, clicks)
CREATE TABLE IF NOT EXISTS listing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'whatsapp_click', 'phone_click', 'favorite', 'inquiry')),
  visitor_id TEXT, -- Anonymous visitor tracking
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_listing_events_listing_id ON listing_events(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_events_created_at ON listing_events(created_at);

-- 8. FUNCTION: Increment listing metrics
CREATE OR REPLACE FUNCTION increment_listing_metric(
  p_listing_id UUID,
  p_metric TEXT,
  p_amount INTEGER DEFAULT 1
) RETURNS void AS $$
BEGIN
  INSERT INTO listing_metrics (listing_id, views, leads, whatsapp_clicks, phone_clicks, favorites)
  VALUES (p_listing_id, 0, 0, 0, 0, 0)
  ON CONFLICT (listing_id) DO NOTHING;
  
  EXECUTE format('UPDATE listing_metrics SET %I = %I + $1, updated_at = NOW() WHERE listing_id = $2', p_metric, p_metric)
  USING p_amount, p_listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. FUNCTION: Check if seller can publish
CREATE OR REPLACE FUNCTION can_seller_publish(p_user_id UUID) RETURNS JSONB AS $$
DECLARE
  v_subscription RECORD;
  v_plan RECORD;
  v_active_count INTEGER;
BEGIN
  -- Get active subscription
  SELECT * INTO v_subscription 
  FROM subscriptions 
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;
  
  IF v_subscription IS NULL THEN
    RETURN jsonb_build_object('can_publish', false, 'reason', 'No active subscription');
  END IF;
  
  -- Get plan details
  SELECT * INTO v_plan FROM listing_plans WHERE id = v_subscription.plan_id;
  
  -- Count active listings
  SELECT COUNT(*) INTO v_active_count
  FROM listings
  WHERE owner_id = p_user_id AND listing_status IN ('published', 'pending_review');
  
  IF v_active_count >= v_plan.max_active_listings THEN
    RETURN jsonb_build_object(
      'can_publish', false, 
      'reason', format('Listing limit reached (%s/%s)', v_active_count, v_plan.max_active_listings),
      'current_count', v_active_count,
      'max_count', v_plan.max_active_listings
    );
  END IF;
  
  RETURN jsonb_build_object(
    'can_publish', true,
    'current_count', v_active_count,
    'max_count', v_plan.max_active_listings,
    'remaining', v_plan.max_active_listings - v_active_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. FUNCTION: Pause listings when subscription lapses
CREATE OR REPLACE FUNCTION pause_seller_listings(p_user_id UUID) RETURNS void AS $$
BEGIN
  UPDATE listings 
  SET listing_status = 'paused', updated_at = NOW()
  WHERE owner_id = p_user_id AND listing_status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. FUNCTION: Unpause listings when subscription resumes
CREATE OR REPLACE FUNCTION unpause_seller_listings(p_user_id UUID) RETURNS void AS $$
DECLARE
  v_plan RECORD;
  v_subscription RECORD;
BEGIN
  SELECT s.*, lp.max_active_listings 
  INTO v_subscription
  FROM subscriptions s
  JOIN listing_plans lp ON lp.id = s.plan_id
  WHERE s.user_id = p_user_id AND s.status = 'active';
  
  IF v_subscription IS NOT NULL THEN
    -- Unpause up to max_active_listings
    UPDATE listings 
    SET listing_status = 'published', updated_at = NOW()
    WHERE id IN (
      SELECT id FROM listings 
      WHERE owner_id = p_user_id AND listing_status = 'paused'
      ORDER BY updated_at DESC
      LIMIT v_subscription.max_active_listings
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on new tables
ALTER TABLE listing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_events ENABLE ROW LEVEL SECURITY;

-- LISTING PLANS: Public read
CREATE POLICY "Anyone can view active listing plans" ON listing_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage listing plans" ON listing_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- SUBSCRIPTIONS: User can view own, admin can view all
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions" ON subscriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Service role can manage subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- LISTINGS: Update policies for marketplace
DROP POLICY IF EXISTS "Public can view available listings" ON listings;
DROP POLICY IF EXISTS "Admins can manage all listings" ON listings;
DROP POLICY IF EXISTS "Anyone can view listings" ON listings;

CREATE POLICY "Public can view published listings" ON listings
  FOR SELECT USING (listing_status = 'published');

CREATE POLICY "Owners can view their own listings" ON listings
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Owners can create listings" ON listings
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their own listings" ON listings
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete draft listings" ON listings
  FOR DELETE USING (owner_id = auth.uid() AND listing_status = 'draft');

CREATE POLICY "Admins can manage all listings" ON listings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- LISTING METRICS: Owner and admin can view
CREATE POLICY "Owners can view their listing metrics" ON listing_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND owner_id = auth.uid())
  );

CREATE POLICY "Admins can view all metrics" ON listing_metrics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow increment function to update metrics
CREATE POLICY "Allow metric increments" ON listing_metrics
  FOR ALL USING (true);

-- LISTING INQUIRIES: Public can create, owners can view their own
CREATE POLICY "Anyone can create inquiry" ON listing_inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can view inquiries on their listings" ON listing_inquiries
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Owners can update inquiry status" ON listing_inquiries
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Admins can manage all inquiries" ON listing_inquiries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- LISTING EVENTS: Allow inserts for tracking
CREATE POLICY "Anyone can log events" ON listing_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can view their listing events" ON listing_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND owner_id = auth.uid())
  );

CREATE POLICY "Admins can view all events" ON listing_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Create listing-images bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for listing images
CREATE POLICY "Anyone can view listing images" ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload listing images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listing-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own listing images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'listing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own listing images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'listing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(listing_status);
CREATE INDEX IF NOT EXISTS idx_listings_published ON listings(listing_status, published_at DESC) WHERE listing_status = 'published';
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(featured, boost_score DESC) WHERE listing_status = 'published' AND featured = true;
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_owner ON listing_inquiries(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_listing ON listing_inquiries(listing_id);
