-- Go-Moto Seed Data
-- Run this in Supabase SQL Editor or via CLI

-- =====================================================
-- CREATE TEST ADMIN USER
-- Email: admin@gomoto.co.za
-- Password: Admin123!
-- =====================================================

-- First, create the auth user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@gomoto.co.za',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  '{"full_name": "Admin User"}'::jsonb,
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Set admin role in profiles
INSERT INTO profiles (id, full_name, phone, role)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Admin User', '+27123456789', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- =====================================================
-- TEST LISTINGS
-- =====================================================

INSERT INTO listings (id, slug, title, description, type, brand, model, year, engine_cc, mileage, condition, price_cash, price_weekly, price_monthly, deposit, location, status, rider_tags, featured, specs) VALUES

-- SCOOTERS
('b0000000-0000-0000-0000-000000000001', 
 'honda-pcx-125-2024', 
 'Honda PCX 125 - Perfect City Commuter', 
 'The Honda PCX 125 is the ultimate urban scooter. Fuel-efficient, reliable, and packed with features including keyless ignition, LED lighting, and underseat storage. Perfect for daily commutes and weekend errands.',
 'scooter', 'Honda', 'PCX 125', 2024, 125, 2500, 'excellent',
 45000, 450, 1600, 2000, 'Johannesburg', 'published',
 ARRAY['commuter', 'beginner-friendly', 'fuel-efficient'], true,
 '{"fuel_type": "Petrol", "transmission": "Automatic CVT", "seat_height": "764mm", "fuel_capacity": "8.1L", "abs": true}'::jsonb),

('b0000000-0000-0000-0000-000000000002', 
 'yamaha-nmax-155-2023', 
 'Yamaha NMAX 155 - Premium Scooter', 
 'The Yamaha NMAX 155 offers a premium riding experience with VVA technology, traction control, and connected features via the Y-Connect app. A step above the rest.',
 'scooter', 'Yamaha', 'NMAX 155', 2023, 155, 8000, 'good',
 42000, 420, 1500, 1800, 'Cape Town', 'published',
 ARRAY['commuter', 'tech-savvy', 'premium'], true,
 '{"fuel_type": "Petrol", "transmission": "Automatic CVT", "seat_height": "765mm", "fuel_capacity": "7.1L", "abs": true, "traction_control": true}'::jsonb),

('b0000000-0000-0000-0000-000000000003', 
 'suzuki-burgman-street-2024', 
 'Suzuki Burgman Street 125 - Stylish Cruiser', 
 'The Burgman Street combines maxi-scooter styling with 125cc practicality. Features include digital console, LED headlamp, and generous storage space.',
 'scooter', 'Suzuki', 'Burgman Street 125', 2024, 125, 1200, 'new',
 38000, 380, 1350, 1500, 'Durban', 'published',
 ARRAY['commuter', 'stylish', 'beginner-friendly'], false,
 '{"fuel_type": "Petrol", "transmission": "Automatic CVT", "seat_height": "780mm", "fuel_capacity": "5.6L", "abs": false}'::jsonb),

('b0000000-0000-0000-0000-000000000004', 
 'vespa-primavera-150-2024', 
 'Vespa Primavera 150 - Italian Icon', 
 'The Vespa Primavera is a timeless Italian classic. With its iconic styling, quality build, and premium features, it turns every ride into a statement.',
 'scooter', 'Vespa', 'Primavera 150', 2024, 150, 800, 'new',
 75000, 750, 2650, 4000, 'Sandton', 'published',
 ARRAY['premium', 'stylish', 'commuter'], false,
 '{"fuel_type": "Petrol", "transmission": "Automatic CVT", "seat_height": "790mm", "fuel_capacity": "7L", "abs": true}'::jsonb),

('b0000000-0000-0000-0000-000000000005', 
 'sym-jet-14-200-2023', 
 'SYM Jet 14 200 - Budget Friendly', 
 'The SYM Jet 14 200 offers excellent value for money with a punchy 200cc engine, modern styling, and reliable build quality. Great for first-time riders.',
 'scooter', 'SYM', 'Jet 14 200', 2023, 200, 5000, 'good',
 32000, 320, 1150, 1200, 'Pretoria', 'published',
 ARRAY['budget', 'commuter', 'beginner-friendly'], false,
 '{"fuel_type": "Petrol", "transmission": "Automatic CVT", "seat_height": "770mm", "fuel_capacity": "6.5L", "abs": false}'::jsonb),

-- ELECTRIC
('b0000000-0000-0000-0000-000000000006', 
 'bmw-ce-04-2024', 
 'BMW CE 04 - Electric Future', 
 'The BMW CE 04 is a revolutionary electric scooter with futuristic design, 130km range, and rapid charging. The future of urban mobility is here.',
 'electric', 'BMW', 'CE 04', 2024, 0, 500, 'new',
 185000, 1850, 6500, 10000, 'Johannesburg', 'published',
 ARRAY['electric', 'premium', 'tech-savvy', 'eco-friendly'], true,
 '{"motor_power": "31kW", "range": "130km", "charge_time": "4.5h", "top_speed": "120km/h", "abs": true, "traction_control": true}'::jsonb),

('b0000000-0000-0000-0000-000000000007', 
 'niu-nqi-gts-2023', 
 'NIU NQi GTS - Smart Electric', 
 'The NIU NQi GTS is a smart electric scooter with app connectivity, GPS tracking, and swappable batteries. Perfect for eco-conscious city riders.',
 'electric', 'NIU', 'NQi GTS', 2023, 0, 3000, 'excellent',
 55000, 550, 1950, 2500, 'Pretoria', 'published',
 ARRAY['electric', 'smart', 'eco-friendly', 'commuter'], false,
 '{"motor_power": "3kW", "range": "80km", "charge_time": "3.5h", "top_speed": "70km/h", "abs": false}'::jsonb),

('b0000000-0000-0000-0000-000000000008', 
 'super-soco-cpx-2024', 
 'Super SOCO CPX - Electric Performance', 
 'The Super SOCO CPX delivers electric performance with dual removable batteries, 140km range, and sporty styling. Silent power for the modern rider.',
 'electric', 'Super SOCO', 'CPX', 2024, 0, 1000, 'new',
 65000, 650, 2300, 3000, 'Cape Town', 'published',
 ARRAY['electric', 'performance', 'eco-friendly'], false,
 '{"motor_power": "4kW", "range": "140km", "charge_time": "4h", "top_speed": "90km/h", "abs": true}'::jsonb),

-- MOTORCYCLES
('b0000000-0000-0000-0000-000000000009', 
 'honda-cb300r-2024', 
 'Honda CB300R - Neo Sports Cafe', 
 'The CB300R brings neo-retro styling to the lightweight class. With IMU-based ABS, LED lighting, and aggressive styling, it is perfect for urban riders who want more than a scooter.',
 'motorcycle', 'Honda', 'CB300R', 2024, 286, 1500, 'new',
 85000, 850, 3000, 5000, 'Johannesburg', 'published',
 ARRAY['sport', 'stylish', 'intermediate'], true,
 '{"fuel_type": "Petrol", "transmission": "6-speed manual", "seat_height": "799mm", "fuel_capacity": "10L", "abs": true}'::jsonb),

('b0000000-0000-0000-0000-000000000010', 
 'ktm-duke-390-2023', 
 'KTM 390 Duke - Ready to Race', 
 'The KTM 390 Duke is the ultimate lightweight performance machine. With 44hp, quickshifter, and aggressive ergonomics, it is built for riders who demand more.',
 'motorcycle', 'KTM', '390 Duke', 2023, 373, 6000, 'good',
 95000, 950, 3400, 5500, 'Cape Town', 'published',
 ARRAY['sport', 'performance', 'intermediate'], true,
 '{"fuel_type": "Petrol", "transmission": "6-speed manual", "seat_height": "820mm", "fuel_capacity": "13.4L", "abs": true, "quickshifter": true}'::jsonb),

('b0000000-0000-0000-0000-000000000011', 
 'yamaha-mt-03-2024', 
 'Yamaha MT-03 - Dark Side of Japan', 
 'The Yamaha MT-03 brings aggressive Dark Side styling to the A2 license class. With 42hp and cutting-edge design, it is the perfect gateway to the MT family.',
 'motorcycle', 'Yamaha', 'MT-03', 2024, 321, 2000, 'excellent',
 89000, 890, 3150, 5000, 'Durban', 'published',
 ARRAY['sport', 'stylish', 'intermediate'], false,
 '{"fuel_type": "Petrol", "transmission": "6-speed manual", "seat_height": "780mm", "fuel_capacity": "14L", "abs": true}'::jsonb),

('b0000000-0000-0000-0000-000000000012', 
 'kawasaki-z400-2023', 
 'Kawasaki Z400 - Sugomi Styling', 
 'The Kawasaki Z400 features aggressive Sugomi styling and a responsive 400cc parallel twin. Perfect balance of performance and everyday usability.',
 'motorcycle', 'Kawasaki', 'Z400', 2023, 399, 4500, 'good',
 92000, 920, 3250, 5200, 'Johannesburg', 'published',
 ARRAY['sport', 'performance', 'intermediate'], false,
 '{"fuel_type": "Petrol", "transmission": "6-speed manual", "seat_height": "785mm", "fuel_capacity": "14L", "abs": true}'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- TEST LISTING IMAGES (placeholder URLs)
-- =====================================================

INSERT INTO listing_images (listing_id, url, sort_order) VALUES
('b0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', 0),
('b0000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=800', 0),
('b0000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800', 0),
('b0000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', 0),
('b0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800', 0),
('b0000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1632816550340-e5849c0a4e1a?w=800', 0),
('b0000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1622185135505-2d795003f6e1?w=800', 0),
('b0000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1614165936282-c52e1e53a13d?w=800', 0),
('b0000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800', 0),
('b0000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800', 0),
('b0000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800', 0),
('b0000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800', 0)
ON CONFLICT DO NOTHING;
