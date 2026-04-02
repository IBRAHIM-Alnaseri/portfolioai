-- PortfolioAI · Supabase Database Setup
-- Run this in Supabase → SQL Editor

-- ── 1. Create the portfolios table ──────────────────────────────────────────
CREATE TABLE portfolios (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         TEXT NOT NULL UNIQUE,        -- Clerk user ID (one portfolio per user)
  slug            TEXT NOT NULL UNIQUE,        -- public URL: portfolioai.io/slug
  portfolio_data  JSONB NOT NULL,              -- full AI-generated portfolio
  theme           TEXT DEFAULT 'minimal',      -- minimal | bold | editorial
  is_pro          BOOLEAN DEFAULT FALSE,       -- unlocked after Stripe payment
  views           INTEGER DEFAULT 0,          -- visitor analytics (Pro feature)
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Index for fast slug lookups (public portfolio page) ───────────────────
CREATE INDEX idx_portfolios_slug ON portfolios(slug);
CREATE INDEX idx_portfolios_user ON portfolios(user_id);

-- ── 3. Auto-update the updated_at timestamp ──────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 4. Function to safely increment views ────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_views(portfolio_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE portfolios SET views = views + 1 WHERE slug = portfolio_slug;
END;
$$ LANGUAGE plpgsql;

-- ── 5. Row Level Security (RLS) — users can only touch their own data ─────────
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Anyone can READ any portfolio (public portfolio pages)
CREATE POLICY "Public portfolios are readable by anyone"
  ON portfolios FOR SELECT
  USING (TRUE);

-- Only the owner can INSERT their own portfolio
CREATE POLICY "Users can insert their own portfolio"
  ON portfolios FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id);

-- Only the owner can UPDATE their own portfolio
CREATE POLICY "Users can update their own portfolio"
  ON portfolios FOR UPDATE
  USING (auth.uid()::TEXT = user_id);

-- ── Done! Your database is ready ─────────────────────────────────────────────
-- Next step: go back to your app and set your SUPABASE_URL and ANON_KEY in .env.local
