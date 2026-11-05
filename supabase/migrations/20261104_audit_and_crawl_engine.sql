-- ==============================================================================
-- RANKPILOT AI: AUDIT & CRAWL ENGINE MASTER MIGRATION
-- Migration Date: November 4, 2026
-- Adds durable crawl_jobs table, extends audit_runs, audit_findings,
-- action_items, and reports, establishes strict RLS policies, and
-- prevents duplicate task creation per finding.
-- ==============================================================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CRAWL JOBS TABLE (DURABLE BACKGROUND PROCESSING)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crawl_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
    audit_run_id UUID,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'queued',
        'crawling',
        'analyzing',
        'generating_recommendations',
        'completed',
        'partially_completed',
        'failed',
        'cancelled'
    )),
    progress_percent INT DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    current_stage TEXT DEFAULT 'Initialized',
    urls_discovered INT DEFAULT 0,
    urls_crawled INT DEFAULT 0,
    urls_remaining INT DEFAULT 0,
    urls_failed INT DEFAULT 0,
    max_pages INT DEFAULT 10,
    max_depth INT DEFAULT 2,
    crawl_options JSONB DEFAULT '{}'::jsonb,
    discovered_urls JSONB DEFAULT '[]'::jsonb,
    crawled_urls JSONB DEFAULT '[]'::jsonb,
    failed_urls JSONB DEFAULT '[]'::jsonb,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for crawl_jobs
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_website_id ON public.crawl_jobs(website_id);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_organization_id ON public.crawl_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_status ON public.crawl_jobs(status);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_created_at ON public.crawl_jobs(created_at DESC);

-- ==============================================================================
-- 3. EXTEND AUDIT RUNS TABLE
-- ==============================================================================
DO $$
BEGIN
    -- Add organization_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'audit_runs' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.audit_runs ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;

    -- Add technical_score
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'audit_runs' AND column_name = 'technical_score'
    ) THEN
        ALTER TABLE public.audit_runs ADD COLUMN technical_score NUMERIC(5,2) DEFAULT 0;
    END IF;

    -- Add is_provisional_score
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'audit_runs' AND column_name = 'is_provisional_score'
    ) THEN
        ALTER TABLE public.audit_runs ADD COLUMN is_provisional_score BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add urls_discovered
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'audit_runs' AND column_name = 'urls_discovered'
    ) THEN
        ALTER TABLE public.audit_runs ADD COLUMN urls_discovered INT DEFAULT 0;
    END IF;

    -- Add score_breakdown
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'audit_runs' AND column_name = 'score_breakdown'
    ) THEN
        ALTER TABLE public.audit_runs ADD COLUMN score_breakdown JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Add crawl_limits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'audit_runs' AND column_name = 'crawl_limits'
    ) THEN
        ALTER TABLE public.audit_runs ADD COLUMN crawl_limits JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Add audit_version
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'audit_runs' AND column_name = 'audit_version'
    ) THEN
        ALTER TABLE public.audit_runs ADD COLUMN audit_version TEXT DEFAULT '2.0';
    END IF;

    -- Add scoring_version
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'audit_runs' AND column_name = 'scoring_version'
    ) THEN
        ALTER TABLE public.audit_runs ADD COLUMN scoring_version TEXT DEFAULT '2.0';
    END IF;
END $$;

-- Update status check constraint on audit_runs to support all lifecycle phases
ALTER TABLE public.audit_runs DROP CONSTRAINT IF EXISTS audit_runs_status_check;
ALTER TABLE public.audit_runs ADD CONSTRAINT audit_runs_status_check CHECK (status IN (
    'pending',
    'queued',
    'crawling',
    'analyzing',
    'generating_recommendations',
    'completed',
    'partially_completed',
    'failed',
    'cancelled'
));

-- Foreign key link from crawl_jobs to audit_runs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public' AND table_name = 'crawl_jobs' AND constraint_name = 'crawl_jobs_audit_run_id_fkey'
    ) THEN
        ALTER TABLE public.crawl_jobs 
        ADD CONSTRAINT crawl_jobs_audit_run_id_fkey 
        FOREIGN KEY (audit_run_id) REFERENCES public.audit_runs(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ==============================================================================
-- 4. EXTEND AUDIT FINDINGS TABLE
-- ==============================================================================
DO $$
BEGIN
    -- Add organization_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'audit_findings' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE public.audit_findings ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;

    -- Add finding_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'audit_findings' AND column_name = 'finding_type'
    ) THEN
        ALTER TABLE public.audit_findings ADD COLUMN finding_type TEXT DEFAULT 'confirmed_error' 
        CHECK (finding_type IN ('confirmed_error', 'warning', 'opportunity', 'informational', 'not_tested'));
    END IF;

    -- Add priority
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'audit_findings' AND column_name = 'priority'
    ) THEN
        ALTER TABLE public.audit_findings ADD COLUMN priority TEXT DEFAULT 'medium' 
        CHECK (priority IN ('critical', 'high', 'medium', 'low'));
    END IF;

    -- Add why_it_matters
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'audit_findings' AND column_name = 'why_it_matters'
    ) THEN
        ALTER TABLE public.audit_findings ADD COLUMN why_it_matters TEXT;
    END IF;

    -- Add implementation_steps
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'audit_findings' AND column_name = 'implementation_steps'
    ) THEN
        ALTER TABLE public.audit_findings ADD COLUMN implementation_steps JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add verification_criteria
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'audit_findings' AND column_name = 'verification_criteria'
    ) THEN
        ALTER TABLE public.audit_findings ADD COLUMN verification_criteria TEXT;
    END IF;

    -- Add estimated_effort
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'audit_findings' AND column_name = 'estimated_effort'
    ) THEN
        ALTER TABLE public.audit_findings ADD COLUMN estimated_effort TEXT DEFAULT 'moderate'
        CHECK (estimated_effort IN ('quick_fix', 'moderate', 'complex'));
    END IF;

    -- Add first_detected_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'audit_findings' AND column_name = 'first_detected_at'
    ) THEN
        ALTER TABLE public.audit_findings ADD COLUMN first_detected_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Add last_detected_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'audit_findings' AND column_name = 'last_detected_at'
    ) THEN
        ALTER TABLE public.audit_findings ADD COLUMN last_detected_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Indexes for audit_findings
CREATE INDEX IF NOT EXISTS idx_audit_findings_lookup ON public.audit_findings(website_id, issue_type, url);
CREATE INDEX IF NOT EXISTS idx_audit_findings_audit_run_id ON public.audit_findings(audit_run_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_category ON public.audit_findings(category);
CREATE INDEX IF NOT EXISTS idx_audit_findings_severity ON public.audit_findings(severity);

-- ==============================================================================
-- 5. EXTEND ACTION ITEMS TABLE (TASK DEDUPLICATION)
-- ==============================================================================
DO $$
BEGIN
    -- Add finding_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'action_items' AND column_name = 'finding_id'
    ) THEN
        ALTER TABLE public.action_items ADD COLUMN finding_id UUID REFERENCES public.audit_findings(id) ON DELETE SET NULL;
    END IF;

    -- Add audit_run_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'action_items' AND column_name = 'audit_run_id'
    ) THEN
        ALTER TABLE public.action_items ADD COLUMN audit_run_id UUID REFERENCES public.audit_runs(id) ON DELETE SET NULL;
    END IF;

    -- Add severity
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'action_items' AND column_name = 'severity'
    ) THEN
        ALTER TABLE public.action_items ADD COLUMN severity TEXT DEFAULT 'medium';
    END IF;

    -- Add verification_criteria
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'action_items' AND column_name = 'verification_criteria'
    ) THEN
        ALTER TABLE public.action_items ADD COLUMN verification_criteria TEXT;
    END IF;

    -- Add estimated_effort
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'action_items' AND column_name = 'estimated_effort'
    ) THEN
        ALTER TABLE public.action_items ADD COLUMN estimated_effort TEXT DEFAULT 'moderate';
    END IF;
END $$;

-- Ensure duplicate active tasks cannot be created for the same finding
CREATE UNIQUE INDEX IF NOT EXISTS idx_action_items_unique_active_finding
ON public.action_items(website_id, finding_id)
WHERE finding_id IS NOT NULL AND status IN ('todo', 'in_progress');

-- ==============================================================================
-- 6. EXTEND REPORTS TABLE
-- ==============================================================================
DO $$
BEGIN
    -- Add audit_run_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'reports' AND column_name = 'audit_run_id'
    ) THEN
        ALTER TABLE public.reports ADD COLUMN audit_run_id UUID REFERENCES public.audit_runs(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reports_audit_run_id ON public.reports(audit_run_id);
CREATE INDEX IF NOT EXISTS idx_reports_website_id ON public.reports(website_id);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) FOR CRAWL JOBS & AUDITS
-- ==============================================================================
ALTER TABLE public.crawl_jobs ENABLE ROW LEVEL SECURITY;

-- Helper to safely check organization membership
DROP POLICY IF EXISTS "Members can view organization crawl jobs" ON public.crawl_jobs;
CREATE POLICY "Members can view organization crawl jobs" ON public.crawl_jobs
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
        OR public.is_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Members can insert organization crawl jobs" ON public.crawl_jobs;
CREATE POLICY "Members can insert organization crawl jobs" ON public.crawl_jobs
    FOR INSERT WITH CHECK (
        organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
        OR public.is_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Members can update organization crawl jobs" ON public.crawl_jobs;
CREATE POLICY "Members can update organization crawl jobs" ON public.crawl_jobs
    FOR UPDATE USING (
        organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
        OR public.is_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Members can delete organization crawl jobs" ON public.crawl_jobs;
CREATE POLICY "Members can delete organization crawl jobs" ON public.crawl_jobs
    FOR DELETE USING (
        organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid())
        OR public.is_admin(auth.uid())
    );
