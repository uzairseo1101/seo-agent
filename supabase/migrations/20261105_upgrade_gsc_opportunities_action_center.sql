-- RankPilot AI Migration: Upgrade GSC, Opportunities & Action Center Modules
-- Migration Date: 2026-11-05

-- 1. Extend SEO Opportunities Table
ALTER TABLE IF EXISTS seo_opportunities
    ADD COLUMN IF NOT EXISTS category TEXT,
    ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    ADD COLUMN IF NOT EXISTS confidence_level TEXT CHECK (confidence_level IN ('high', 'medium', 'low')),
    ADD COLUMN IF NOT EXISTS why_it_matters TEXT,
    ADD COLUMN IF NOT EXISTS expert_explanation TEXT,
    ADD COLUMN IF NOT EXISTS recommended_strategy TEXT,
    ADD COLUMN IF NOT EXISTS implementation_steps JSONB,
    ADD COLUMN IF NOT EXISTS expected_benefit TEXT,
    ADD COLUMN IF NOT EXISTS verification_method TEXT,
    ADD COLUMN IF NOT EXISTS evidence JSONB;

-- Drop obsolete type CHECK constraint on seo_opportunities if present to allow new category-based types
DO $$
BEGIN
    ALTER TABLE seo_opportunities DROP CONSTRAINT IF EXISTS seo_opportunities_type_check;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Add updated type constraint supporting all standard and extended opportunity types
ALTER TABLE seo_opportunities
    ADD CONSTRAINT seo_opportunities_type_check
    CHECK (type IN (
        'high_impressions_low_ctr',
        'striking_distance_5_20',
        'declining_ctr',
        'content_expansion',
        'keyword_cannibalization',
        'zero_clicks_with_impressions',
        'question_intent_optimization',
        'technical_audit_impact',
        'high_performing_keyword_expansion',
        'ai_overview_readiness',
        'geo_aeo_readiness'
    ));

-- 2. Extend Action Items Table
ALTER TABLE IF EXISTS action_items
    ADD COLUMN IF NOT EXISTS target_keyword TEXT,
    ADD COLUMN IF NOT EXISTS opportunity_category TEXT,
    ADD COLUMN IF NOT EXISTS baseline_metrics JSONB,
    ADD COLUMN IF NOT EXISTS latest_metrics JSONB,
    ADD COLUMN IF NOT EXISTS metric_delta JSONB,
    ADD COLUMN IF NOT EXISTS expected_outcome TEXT,
    ADD COLUMN IF NOT EXISTS evidence_summary TEXT,
    ADD COLUMN IF NOT EXISTS related_audit_findings JSONB,
    ADD COLUMN IF NOT EXISTS verification_method TEXT,
    ADD COLUMN IF NOT EXISTS verification_explanation TEXT;

-- Update action_items status constraint to support extended lifecycle
DO $$
BEGIN
    ALTER TABLE action_items DROP CONSTRAINT IF EXISTS action_items_status_check;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE action_items
    ADD CONSTRAINT action_items_status_check
    CHECK (status IN (
        'todo',
        'in_progress',
        'completed',
        'verification_pending',
        'verified',
        'not_improved',
        'dismissed'
    ));

-- Update action_items verification_status constraint
DO $$
BEGIN
    ALTER TABLE action_items DROP CONSTRAINT IF EXISTS action_items_verification_status_check;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE action_items
    ADD CONSTRAINT action_items_verification_status_check
    CHECK (verification_status IN (
        'unverified',
        'completed_verified',
        'completed_not_verified',
        'still_unresolved',
        'unable_to_verify',
        'verified',
        'not_improved'
    ));

-- 3. Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_seo_opportunities_lookup ON seo_opportunities(website_id, category, status);
CREATE INDEX IF NOT EXISTS idx_action_items_query ON action_items(website_id, target_keyword, status);
CREATE INDEX IF NOT EXISTS idx_gsc_metrics_query_lookup ON gsc_metrics(website_id, query);
