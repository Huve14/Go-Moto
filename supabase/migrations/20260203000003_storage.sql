-- Go-Moto Storage Buckets Setup
-- Run this in Supabase SQL Editor

-- Create listing-images bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create application-documents bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'application-documents',
  'application-documents',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create sell-request-images bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sell-request-images',
  'sell-request-images',
  false,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES: listing-images (public bucket)
-- =====================================================

-- Public can read listing images
CREATE POLICY "Public can read listing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

-- Admins can upload listing images
CREATE POLICY "Admins can upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-images' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Admins can update listing images
CREATE POLICY "Admins can update listing images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'listing-images' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Admins can delete listing images
CREATE POLICY "Admins can delete listing images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listing-images' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- STORAGE POLICIES: application-documents (private bucket)
-- =====================================================

-- Anyone can upload application documents (for application submission)
CREATE POLICY "Anyone can upload application documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'application-documents');

-- Admins can read all application documents
CREATE POLICY "Admins can read application documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'application-documents' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Admins can delete application documents
CREATE POLICY "Admins can delete application documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'application-documents' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- STORAGE POLICIES: sell-request-images (private bucket)
-- =====================================================

-- Anyone can upload sell request images
CREATE POLICY "Anyone can upload sell request images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sell-request-images');

-- Admins can read all sell request images
CREATE POLICY "Admins can read sell request images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'sell-request-images' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Admins can delete sell request images
CREATE POLICY "Admins can delete sell request images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'sell-request-images' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
