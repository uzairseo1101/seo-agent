-- ==============================================================================
-- RANKPILOT AI: MULTI-TENANT DATA ISOLATION & RLS REPAIR MIGRATION
-- Migration Date: November 3, 2026
-- Fixes:
-- 1. Automates user workspace creation (profiles + organizations + memberships) on auth.users insert.
-- 2. Backfills memberships for all registered users so each user owns their workspace.
-- 3. Sets founder/admin account as superadmin owning the initial agency organization.
-- 4. Replaces insecure permissive RLS policies with strict workspace membership isolation.
-- 5. Removes dummy/mock records ('saasflow.io', 'Apex Growth Marketing') cleanly without UUID errors.
-- ==============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean Up Any Accidental Legacy Mock Records Safely
DELETE FROM public.websites
WHERE domain IN ('saasflow.io', 'nordicclean.com', 'zenithlaw.co.uk')
   OR name IN ('SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners');

DELETE FROM public.organizations
WHERE id = '00000000-0000-0000-0000-000000000001'
   OR slug = 'apex-growth'
   OR name = 'Apex Growth Marketing';

-- 3. Create or Replace Helper: is_admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Helper: get_user_organizations (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_organizations(uid UUID)
RETURNS SETOF UUID AS $$
  SELECT organization_id FROM public.memberships WHERE user_id = uid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 5. Helper: sync_organization_entitlements
CREATE OR REPLACE FUNCTION public.sync_organization_entitlements(target_org_id UUID, target_plan TEXT)
RETURNS VOID AS $$
DECLARE
    v_max_sites INTEGER := 1;
    v_max_pages INTEGER := 10;
    v_history INTEGER := 3;
    v_geo BOOLEAN := FALSE;
    v_aeo BOOLEAN := FALSE;
    v_gsc BOOLEAN := FALSE;
    v_striking BOOLEAN := FALSE;
    v_traffic BOOLEAN := FALSE;
    v_auto_verif BOOLEAN := FALSE;
    v_pdf BOOLEAN := FALSE;
    v_seats INTEGER := 1;
BEGIN
    IF target_plan = 'freelancer' THEN
        v_max_sites := 3;
        v_max_pages := 25;
        v_history := 90;
        v_geo := TRUE;
        v_aeo := TRUE;
        v_gsc := TRUE;
        v_auto_verif := TRUE;
        v_pdf := TRUE;
    ELSIF target_plan = 'agency' THEN
        v_max_sites := 15;
        v_max_pages := 100;
        v_history := 365;
        v_geo := TRUE;
        v_aeo := TRUE;
        v_gsc := TRUE;
        v_striking := TRUE;
        v_traffic := TRUE;
        v_auto_verif := TRUE;
        v_pdf := TRUE;
        v_seats := 5;
    ELSIF target_plan = 'team' THEN
        v_max_sites := 50;
        v_max_pages := 500;
        v_history := 9999;
        v_geo := TRUE;
        v_aeo := TRUE;
        v_gsc := TRUE;
        v_striking := TRUE;
        v_traffic := TRUE;
        v_auto_verif := TRUE;
        v_pdf := TRUE;
        v_seats := 999;
    END IF;

    UPDATE public.organizations
    SET plan = target_plan,
        max_websites = v_max_sites,
        max_crawled_pages_per_audit = v_max_pages,
        updated_at = NOW()
    WHERE id = target_org_id;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscription_entitlements') THEN
        INSERT INTO public.subscription_entitlements (
            organization_id, plan, max_websites, max_crawled_pages_per_audit,
            audit_history_retention_days, geo_aeo_scoring_enabled,
            gsc_sync_enabled, striking_distance_enabled, traffic_drop_investigation_enabled,
            automated_task_verification_enabled, pdf_client_reports_enabled, team_member_seats
        )
        VALUES (
            target_org_id, target_plan, v_max_sites, v_max_pages,
            v_history, v_geo,
            v_gsc, v_striking, v_traffic,
            v_auto_verif, v_pdf, v_seats
        )
        ON CONFLICT (organization_id) DO UPDATE SET
            plan = EXCLUDED.plan,
            max_websites = EXCLUDED.max_websites,
            max_crawled_pages_per_audit = EXCLUDED.max_crawled_pages_per_audit,
            audit_history_retention_days = EXCLUDED.audit_history_retention_days,
            geo_aeo_scoring_enabled = EXCLUDED.geo_aeo_scoring_enabled,
            gsc_sync_enabled = EXCLUDED.gsc_sync_enabled,
            striking_distance_enabled = EXCLUDED.striking_distance_enabled,
            traffic_drop_investigation_enabled = EXCLUDED.traffic_drop_investigation_enabled,
            automated_task_verification_enabled = EXCLUDED.automated_task_verification_enabled,
            pdf_client_reports_enabled = EXCLUDED.pdf_client_reports_enabled,
            team_member_seats = EXCLUDED.team_member_seats,
            updated_at = NOW();
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger Function: Automatically create workspace on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    org_name TEXT;
    user_name TEXT;
    user_role TEXT := 'user';
BEGIN
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    IF user_name IS NULL OR TRIM(user_name) = '' THEN
        user_name := 'User';
    END IF;
    org_name := user_name || '''s Workspace';

    -- Check if founder email
    IF NEW.email = 'uzairnoor1101@gmail.com' THEN
        user_role := 'superadmin';
    END IF;

    -- 6.1 Insert Profile
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, user_name, user_role)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);

    -- 6.2 If founder and initial organization exists, attach to it
    IF NEW.email = 'uzairnoor1101@gmail.com' AND EXISTS (SELECT 1 FROM public.organizations WHERE id = '2fff7e42-627e-4582-8982-aa8463bf9fca') THEN
        INSERT INTO public.memberships (organization_id, user_id, role)
        VALUES ('2fff7e42-627e-4582-8982-aa8463bf9fca', NEW.id, 'owner')
        ON CONFLICT (organization_id, user_id) DO NOTHING;
    ELSE
        -- Create fresh personal workspace
        new_org_id := gen_random_uuid();
        INSERT INTO public.organizations (id, name, slug, plan, max_websites, max_crawled_pages_per_audit)
        VALUES (new_org_id, org_name, 'org-' || SUBSTRING(new_org_id::text FROM 1 FOR 8), 'free', 1, 10);

        INSERT INTO public.memberships (organization_id, user_id, role)
        VALUES (new_org_id, NEW.id, 'owner')
        ON CONFLICT (organization_id, user_id) DO NOTHING;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') THEN
            INSERT INTO public.subscriptions (organization_id, provider, plan, billing_cycle, status)
            VALUES (new_org_id, 'free', 'free', 'monthly', 'active')
            ON CONFLICT DO NOTHING;
        END IF;

        PERFORM public.sync_organization_entitlements(new_org_id, 'free');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Backfill all existing users in auth.users
DO $$
DECLARE
    u_rec RECORD;
    new_org_id UUID;
    org_name TEXT;
    user_name TEXT;
    user_role TEXT;
BEGIN
    FOR u_rec IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
        user_name := COALESCE(u_rec.raw_user_meta_data->>'full_name', split_part(u_rec.email, '@', 1));
        IF user_name IS NULL OR TRIM(user_name) = '' THEN
            user_name := 'User';
        END IF;
        org_name := user_name || '''s Workspace';
        
        IF u_rec.email = 'uzairnoor1101@gmail.com' THEN
            user_role := 'superadmin';
        ELSE
            user_role := 'user';
        END IF;

        -- 7.1 Ensure profile exists
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (u_rec.id, u_rec.email, user_name, user_role)
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
            role = CASE WHEN u_rec.email = 'uzairnoor1101@gmail.com' THEN 'superadmin' ELSE public.profiles.role END;

        -- 7.2 If founder, link to initial agency organization with breachit.pk
        IF u_rec.email = 'uzairnoor1101@gmail.com' AND EXISTS (SELECT 1 FROM public.organizations WHERE id = '2fff7e42-627e-4582-8982-aa8463bf9fca') THEN
            INSERT INTO public.memberships (organization_id, user_id, role)
            VALUES ('2fff7e42-627e-4582-8982-aa8463bf9fca', u_rec.id, 'owner')
            ON CONFLICT (organization_id, user_id) DO NOTHING;
        ELSE
            -- Check if user already has a membership
            IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE user_id = u_rec.id) THEN
                new_org_id := gen_random_uuid();
                INSERT INTO public.organizations (id, name, slug, plan, max_websites, max_crawled_pages_per_audit)
                VALUES (new_org_id, org_name, 'org-' || SUBSTRING(new_org_id::text FROM 1 FOR 8), 'free', 1, 10);

                INSERT INTO public.memberships (organization_id, user_id, role)
                VALUES (new_org_id, u_rec.id, 'owner')
                ON CONFLICT (organization_id, user_id) DO NOTHING;

                IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') THEN
                    INSERT INTO public.subscriptions (organization_id, provider, plan, billing_cycle, status)
                    VALUES (new_org_id, 'free', 'free', 'monthly', 'active')
                    ON CONFLICT DO NOTHING;
                END IF;

                PERFORM public.sync_organization_entitlements(new_org_id, 'free');
            END IF;
        END IF;
    END LOOP;
END $$;

-- 8. Enable Row Level Security across all customer tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') THEN
        ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscription_entitlements') THEN
        ALTER TABLE public.subscription_entitlements ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 9. Profiles Policies (Users can only see/edit their own profile; admins can view all)
DROP POLICY IF EXISTS "Allow select profiles" ON public.profiles;
CREATE POLICY "Allow select profiles" ON public.profiles
FOR SELECT USING (
    id = auth.uid() OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Allow update profiles" ON public.profiles;
CREATE POLICY "Allow update profiles" ON public.profiles
FOR UPDATE USING (
    id = auth.uid() OR public.is_admin(auth.uid())
);

-- 10. Memberships Policies (Uses direct user_id check to avoid RLS recursion)
DROP POLICY IF EXISTS "Allow select memberships" ON public.memberships;
CREATE POLICY "Allow select memberships" ON public.memberships
FOR SELECT USING (
    user_id = auth.uid()
    OR organization_id IN (SELECT public.get_user_organizations(auth.uid()))
    OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Allow insert memberships" ON public.memberships;
CREATE POLICY "Allow insert memberships" ON public.memberships
FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR organization_id IN (SELECT public.get_user_organizations(auth.uid()))
    OR public.is_admin(auth.uid())
);

-- 11. Organizations Policies (Users can only access organizations they are members of)
DROP POLICY IF EXISTS "Allow select organizations" ON public.organizations;
CREATE POLICY "Allow select organizations" ON public.organizations
FOR SELECT USING (
    id IN (SELECT public.get_user_organizations(auth.uid()))
    OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Allow update organizations" ON public.organizations;
CREATE POLICY "Allow update organizations" ON public.organizations
FOR UPDATE USING (
    id IN (SELECT public.get_user_organizations(auth.uid()))
    OR public.is_admin(auth.uid())
);

-- 12. Websites Policies (Strict Multi-Tenant Isolation)
DROP POLICY IF EXISTS "Allow select websites" ON public.websites;
CREATE POLICY "Allow select websites" ON public.websites
FOR SELECT USING (
    organization_id IN (SELECT public.get_user_organizations(auth.uid()))
    OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Allow insert websites" ON public.websites;
CREATE POLICY "Allow insert websites" ON public.websites
FOR INSERT WITH CHECK (
    organization_id IN (SELECT public.get_user_organizations(auth.uid()))
    OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Allow update websites" ON public.websites;
CREATE POLICY "Allow update websites" ON public.websites
FOR UPDATE USING (
    organization_id IN (SELECT public.get_user_organizations(auth.uid()))
    OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Allow delete websites" ON public.websites;
CREATE POLICY "Allow delete websites" ON public.websites
FOR DELETE USING (
    organization_id IN (SELECT public.get_user_organizations(auth.uid()))
    OR public.is_admin(auth.uid())
);

-- 13. Audit Runs Policies
DROP POLICY IF EXISTS "Allow select audit_runs" ON public.audit_runs;
CREATE POLICY "Allow select audit_runs" ON public.audit_runs
FOR SELECT USING (
    website_id IN (
        SELECT id FROM public.websites
        WHERE organization_id IN (SELECT public.get_user_organizations(auth.uid()))
    )
    OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Allow insert audit_runs" ON public.audit_runs;
CREATE POLICY "Allow insert audit_runs" ON public.audit_runs
FOR INSERT WITH CHECK (
    website_id IN (
        SELECT id FROM public.websites
        WHERE organization_id IN (SELECT public.get_user_organizations(auth.uid()))
    )
    OR public.is_admin(auth.uid())
);

-- 14. Audit Findings Policies
DROP POLICY IF EXISTS "Allow select audit_findings" ON public.audit_findings;
CREATE POLICY "Allow select audit_findings" ON public.audit_findings
FOR SELECT USING (
    website_id IN (
        SELECT id FROM public.websites
        WHERE organization_id IN (SELECT public.get_user_organizations(auth.uid()))
    )
    OR public.is_admin(auth.uid())
);

-- 15. Action Items Policies
DROP POLICY IF EXISTS "Allow select action_items" ON public.action_items;
CREATE POLICY "Allow select action_items" ON public.action_items
FOR SELECT USING (
    organization_id IN (SELECT public.get_user_organizations(auth.uid()))
    OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Allow insert action_items" ON public.action_items;
CREATE POLICY "Allow insert action_items" ON public.action_items
FOR INSERT WITH CHECK (
    organization_id IN (SELECT public.get_user_organizations(auth.uid()))
    OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Allow update action_items" ON public.action_items;
CREATE POLICY "Allow update action_items" ON public.action_items
FOR UPDATE USING (
    organization_id IN (SELECT public.get_user_organizations(auth.uid()))
    OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Allow delete action_items" ON public.action_items;
CREATE POLICY "Allow delete action_items" ON public.action_items
FOR DELETE USING (
    organization_id IN (SELECT public.get_user_organizations(auth.uid()))
    OR public.is_admin(auth.uid())
);

-- 16. Subscriptions Policies
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') THEN
        DROP POLICY IF EXISTS "Allow select subscriptions" ON public.subscriptions;
        CREATE POLICY "Allow select subscriptions" ON public.subscriptions
        FOR SELECT USING (
            organization_id IN (SELECT public.get_user_organizations(auth.uid()))
            OR public.is_admin(auth.uid())
        );
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscription_entitlements') THEN
        DROP POLICY IF EXISTS "Allow select subscription_entitlements" ON public.subscription_entitlements;
        CREATE POLICY "Allow select subscription_entitlements" ON public.subscription_entitlements
        FOR SELECT USING (
            organization_id IN (SELECT public.get_user_organizations(auth.uid()))
            OR public.is_admin(auth.uid())
        );
    END IF;
END $$;
