-- ==============================================================================
-- RANKPILOT AI — PRODUCTION DATABASE REPAIR & RLS POLICY CORRECTION
-- Ensures websites, audit runs, findings, and tasks persist reliably in Supabase
-- ==============================================================================

-- 1. Ensure Default System Organization exists with valid UUID
INSERT INTO public.organizations (id, name, slug, plan, billing_email, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Apex Growth Marketing',
    'apex-growth',
    'agency',
    'billing@apexgrowth.io',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET updated_at = NOW();

-- 2. Clean Up Any Accidental Legacy Mock Records
DELETE FROM public.websites
WHERE domain IN ('saasflow.io', 'nordicclean.com', 'zenithlaw.co.uk')
   OR name IN ('SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners');

-- 3. Relax / Update Websites RLS Policies
-- Allows both authenticated users and server API requests to perform CRUD
DROP POLICY IF EXISTS "Members can view organization websites" ON public.websites;
DROP POLICY IF EXISTS "Members can insert organization websites" ON public.websites;
DROP POLICY IF EXISTS "Members can update organization websites" ON public.websites;
DROP POLICY IF EXISTS "Members can delete organization websites" ON public.websites;

DROP POLICY IF EXISTS "Allow select websites" ON public.websites;
CREATE POLICY "Allow select websites" ON public.websites
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert websites" ON public.websites;
CREATE POLICY "Allow insert websites" ON public.websites
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update websites" ON public.websites;
CREATE POLICY "Allow update websites" ON public.websites
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete websites" ON public.websites;
CREATE POLICY "Allow delete websites" ON public.websites
    FOR DELETE USING (true);

-- 4. Relax / Update Audit Runs & Findings RLS Policies
DROP POLICY IF EXISTS "Members can view audit runs" ON public.audit_runs;
DROP POLICY IF EXISTS "Members can insert audit runs" ON public.audit_runs;

DROP POLICY IF EXISTS "Allow select audit runs" ON public.audit_runs;
CREATE POLICY "Allow select audit runs" ON public.audit_runs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert audit runs" ON public.audit_runs;
CREATE POLICY "Allow insert audit runs" ON public.audit_runs
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update audit runs" ON public.audit_runs;
CREATE POLICY "Allow update audit runs" ON public.audit_runs
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow select audit findings" ON public.audit_findings;
CREATE POLICY "Allow select audit findings" ON public.audit_findings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert audit findings" ON public.audit_findings;
CREATE POLICY "Allow insert audit findings" ON public.audit_findings
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update audit findings" ON public.audit_findings;
CREATE POLICY "Allow update audit findings" ON public.audit_findings
    FOR UPDATE USING (true);

-- 5. Relax / Update Action Items RLS Policies
DROP POLICY IF EXISTS "Members can view action items" ON public.action_items;
DROP POLICY IF EXISTS "Members can update action items" ON public.action_items;

DROP POLICY IF EXISTS "Allow select action items" ON public.action_items;
CREATE POLICY "Allow select action items" ON public.action_items
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert action items" ON public.action_items;
CREATE POLICY "Allow insert action items" ON public.action_items
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update action items" ON public.action_items;
CREATE POLICY "Allow update action items" ON public.action_items
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete action items" ON public.action_items;
CREATE POLICY "Allow delete action items" ON public.action_items
    FOR DELETE USING (true);

-- 6. Ensure Organizations can be queried
DROP POLICY IF EXISTS "Allow select organizations" ON public.organizations;
CREATE POLICY "Allow select organizations" ON public.organizations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert organizations" ON public.organizations;
CREATE POLICY "Allow insert organizations" ON public.organizations
    FOR INSERT WITH CHECK (true);
