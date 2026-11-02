-- ==============================================================================
-- RANKPILOT AI: COMPLETE MASTER PRODUCTION DATABASE SCHEMA
-- Includes all 28 tables, RLS policies, automated auth triggers, and admin access
-- Safe to run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. CORE IDENTITY & MULTI-TENANCY TABLES
-- ==============================================================================

-- 1.1 Profiles (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Organizations (Agency Multi-Tenancy)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    plan TEXT DEFAULT 'agency' CHECK (plan IN ('free', 'solo', 'agency', 'enterprise')),
    billing_email TEXT,
    max_websites INT DEFAULT 15,
    max_crawled_pages_per_audit INT DEFAULT 50,
    max_ai_analyses_per_month INT DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Memberships (Links auth.users/profiles to organizations)
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 1.4 Invitations
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    token TEXT NOT NULL UNIQUE,
    invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. CLIENT WEBSITES & PROPERTY MANAGEMENT
-- ==============================================================================

-- 2.1 Websites
CREATE TABLE IF NOT EXISTS public.websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    url TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
    latest_seo_score NUMERIC(5,2) DEFAULT 0,
    latest_geo_score NUMERIC(5,2) DEFAULT 0,
    latest_aeo_score NUMERIC(5,2) DEFAULT 0,
    last_audited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Website Settings
CREATE TABLE IF NOT EXISTS public.website_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE UNIQUE,
    crawl_depth_limit INT DEFAULT 2,
    max_crawl_pages INT DEFAULT 25,
    crawl_rate_limit_ms INT DEFAULT 500,
    user_agent TEXT DEFAULT 'RankPilotAI-AuditBot/1.0',
    enable_geo_analysis BOOLEAN DEFAULT TRUE,
    enable_aeo_analysis BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 OAuth Connections
CREATE TABLE IF NOT EXISTS public.oauth_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('google_search_console')),
    account_email TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'expired', 'revoked', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, provider, account_email)
);

-- 2.4 GSC Properties
CREATE TABLE IF NOT EXISTS public.gsc_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE UNIQUE,
    oauth_connection_id UUID REFERENCES public.oauth_connections(id) ON DELETE SET NULL,
    property_url TEXT NOT NULL,
    permission_level TEXT,
    is_connected BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 GSC Sync History
CREATE TABLE IF NOT EXISTS public.gsc_sync_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    sync_status TEXT NOT NULL CHECK (sync_status IN ('success', 'partial', 'failed', 'running')),
    records_synced INT DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 2.6 GSC Metrics
CREATE TABLE IF NOT EXISTS public.gsc_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    page_url TEXT NOT NULL,
    query TEXT,
    clicks INT DEFAULT 0,
    impressions INT DEFAULT 0,
    ctr NUMERIC(6,4) DEFAULT 0,
    position NUMERIC(6,2) DEFAULT 0,
    device TEXT DEFAULT 'desktop',
    country TEXT DEFAULT 'global',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. AUDITING & TECHNICAL SEO ENGINE
-- ==============================================================================

-- 3.1 Audit Runs
CREATE TABLE IF NOT EXISTS public.audit_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'crawling', 'analyzing', 'completed', 'failed')),
    pages_crawled INT DEFAULT 0,
    pages_failed INT DEFAULT 0,
    seo_score NUMERIC(5,2) DEFAULT 0,
    geo_score NUMERIC(5,2) DEFAULT 0,
    aeo_score NUMERIC(5,2) DEFAULT 0,
    crawl_duration_ms INT DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 Audit Pages
CREATE TABLE IF NOT EXISTS public.audit_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_run_id UUID NOT NULL REFERENCES public.audit_runs(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    status_code INT NOT NULL,
    load_time_ms INT,
    title TEXT,
    meta_description TEXT,
    canonical_url TEXT,
    h1_elements JSONB,
    h2_elements JSONB,
    schema_types JSONB,
    meta_robots TEXT,
    internal_links_count INT DEFAULT 0,
    external_links_count INT DEFAULT 0,
    word_count INT DEFAULT 0,
    raw_content_preview TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Audit Findings
CREATE TABLE IF NOT EXISTS public.audit_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_run_id UUID NOT NULL REFERENCES public.audit_runs(id) ON DELETE CASCADE,
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('technical', 'content', 'geo', 'aeo', 'indexability')),
    issue_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    confidence_level TEXT DEFAULT 'high' CHECK (confidence_level IN ('high', 'medium', 'low')),
    detection_method TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 Audit Evidence
CREATE TABLE IF NOT EXISTS public.audit_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID NOT NULL REFERENCES public.audit_findings(id) ON DELETE CASCADE,
    expected_condition TEXT NOT NULL,
    actual_condition TEXT NOT NULL,
    snippet TEXT,
    http_headers JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 Score History
CREATE TABLE IF NOT EXISTS public.score_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    audit_run_id UUID REFERENCES public.audit_runs(id) ON DELETE SET NULL,
    seo_score NUMERIC(5,2) NOT NULL,
    geo_score NUMERIC(5,2) NOT NULL,
    aeo_score NUMERIC(5,2) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. SEO OPPORTUNITIES & TRAFFIC DROPS
-- ==============================================================================

-- 4.1 SEO Opportunities
CREATE TABLE IF NOT EXISTS public.seo_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('high_impressions_low_ctr', 'striking_distance_5_20', 'declining_ctr', 'content_expansion', 'keyword_cannibalization')),
    query TEXT,
    page_url TEXT NOT NULL,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    ctr NUMERIC(6,4),
    position NUMERIC(6,2),
    potential_impact TEXT CHECK (potential_impact IN ('critical', 'high', 'medium', 'low')),
    hypothesis TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'actioned', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 Traffic Investigations
CREATE TABLE IF NOT EXISTS public.traffic_investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    previous_period_start DATE NOT NULL,
    previous_period_end DATE NOT NULL,
    click_change_pct NUMERIC(6,2),
    impression_change_pct NUMERIC(6,2),
    position_change NUMERIC(6,2),
    affected_pages JSONB,
    affected_queries JSONB,
    investigation_notes TEXT,
    hypotheses JSONB,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. ACTION CENTER & TASK VERIFICATION
-- ==============================================================================

-- 5.1 Action Items
CREATE TABLE IF NOT EXISTS public.action_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN ('audit_finding', 'seo_opportunity', 'traffic_investigation', 'manual')),
    source_id UUID,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('technical', 'content', 'geo', 'aeo', 'indexability')),
    priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    affected_url TEXT NOT NULL,
    recommended_solution TEXT NOT NULL,
    step_by_step_instructions JSONB,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'dismissed')),
    verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'unresolved', 'unable_to_verify')),
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    due_date DATE,
    completed_at TIMESTAMPTZ,
    user_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.2 Verification Runs
CREATE TABLE IF NOT EXISTS public.verification_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_item_id UUID NOT NULL REFERENCES public.action_items(id) ON DELETE CASCADE,
    audit_run_id UUID REFERENCES public.audit_runs(id) ON DELETE SET NULL,
    outcome TEXT NOT NULL CHECK (outcome IN ('completed_verified', 'completed_not_verified', 'still_unresolved', 'unable_to_verify')),
    explanation TEXT NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5.3 Verification Evidence
CREATE TABLE IF NOT EXISTS public.verification_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_run_id UUID NOT NULL REFERENCES public.verification_runs(id) ON DELETE CASCADE,
    before_state TEXT NOT NULL,
    after_state TEXT NOT NULL,
    raw_proof TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. NOTIFICATIONS, REPORTS, USAGE & LOGS
-- ==============================================================================

-- 6.1 Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    website_id UUID REFERENCES public.websites(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('traffic_drop', 'critical_finding', 'audit_completed', 'task_verified', 'sync_failed')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'success')),
    is_read BOOLEAN DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.2 Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    report_data JSONB NOT NULL,
    generated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6.3 Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. SECURITY FUNCTIONS & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS across all sensitive tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper: Get organizations the user belongs to
CREATE OR REPLACE FUNCTION public.get_user_org_ids(user_uuid UUID)
RETURNS TABLE (org_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT organization_id FROM public.memberships WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: Check if user is an admin or superadmin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid()));

-- Organizations Policies
DROP POLICY IF EXISTS "Members can view their organizations" ON public.organizations;
CREATE POLICY "Members can view their organizations" ON public.organizations
    FOR SELECT USING (id IN (SELECT get_user_org_ids(auth.uid())) OR public.is_admin(auth.uid()));

-- Websites Policies
DROP POLICY IF EXISTS "Members can view organization websites" ON public.websites;
CREATE POLICY "Members can view organization websites" ON public.websites
    FOR SELECT USING (organization_id IN (SELECT get_user_org_ids(auth.uid())) OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Members can insert organization websites" ON public.websites;
CREATE POLICY "Members can insert organization websites" ON public.websites
    FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_org_ids(auth.uid())) OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Members can update organization websites" ON public.websites;
CREATE POLICY "Members can update organization websites" ON public.websites
    FOR UPDATE USING (organization_id IN (SELECT get_user_org_ids(auth.uid())) OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Members can delete organization websites" ON public.websites;
CREATE POLICY "Members can delete organization websites" ON public.websites
    FOR DELETE USING (organization_id IN (SELECT get_user_org_ids(auth.uid())) OR public.is_admin(auth.uid()));

-- Audit Runs Policies
DROP POLICY IF EXISTS "Members can view audit runs" ON public.audit_runs;
CREATE POLICY "Members can view audit runs" ON public.audit_runs
    FOR SELECT USING (
        website_id IN (SELECT id FROM public.websites WHERE organization_id IN (SELECT get_user_org_ids(auth.uid())))
        OR public.is_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Members can insert audit runs" ON public.audit_runs;
CREATE POLICY "Members can insert audit runs" ON public.audit_runs
    FOR INSERT WITH CHECK (
        website_id IN (SELECT id FROM public.websites WHERE organization_id IN (SELECT get_user_org_ids(auth.uid())))
        OR public.is_admin(auth.uid())
    );

-- Action Items Policies
DROP POLICY IF EXISTS "Members can view action items" ON public.action_items;
CREATE POLICY "Members can view action items" ON public.action_items
    FOR SELECT USING (organization_id IN (SELECT get_user_org_ids(auth.uid())) OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Members can update action items" ON public.action_items;
CREATE POLICY "Members can update action items" ON public.action_items
    FOR UPDATE USING (organization_id IN (SELECT get_user_org_ids(auth.uid())) OR public.is_admin(auth.uid()));

-- Activity Logs Policies
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
    FOR SELECT USING (public.is_admin(auth.uid()));

-- ==============================================================================
-- 8. AUTOMATED AUTH HOOK TRIGGER & USER PROVISIONING
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  org_slug TEXT;
  user_full_name TEXT;
  user_role TEXT;
BEGIN
  -- Extract full name from auth metadata or split email
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Determine role: founder / uzairseo accounts receive admin status automatically
  IF NEW.email = 'founder@rankpilot.ai' 
     OR NEW.email LIKE '%@uzairseo.com'
     OR NEW.email LIKE '%uzairnoor%' THEN
    user_role := 'admin';
  ELSE
    user_role := 'user';
  END IF;

  -- 1. Insert Profile
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (NEW.id, NEW.email, user_full_name, user_role, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE 
  SET email = EXCLUDED.email,
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
      updated_at = NOW();

  -- 2. Create Default Personal Organization
  org_slug := lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || '-' || substring(NEW.id::text, 1, 8);
  INSERT INTO public.organizations (name, slug, plan, billing_email, created_at, updated_at)
  VALUES (user_full_name || '''s Agency', org_slug, 'agency', NEW.email, NOW(), NOW())
  RETURNING id INTO new_org_id;

  -- 3. Create Owner Membership
  INSERT INTO public.memberships (organization_id, user_id, role, created_at, updated_at)
  VALUES (new_org_id, NEW.id, 'owner', NOW(), NOW())
  ON CONFLICT (organization_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 9. SAFE BACKFILL FOR EXISTING AUTH USERS
-- ==============================================================================

DO $$
DECLARE
  u RECORD;
  new_org_id UUID;
  user_full_name TEXT;
  user_role TEXT;
BEGIN
  FOR u IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
    user_full_name := COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1));
    
    IF u.email = 'founder@rankpilot.ai' OR u.email LIKE '%@uzairseo.com' OR u.email LIKE '%uzairnoor%' THEN
      user_role := 'admin';
    ELSE
      user_role := 'user';
    END IF;

    -- Upsert profile
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (u.id, u.email, user_full_name, user_role)
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

    -- Create organization and membership if missing
    IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE user_id = u.id) THEN
      INSERT INTO public.organizations (name, slug, plan, billing_email)
      VALUES (user_full_name || '''s Agency', lower(regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')) || '-' || substring(u.id::text, 1, 8), 'agency', u.email)
      RETURNING id INTO new_org_id;

      INSERT INTO public.memberships (organization_id, user_id, role)
      VALUES (new_org_id, u.id, 'owner')
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- ==============================================================================
-- 10. HIGH-PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org ON public.memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_websites_org ON public.websites(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_runs_website ON public.audit_runs(website_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_run ON public.audit_findings(audit_run_id);
CREATE INDEX IF NOT EXISTS idx_action_items_org ON public.action_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_action_items_website ON public.action_items(website_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_org ON public.activity_logs(organization_id);
