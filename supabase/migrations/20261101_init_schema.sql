-- RankPilot AI: Master Database Schema with Row Level Security (RLS)
-- Optimized for PostgreSQL / Supabase

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (Linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Organizations (Agency Multi-Tenancy)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'solo', 'agency', 'enterprise')),
    billing_email TEXT,
    max_websites INT DEFAULT 3,
    max_crawled_pages_per_audit INT DEFAULT 25,
    max_ai_analyses_per_month INT DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Memberships (Organization User Roles)
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 4. Invitations
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    token TEXT NOT NULL UNIQUE,
    invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Websites
CREATE TABLE IF NOT EXISTS websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    url TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
    latest_seo_score NUMERIC(5,2),
    latest_geo_score NUMERIC(5,2),
    latest_aeo_score NUMERIC(5,2),
    last_audited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Website Settings
CREATE TABLE IF NOT EXISTS website_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE UNIQUE,
    crawl_depth_limit INT DEFAULT 2,
    max_crawl_pages INT DEFAULT 25,
    crawl_rate_limit_ms INT DEFAULT 500,
    user_agent TEXT DEFAULT 'RankPilotAI-AuditBot/1.0',
    enable_geo_analysis BOOLEAN DEFAULT TRUE,
    enable_aeo_analysis BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. OAuth Connections (Encrypted token store)
CREATE TABLE IF NOT EXISTS oauth_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
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

-- 8. GSC Properties
CREATE TABLE IF NOT EXISTS gsc_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE UNIQUE,
    oauth_connection_id UUID REFERENCES oauth_connections(id) ON DELETE SET NULL,
    property_url TEXT NOT NULL,
    permission_level TEXT,
    is_connected BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. GSC Sync History
CREATE TABLE IF NOT EXISTS gsc_sync_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    sync_status TEXT NOT NULL CHECK (sync_status IN ('success', 'partial', 'failed', 'running')),
    records_synced INT DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 10. GSC Metrics
CREATE TABLE IF NOT EXISTS gsc_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_gsc_metrics_lookup ON gsc_metrics(website_id, date, page_url);

-- 11. Audit Runs
CREATE TABLE IF NOT EXISTS audit_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'crawling', 'analyzing', 'completed', 'failed')),
    pages_crawled INT DEFAULT 0,
    pages_failed INT DEFAULT 0,
    seo_score NUMERIC(5,2),
    geo_score NUMERIC(5,2),
    aeo_score NUMERIC(5,2),
    crawl_duration_ms INT,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 12. Audit Pages
CREATE TABLE IF NOT EXISTS audit_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_run_id UUID NOT NULL REFERENCES audit_runs(id) ON DELETE CASCADE,
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

-- 13. Audit Findings
CREATE TABLE IF NOT EXISTS audit_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_run_id UUID NOT NULL REFERENCES audit_runs(id) ON DELETE CASCADE,
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
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

-- 14. Audit Evidence
CREATE TABLE IF NOT EXISTS audit_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID NOT NULL REFERENCES audit_findings(id) ON DELETE CASCADE,
    expected_condition TEXT NOT NULL,
    actual_condition TEXT NOT NULL,
    snippet TEXT,
    http_headers JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Score History
CREATE TABLE IF NOT EXISTS score_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    audit_run_id UUID REFERENCES audit_runs(id) ON DELETE SET NULL,
    seo_score NUMERIC(5,2) NOT NULL,
    geo_score NUMERIC(5,2) NOT NULL,
    aeo_score NUMERIC(5,2) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Scoring Methodologies (Versioned transparent formulas)
CREATE TABLE IF NOT EXISTS scoring_methodologies (
    version TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    rules JSONB NOT NULL,
    active_from TIMESTAMPTZ DEFAULT NOW()
);

-- 17. SEO Opportunities
CREATE TABLE IF NOT EXISTS seo_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
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

-- 18. Traffic Investigations
CREATE TABLE IF NOT EXISTS traffic_investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
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

-- 19. Action Items (Action Center Tasks)
CREATE TABLE IF NOT EXISTS action_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
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
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    due_date DATE,
    completed_at TIMESTAMPTZ,
    user_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Action History
CREATE TABLE IF NOT EXISTS action_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_item_id UUID NOT NULL REFERENCES action_items(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    field_changed TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Verification Runs
CREATE TABLE IF NOT EXISTS verification_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_item_id UUID NOT NULL REFERENCES action_items(id) ON DELETE CASCADE,
    audit_run_id UUID REFERENCES audit_runs(id) ON DELETE SET NULL,
    outcome TEXT NOT NULL CHECK (outcome IN ('completed_verified', 'completed_not_verified', 'still_unresolved', 'unable_to_verify')),
    explanation TEXT NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Verification Evidence
CREATE TABLE IF NOT EXISTS verification_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_run_id UUID NOT NULL REFERENCES verification_runs(id) ON DELETE CASCADE,
    before_state TEXT NOT NULL,
    after_state TEXT NOT NULL,
    raw_proof TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('traffic_drop', 'critical_finding', 'audit_completed', 'task_verified', 'sync_failed')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'success')),
    is_read BOOLEAN DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    traffic_drops BOOLEAN DEFAULT TRUE,
    critical_issues BOOLEAN DEFAULT TRUE,
    audit_completion BOOLEAN DEFAULT TRUE,
    task_verification BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. Reports
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    report_data JSONB NOT NULL,
    generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. Finding Feedback (Human-in-the-loop validation)
CREATE TABLE IF NOT EXISTS finding_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID NOT NULL REFERENCES audit_findings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('correct', 'incorrect', 'not_relevant', 'needs_review')),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. Usage Records
CREATE TABLE IF NOT EXISTS usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    metric TEXT NOT NULL CHECK (metric IN ('pages_crawled', 'audits_run', 'ai_tokens', 'gsc_syncs', 'reports_generated')),
    quantity INT NOT NULL DEFAULT 1,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user organizations
CREATE OR REPLACE FUNCTION get_user_org_ids(user_uuid UUID)
RETURNS TABLE (org_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT organization_id FROM memberships WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Organizations: Accessible only by members
CREATE POLICY "Members can view their organizations" ON organizations
    FOR SELECT USING (id IN (SELECT get_user_org_ids(auth.uid())));

-- Websites: Accessible only by organization members
CREATE POLICY "Members can view organization websites" ON websites
    FOR SELECT USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));
CREATE POLICY "Members can insert organization websites" ON websites
    FOR INSERT WITH CHECK (organization_id IN (SELECT get_user_org_ids(auth.uid())));
CREATE POLICY "Members can update organization websites" ON websites
    FOR UPDATE USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));
CREATE POLICY "Members can delete organization websites" ON websites
    FOR DELETE USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));

-- Action Items: Accessible only by organization members
CREATE POLICY "Members can view action items" ON action_items
    FOR SELECT USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));
CREATE POLICY "Members can update action items" ON action_items
    FOR UPDATE USING (organization_id IN (SELECT get_user_org_ids(auth.uid())));
