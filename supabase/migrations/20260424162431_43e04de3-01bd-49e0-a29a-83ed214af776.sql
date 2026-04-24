-- Add fields for the simplified contract tracker MVP
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS responsible_name TEXT,
  ADD COLUMN IF NOT EXISTS open_to_offers TEXT CHECK (open_to_offers IN ('yes', 'later', 'no')),
  ADD COLUMN IF NOT EXISTS user_decision TEXT CHECK (user_decision IN ('cancel', 'renegotiate', 'keep')),
  ADD COLUMN IF NOT EXISTS decision_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS contract_value NUMERIC DEFAULT 0;