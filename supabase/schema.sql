-- ============================================================
-- HubPlate CRM — Supabase Database Schema
-- ============================================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This creates all tables, enums, indexes, triggers, and
-- Row Level Security (RLS) policies so each sales rep can
-- only access their own data.
-- ============================================================


-- ───────────────────────────── ENUMS ─────────────────────────
CREATE TYPE lead_status   AS ENUM ('new','contacted','qualified','proposal','won','lost');
CREATE TYPE deal_stage    AS ENUM ('prospect','qualified','proposal','negotiation','won','lost');
CREATE TYPE activity_type AS ENUM ('call','email','meeting','note','task','onboarding');
CREATE TYPE event_type    AS ENUM ('follow_up','meeting','call','demo','other','onboarding');


-- ───────────────────────────── PROFILES ──────────────────────
-- Mirrors auth.users so we can store display names / metadata.
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT DEFAULT 'sales_rep',
  team        TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ───────────────────────────── LEADS ─────────────────────────
CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  company         TEXT,
  job_title       TEXT,
  status          lead_status DEFAULT 'new',
  source          TEXT,
  estimated_value NUMERIC(12,2) DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leads_user    ON leads(user_id);
CREATE INDEX idx_leads_status  ON leads(status);
CREATE INDEX idx_leads_company ON leads(company);


-- ───────────────────────────── DEALS ─────────────────────────
CREATE TABLE deals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id             UUID REFERENCES leads(id) ON DELETE SET NULL,
  title               TEXT NOT NULL,
  value               NUMERIC(12,2) DEFAULT 0,
  stage               deal_stage DEFAULT 'prospect',
  expected_close_date DATE,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_deals_user  ON deals(user_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_lead  ON deals(lead_id);


-- ───────────────────────────── ACTIVITIES ────────────────────
CREATE TABLE activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id      UUID REFERENCES leads(id) ON DELETE SET NULL,
  type         activity_type NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  scheduled_at TIMESTAMPTZ,
  completed    BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activities_user      ON activities(user_id);
CREATE INDEX idx_activities_lead      ON activities(lead_id);
CREATE INDEX idx_activities_scheduled ON activities(scheduled_at);


-- ───────────────────────────── CALENDAR EVENTS ──────────────
CREATE TABLE calendar_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id     UUID REFERENCES leads(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  description TEXT,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ NOT NULL,
  event_type  event_type DEFAULT 'other',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_user  ON calendar_events(user_id);
CREATE INDEX idx_events_start ON calendar_events(start_time);
CREATE INDEX idx_events_lead  ON calendar_events(lead_id);


-- ───────────────────────────── UPDATED_AT TRIGGER ───────────
-- Automatically sets updated_at on every UPDATE.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ═══════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
--  Each user can only see / modify their own rows.
-- ═══════════════════════════════════════════════════════════

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads"
  ON leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
  ON leads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
  ON leads FOR DELETE
  USING (auth.uid() = user_id);

-- Deals
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deals"
  ON deals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deals"
  ON deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deals"
  ON deals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deals"
  ON deals FOR DELETE
  USING (auth.uid() = user_id);

-- Activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities"
  ON activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON activities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON activities FOR DELETE
  USING (auth.uid() = user_id);

-- Calendar Events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
  ON calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON calendar_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON calendar_events FOR DELETE
  USING (auth.uid() = user_id);
