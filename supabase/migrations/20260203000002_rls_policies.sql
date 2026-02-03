-- Go-Moto Row Level Security Policies
-- Run this after the schema migration

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sell_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sell_request_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: Check if user is admin
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'user'); -- Users cannot change their role

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

-- =====================================================
-- LISTINGS POLICIES
-- =====================================================
-- Public can read published listings
CREATE POLICY "Public can read published listings"
  ON listings FOR SELECT
  USING (status = 'published');

-- Admins can read all listings
CREATE POLICY "Admins can read all listings"
  ON listings FOR SELECT
  USING (is_admin());

-- Admins can insert listings
CREATE POLICY "Admins can insert listings"
  ON listings FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update listings
CREATE POLICY "Admins can update listings"
  ON listings FOR UPDATE
  USING (is_admin());

-- Admins can delete listings
CREATE POLICY "Admins can delete listings"
  ON listings FOR DELETE
  USING (is_admin());

-- =====================================================
-- LISTING IMAGES POLICIES
-- =====================================================
-- Public can read images for published listings
CREATE POLICY "Public can read listing images"
  ON listing_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = listing_images.listing_id 
      AND (listings.status = 'published' OR is_admin())
    )
  );

-- Admins can insert listing images
CREATE POLICY "Admins can insert listing images"
  ON listing_images FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update listing images
CREATE POLICY "Admins can update listing images"
  ON listing_images FOR UPDATE
  USING (is_admin());

-- Admins can delete listing images
CREATE POLICY "Admins can delete listing images"
  ON listing_images FOR DELETE
  USING (is_admin());

-- =====================================================
-- FAVORITES POLICIES
-- =====================================================
-- Users can read their own favorites
CREATE POLICY "Users can read own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can read all favorites
CREATE POLICY "Admins can read all favorites"
  ON favorites FOR SELECT
  USING (is_admin());

-- =====================================================
-- APPLICATIONS POLICIES
-- =====================================================
-- Public can create applications
CREATE POLICY "Public can create applications"
  ON applications FOR INSERT
  WITH CHECK (true);

-- Users can read their own applications (by user_id or email match)
CREATE POLICY "Users can read own applications"
  ON applications FOR SELECT
  USING (
    auth.uid() = user_id OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Admins can read all applications
CREATE POLICY "Admins can read all applications"
  ON applications FOR SELECT
  USING (is_admin());

-- Admins can update applications
CREATE POLICY "Admins can update applications"
  ON applications FOR UPDATE
  USING (is_admin());

-- Admins can delete applications
CREATE POLICY "Admins can delete applications"
  ON applications FOR DELETE
  USING (is_admin());

-- =====================================================
-- APPLICATION DOCUMENTS POLICIES
-- =====================================================
-- Public can insert application documents
CREATE POLICY "Public can insert application documents"
  ON application_documents FOR INSERT
  WITH CHECK (true);

-- Users can read their own application documents
CREATE POLICY "Users can read own application documents"
  ON application_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = application_documents.application_id
      AND (
        applications.user_id = auth.uid() OR
        applications.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

-- Admins can read all application documents
CREATE POLICY "Admins can read all application documents"
  ON application_documents FOR SELECT
  USING (is_admin());

-- Admins can delete application documents
CREATE POLICY "Admins can delete application documents"
  ON application_documents FOR DELETE
  USING (is_admin());

-- =====================================================
-- APPLICATION EVENTS POLICIES
-- =====================================================
-- Users can read events for their own applications
CREATE POLICY "Users can read own application events"
  ON application_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = application_events.application_id
      AND (
        applications.user_id = auth.uid() OR
        applications.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

-- Admins can read all application events
CREATE POLICY "Admins can read all application events"
  ON application_events FOR SELECT
  USING (is_admin());

-- Admins can insert application events
CREATE POLICY "Admins can insert application events"
  ON application_events FOR INSERT
  WITH CHECK (is_admin());

-- System can insert application events (for status changes)
CREATE POLICY "System can insert application events"
  ON application_events FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- LEADS POLICIES
-- =====================================================
-- Public can create leads
CREATE POLICY "Public can create leads"
  ON leads FOR INSERT
  WITH CHECK (true);

-- Admins can read all leads
CREATE POLICY "Admins can read all leads"
  ON leads FOR SELECT
  USING (is_admin());

-- Admins can update leads
CREATE POLICY "Admins can update leads"
  ON leads FOR UPDATE
  USING (is_admin());

-- Admins can delete leads
CREATE POLICY "Admins can delete leads"
  ON leads FOR DELETE
  USING (is_admin());

-- =====================================================
-- SELL REQUESTS POLICIES
-- =====================================================
-- Public can create sell requests
CREATE POLICY "Public can create sell requests"
  ON sell_requests FOR INSERT
  WITH CHECK (true);

-- Admins can read all sell requests
CREATE POLICY "Admins can read all sell requests"
  ON sell_requests FOR SELECT
  USING (is_admin());

-- Admins can update sell requests
CREATE POLICY "Admins can update sell requests"
  ON sell_requests FOR UPDATE
  USING (is_admin());

-- Admins can delete sell requests
CREATE POLICY "Admins can delete sell requests"
  ON sell_requests FOR DELETE
  USING (is_admin());

-- =====================================================
-- SELL REQUEST IMAGES POLICIES
-- =====================================================
-- Public can insert sell request images
CREATE POLICY "Public can insert sell request images"
  ON sell_request_images FOR INSERT
  WITH CHECK (true);

-- Admins can read all sell request images
CREATE POLICY "Admins can read all sell request images"
  ON sell_request_images FOR SELECT
  USING (is_admin());

-- Admins can delete sell request images
CREATE POLICY "Admins can delete sell request images"
  ON sell_request_images FOR DELETE
  USING (is_admin());

-- =====================================================
-- SERVICE BOOKINGS POLICIES
-- =====================================================
-- Public can create service bookings
CREATE POLICY "Public can create service bookings"
  ON service_bookings FOR INSERT
  WITH CHECK (true);

-- Users can read their own service bookings
CREATE POLICY "Users can read own service bookings"
  ON service_bookings FOR SELECT
  USING (
    auth.uid() = user_id OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Admins can read all service bookings
CREATE POLICY "Admins can read all service bookings"
  ON service_bookings FOR SELECT
  USING (is_admin());

-- Admins can update service bookings
CREATE POLICY "Admins can update service bookings"
  ON service_bookings FOR UPDATE
  USING (is_admin());

-- Admins can delete service bookings
CREATE POLICY "Admins can delete service bookings"
  ON service_bookings FOR DELETE
  USING (is_admin());

-- =====================================================
-- FLEET LEADS POLICIES
-- =====================================================
-- Public can create fleet leads
CREATE POLICY "Public can create fleet leads"
  ON fleet_leads FOR INSERT
  WITH CHECK (true);

-- Admins can read all fleet leads
CREATE POLICY "Admins can read all fleet leads"
  ON fleet_leads FOR SELECT
  USING (is_admin());

-- Admins can update fleet leads
CREATE POLICY "Admins can update fleet leads"
  ON fleet_leads FOR UPDATE
  USING (is_admin());

-- Admins can delete fleet leads
CREATE POLICY "Admins can delete fleet leads"
  ON fleet_leads FOR DELETE
  USING (is_admin());

-- =====================================================
-- CMS CONTENT POLICIES
-- =====================================================
-- Public can read cms content
CREATE POLICY "Public can read cms content"
  ON cms_content FOR SELECT
  USING (true);

-- Admins can insert cms content
CREATE POLICY "Admins can insert cms content"
  ON cms_content FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update cms content
CREATE POLICY "Admins can update cms content"
  ON cms_content FOR UPDATE
  USING (is_admin());

-- Admins can delete cms content
CREATE POLICY "Admins can delete cms content"
  ON cms_content FOR DELETE
  USING (is_admin());

-- =====================================================
-- SETTINGS POLICIES
-- =====================================================
-- Public can read settings
CREATE POLICY "Public can read settings"
  ON settings FOR SELECT
  USING (true);

-- Admins can insert settings
CREATE POLICY "Admins can insert settings"
  ON settings FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update settings
CREATE POLICY "Admins can update settings"
  ON settings FOR UPDATE
  USING (is_admin());

-- Admins can delete settings
CREATE POLICY "Admins can delete settings"
  ON settings FOR DELETE
  USING (is_admin());
