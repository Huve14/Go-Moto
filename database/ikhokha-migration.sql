-- iKhokha Payment Integration Migration
-- This migration adds payment transaction tracking and updates subscription fields
-- for iKhokha (iK Pay Gateway) integration

-- ============================================================================
-- 1. CREATE PAYMENT TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  plan_id UUID NOT NULL REFERENCES public.listing_plans(id) ON DELETE RESTRICT,
  
  -- Payment reference and amount
  reference TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZAR',
  
  -- Payment status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  
  -- Provider details
  provider TEXT NOT NULL DEFAULT 'ikhokha',
  provider_transaction_id TEXT,
  provider_response JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes for common queries
  CONSTRAINT valid_amount CHECK (amount > 0)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id ON public.payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON public.payment_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON public.payment_transactions(created_at DESC);

-- ============================================================================
-- 2. ADD NEW COLUMNS TO SUBSCRIPTIONS TABLE
-- ============================================================================

-- Add next_payment_due column for tracking billing cycles
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS next_payment_due DATE;

-- Add grace_until column for grace period handling
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS grace_until TIMESTAMPTZ;

-- Add last_payment_date for reference
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ;

-- Add payment_method tracking (for future multi-provider support)
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'ikhokha';

-- Update subscription status enum to include 'past_due'
-- Note: This assumes status is a text column with a check constraint
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('pending', 'active', 'past_due', 'paused', 'canceled'));

-- Index for finding subscriptions due for payment
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_payment_due 
ON public.subscriptions(next_payment_due) 
WHERE status = 'active';

-- Index for finding overdue subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_grace_until 
ON public.subscriptions(grace_until) 
WHERE status = 'past_due';

-- ============================================================================
-- 3. UPDATE LISTING PLANS WITH CORRECT PRICES
-- ============================================================================

-- Update existing plans with correct prices (R199, R349, R599)
UPDATE public.listing_plans SET monthly_price = 199.00 WHERE slug = 'basic';
UPDATE public.listing_plans SET monthly_price = 349.00 WHERE slug = 'pro';
UPDATE public.listing_plans SET monthly_price = 599.00 WHERE slug = 'featured';

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) FOR PAYMENT TRANSACTIONS
-- ============================================================================

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment transactions
CREATE POLICY "Users can view own payment transactions"
ON public.payment_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can do everything (for webhooks and cron jobs)
CREATE POLICY "Service role has full access to payment transactions"
ON public.payment_transactions
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 5. FUNCTIONS FOR SUBSCRIPTION MANAGEMENT
-- ============================================================================

-- Function to calculate next payment date (1 month from given date)
CREATE OR REPLACE FUNCTION calculate_next_payment_date(from_date DATE DEFAULT CURRENT_DATE)
RETURNS DATE AS $$
BEGIN
  RETURN from_date + INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;

-- Function to calculate grace period end (3 days from payment due date)
CREATE OR REPLACE FUNCTION calculate_grace_until(payment_due_date DATE)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN (payment_due_date + INTERVAL '3 days')::TIMESTAMPTZ;
END;
$$ LANGUAGE plpgsql;

-- Function to update subscription after successful payment
CREATE OR REPLACE FUNCTION process_successful_payment(
  p_subscription_id UUID,
  p_transaction_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_subscription RECORD;
BEGIN
  -- Get current subscription
  SELECT * INTO v_subscription FROM public.subscriptions WHERE id = p_subscription_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found: %', p_subscription_id;
  END IF;
  
  -- Update subscription
  UPDATE public.subscriptions SET
    status = 'active',
    last_payment_date = NOW(),
    next_payment_due = calculate_next_payment_date(CURRENT_DATE),
    grace_until = NULL,
    current_period_start = CURRENT_DATE,
    current_period_end = CURRENT_DATE + INTERVAL '1 month',
    updated_at = NOW()
  WHERE id = p_subscription_id;
  
  -- Update transaction
  UPDATE public.payment_transactions SET
    status = 'paid',
    paid_at = NOW(),
    updated_at = NOW()
  WHERE id = p_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark subscription as past due
CREATE OR REPLACE FUNCTION mark_subscription_past_due(p_subscription_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.subscriptions SET
    status = 'past_due',
    grace_until = calculate_grace_until(next_payment_due),
    updated_at = NOW()
  WHERE id = p_subscription_id
  AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to pause subscription after grace period
CREATE OR REPLACE FUNCTION pause_overdue_subscription(p_subscription_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.subscriptions SET
    status = 'paused',
    updated_at = NOW()
  WHERE id = p_subscription_id
  AND status = 'past_due'
  AND grace_until < NOW();
  
  -- Also pause all listings for this user
  UPDATE public.listings SET
    listing_status = 'paused',
    updated_at = NOW()
  WHERE owner_id = (
    SELECT user_id FROM public.subscriptions WHERE id = p_subscription_id
  )
  AND listing_status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. TRIGGER TO AUTO-UPDATE updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. DEPRECATION NOTES FOR STRIPE COLUMNS (DO NOT DROP YET)
-- ============================================================================

-- The following columns are deprecated but kept for data migration:
-- - subscriptions.stripe_customer_id
-- - subscriptions.stripe_subscription_id
-- - listing_plans.stripe_price_id
--
-- These can be dropped after confirming all data has been migrated:
-- ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS stripe_customer_id;
-- ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS stripe_subscription_id;
-- ALTER TABLE public.listing_plans DROP COLUMN IF EXISTS stripe_price_id;

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON public.payment_transactions TO authenticated;
GRANT SELECT ON public.listing_plans TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;

-- Service role needs full access for webhooks
GRANT ALL ON public.payment_transactions TO service_role;
GRANT ALL ON public.subscriptions TO service_role;

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================
/*
DROP TABLE IF EXISTS public.payment_transactions;
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS next_payment_due;
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS grace_until;
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS last_payment_date;
ALTER TABLE public.subscriptions DROP COLUMN IF EXISTS payment_provider;
DROP FUNCTION IF EXISTS calculate_next_payment_date;
DROP FUNCTION IF EXISTS calculate_grace_until;
DROP FUNCTION IF EXISTS process_successful_payment;
DROP FUNCTION IF EXISTS mark_subscription_past_due;
DROP FUNCTION IF EXISTS pause_overdue_subscription;
*/
