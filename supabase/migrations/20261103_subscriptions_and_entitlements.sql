-- ==============================================================================
-- RANKPILOT AI: SUBSCRIPTIONS & SERVER-SIDE ENTITLEMENTS MIGRATION
-- Migration Date: November 3, 2026
-- Adds: subscriptions, subscription_entitlements, usage_records, and auto-sync triggers.
-- Safe & Idempotent: Does not delete existing tables or customer records.
-- ==============================================================================

-- 1. Safely update organizations table plan check constraint
DO $$
BEGIN
    ALTER TABLE public.organizations DROP CONSTRAINT IF EXISTS organizations_plan_check;
    ALTER TABLE public.organizations ADD CONSTRAINT organizations_plan_check 
        CHECK (plan IN ('free', 'freelancer', 'agency', 'team', 'solo', 'enterprise'));
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Skipping constraint modification: %', SQLERRM;
END $$;

-- 2. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'free' CHECK (provider IN ('free', 'lemon_squeezy', 'paddle', 'stripe', 'manual')),
    provider_subscription_id TEXT,
    provider_customer_id TEXT,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'freelancer', 'agency', 'team', 'solo', 'enterprise')),
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 month'),
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subscription Entitlements Table (Single Source of Truth for Limits)
CREATE TABLE IF NOT EXISTS public.subscription_entitlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'freelancer', 'agency', 'team', 'solo', 'enterprise')),
    max_websites INT NOT NULL DEFAULT 1,
    max_crawled_pages INT NOT NULL DEFAULT 10,
    max_saved_reports INT NOT NULL DEFAULT 3,
    history_retention_days INT NOT NULL DEFAULT 14,
    has_gsc_sync BOOLEAN NOT NULL DEFAULT FALSE,
    has_striking_distance BOOLEAN NOT NULL DEFAULT FALSE,
    has_traffic_drop_engine BOOLEAN NOT NULL DEFAULT FALSE,
    has_keyword_clustering BOOLEAN NOT NULL DEFAULT FALSE,
    has_team_seats BOOLEAN NOT NULL DEFAULT FALSE,
    has_api_access BOOLEAN NOT NULL DEFAULT FALSE,
    has_white_label_reports BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Usage Records Table (For Crawling, Audits & API Limit Tracking)
CREATE TABLE IF NOT EXISTS public.usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    metric TEXT NOT NULL,
    period_month TEXT NOT NULL,
    current_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, metric, period_month)
);

-- 5. Helper Function: Synchronize Organization Entitlements
CREATE OR REPLACE FUNCTION public.sync_organization_entitlements(target_org_id UUID, target_plan TEXT)
RETURNS VOID AS $$
DECLARE
    v_max_websites INT := 1;
    v_max_crawled_pages INT := 10;
    v_max_saved_reports INT := 3;
    v_history_days INT := 14;
    v_has_gsc BOOLEAN := FALSE;
    v_has_striking BOOLEAN := FALSE;
    v_has_traffic_drop BOOLEAN := FALSE;
    v_has_clustering BOOLEAN := FALSE;
    v_has_team_seats BOOLEAN := FALSE;
    v_has_api BOOLEAN := FALSE;
    v_has_white_label BOOLEAN := FALSE;
BEGIN
    IF target_plan = 'freelancer' OR target_plan = 'solo' THEN
        v_max_websites := 3;
        v_max_crawled_pages := 25;
        v_max_saved_reports := 25;
        v_history_days := 90;
        v_has_gsc := TRUE;
    ELSIF target_plan = 'agency' THEN
        v_max_websites := 15;
        v_max_crawled_pages := 100;
        v_max_saved_reports := 100;
        v_history_days := 365;
        v_has_gsc := TRUE;
        v_has_striking := TRUE;
        v_has_traffic_drop := TRUE;
        v_has_team_seats := TRUE;
        v_has_white_label := TRUE;
    ELSIF target_plan = 'team' OR target_plan = 'enterprise' THEN
        v_max_websites := 50;
        v_max_crawled_pages := 500;
        v_max_saved_reports := 500;
        v_history_days := 3650;
        v_has_gsc := TRUE;
        v_has_striking := TRUE;
        v_has_traffic_drop := TRUE;
        v_has_clustering := TRUE;
        v_has_team_seats := TRUE;
        v_has_api := TRUE;
        v_has_white_label := TRUE;
    ELSE -- 'free'
        v_max_websites := 1;
        v_max_crawled_pages := 10;
        v_max_saved_reports := 3;
        v_history_days := 14;
    END IF;

    -- Upsert entitlements record
    INSERT INTO public.subscription_entitlements (
        organization_id,
        plan,
        max_websites,
        max_crawled_pages,
        max_saved_reports,
        history_retention_days,
        has_gsc_sync,
        has_striking_distance,
        has_traffic_drop_engine,
        has_keyword_clustering,
        has_team_seats,
        has_api_access,
        has_white_label_reports,
        updated_at
    ) VALUES (
        target_org_id,
        target_plan,
        v_max_websites,
        v_max_crawled_pages,
        v_max_saved_reports,
        v_history_days,
        v_has_gsc,
        v_has_striking,
        v_has_traffic_drop,
        v_has_clustering,
        v_has_team_seats,
        v_has_api,
        v_has_white_label,
        NOW()
    )
    ON CONFLICT (organization_id) DO UPDATE SET
        plan = EXCLUDED.plan,
        max_websites = EXCLUDED.max_websites,
        max_crawled_pages = EXCLUDED.max_crawled_pages,
        max_saved_reports = EXCLUDED.max_saved_reports,
        history_retention_days = EXCLUDED.history_retention_days,
        has_gsc_sync = EXCLUDED.has_gsc_sync,
        has_striking_distance = EXCLUDED.has_striking_distance,
        has_traffic_drop_engine = EXCLUDED.has_traffic_drop_engine,
        has_keyword_clustering = EXCLUDED.has_keyword_clustering,
        has_team_seats = EXCLUDED.has_team_seats,
        has_api_access = EXCLUDED.has_api_access,
        has_white_label_reports = EXCLUDED.has_white_label_reports,
        updated_at = NOW();

    -- Also update organizations table max limits for backward compatibility
    UPDATE public.organizations
    SET 
        max_websites = v_max_websites,
        max_crawled_pages_per_audit = v_max_crawled_pages,
        updated_at = NOW()
    WHERE id = target_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger: Automatically Sync Entitlements when Organization is Created or Plan is Updated
CREATE OR REPLACE FUNCTION public.handle_org_plan_update()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.sync_organization_entitlements(NEW.id, NEW.plan);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_org_plan_update ON public.organizations;
CREATE TRIGGER trg_org_plan_update
AFTER INSERT OR UPDATE OF plan ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.handle_org_plan_update();

-- 7. Populate Entitlements for Existing Organizations
DO $$
DECLARE
    org_rec RECORD;
BEGIN
    FOR org_rec IN SELECT id, plan FROM public.organizations LOOP
        PERFORM public.sync_organization_entitlements(org_rec.id, COALESCE(org_rec.plan, 'free'));
    END LOOP;
END $$;

-- 8. Row Level Security Policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- Subscriptions Policies
DROP POLICY IF EXISTS "Allow select subscriptions" ON public.subscriptions;
CREATE POLICY "Allow select subscriptions" ON public.subscriptions 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert subscriptions" ON public.subscriptions;
CREATE POLICY "Allow insert subscriptions" ON public.subscriptions 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update subscriptions" ON public.subscriptions;
CREATE POLICY "Allow update subscriptions" ON public.subscriptions 
FOR UPDATE USING (true);

-- Entitlements Policies
DROP POLICY IF EXISTS "Allow select subscription_entitlements" ON public.subscription_entitlements;
CREATE POLICY "Allow select subscription_entitlements" ON public.subscription_entitlements 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert subscription_entitlements" ON public.subscription_entitlements;
CREATE POLICY "Allow insert subscription_entitlements" ON public.subscription_entitlements 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update subscription_entitlements" ON public.subscription_entitlements;
CREATE POLICY "Allow update subscription_entitlements" ON public.subscription_entitlements 
FOR UPDATE USING (true);

-- Usage Records Policies
DROP POLICY IF EXISTS "Allow select usage_records" ON public.usage_records;
CREATE POLICY "Allow select usage_records" ON public.usage_records 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow upsert usage_records" ON public.usage_records;
CREATE POLICY "Allow upsert usage_records" ON public.usage_records 
FOR ALL USING (true);
