import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { storage } from '@/lib/storage';
import { getServerAuthContext } from '@/lib/auth-server';
import { discoverSeoOpportunities } from '@/lib/gsc/opportunity-engine';
import { SeoOpportunity, SeoOpportunityCategory, ActionItem } from '@/lib/types';
import { generateUuid, isValidUuid } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const websiteId = searchParams.get('websiteId') || undefined;
    const category = searchParams.get('category') as SeoOpportunityCategory | 'all' | null;
    const priority = searchParams.get('priority') || 'all';
    const status = searchParams.get('status') || 'all';
    const querySearch = searchParams.get('q')?.toLowerCase() || '';

    let opps = await db.getOpportunities(websiteId, req);

    // If no opportunities found for this website yet, attempt on-the-fly discovery from GSC + audit findings
    if (opps.length === 0 && websiteId) {
      const gscRows = await db.getGscMetrics(websiteId, req);
      const auditFindings = await db.getFindings(undefined, websiteId, req);
      const site = await db.getWebsiteById(websiteId, req);

      if (gscRows.length > 0) {
        opps = discoverSeoOpportunities(websiteId, gscRows, {
          auditFindings,
          brandConfig: {
            brandNames: [site?.name || 'brand', site?.domain?.replace(/\..*$/, '') || 'domain'].filter(Boolean),
            competitorNames: [],
          },
          minImpressions: 50,
          generateAiOverviewOpps: true,
          generateGeoAeoOpps: true,
        });
        await db.saveOpportunities(websiteId, opps, req);
      }
    }

    // Apply Filters
    let filtered = opps;
    if (category && category !== 'all') {
      filtered = filtered.filter(o => o.category === category || o.type === category);
    }
    if (priority && priority !== 'all') {
      filtered = filtered.filter(o => (o.priority || o.potentialImpact) === priority);
    }
    if (status && status !== 'all') {
      filtered = filtered.filter(o => (o.status || 'open') === status);
    }
    if (querySearch) {
      filtered = filtered.filter(o =>
        o.query.toLowerCase().includes(querySearch) ||
        o.pageUrl.toLowerCase().includes(querySearch) ||
        (o.title && o.title.toLowerCase().includes(querySearch))
      );
    }

    return NextResponse.json({
      success: true,
      totalCount: opps.length,
      filteredCount: filtered.length,
      opportunities: filtered,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getServerAuthContext(req);
    const body = await req.json();
    const { action = 'add_to_action_center', opportunityId, opportunity, websiteId, brandNames, competitorNames } = body;

    // Action A: Add Opportunity to Action Center (Section 8)
    if (action === 'add_to_action_center') {
      let targetOpp: SeoOpportunity | undefined = opportunity;

      if (!targetOpp && opportunityId) {
        const allOpps = await db.getOpportunities(websiteId, req);
        targetOpp = allOpps.find(o => o.id === opportunityId);
      }

      if (!targetOpp) {
        return NextResponse.json(
          { success: false, error: 'Opportunity not found or missing from request payload.' },
          { status: 404 }
        );
      }

      // Check for duplicate in existing tasks
      const existingTasks = await db.getActionItems(targetOpp.websiteId, req);
      const isDuplicate = existingTasks.find(a =>
        a.sourceId === targetOpp!.id ||
        (a.targetKeyword?.toLowerCase() === targetOpp!.query.toLowerCase() &&
         a.affectedUrl === targetOpp!.pageUrl &&
         ['todo', 'in_progress', 'verification_pending'].includes(a.status))
      );

      if (isDuplicate) {
        return NextResponse.json({
          success: true,
          task: isDuplicate,
          isDuplicate: true,
          message: `Task already exists in Action Center: "${isDuplicate.title}"`,
        });
      }

      // Map Category constraint ('technical' | 'content' | 'geo' | 'aeo' | 'indexability')
      let taskCategory: ActionItem['category'] = 'content';
      if (targetOpp.category === 'technical_seo') taskCategory = 'technical';
      else if (targetOpp.category === 'internal_linking') taskCategory = 'technical';
      else if (targetOpp.category === 'geo_aeo') taskCategory = 'geo';
      else if (targetOpp.category === 'ai_overviews') taskCategory = 'aeo';

      const task = await db.createActionItem({
        id: generateUuid(),
        organizationId: auth.organizationId || 'default-org',
        websiteId: targetOpp.websiteId,
        sourceType: 'seo_opportunity',
        sourceId: targetOpp.id,
        title: targetOpp.title || `Optimize: "${targetOpp.query}"`,
        description: targetOpp.whyItMatters || targetOpp.hypothesis,
        category: taskCategory,
        priority: targetOpp.priority || (targetOpp.potentialImpact === 'critical' ? 'critical' : targetOpp.potentialImpact === 'high' ? 'high' : 'medium'),
        affectedUrl: targetOpp.pageUrl,
        recommendedSolution: targetOpp.recommendedAction,
        steps: targetOpp.implementationSteps && targetOpp.implementationSteps.length > 0 ? targetOpp.implementationSteps : [
          `Review SERP snippet ranking for query: "${targetOpp.query}"`,
          `Update title and meta description on ${targetOpp.pageUrl} to align with search intent`,
          `Add contextual internal link anchors from related articles`,
          `Request re-indexing via Google Search Console`,
        ],
        targetKeyword: targetOpp.query,
        opportunityCategory: targetOpp.category || targetOpp.type,
        baselineMetrics: {
          clicks: targetOpp.clicks,
          impressions: targetOpp.impressions,
          ctr: targetOpp.ctr,
          position: targetOpp.position,
          date: new Date().toISOString(),
        },
        expectedOutcome: targetOpp.expectedBenefit || 'Improve organic click capture and search visibility.',
        evidenceSummary: targetOpp.hypothesis,
        relatedAuditFindings: targetOpp.evidence?.auditFindings || [],
        verificationCriteria: targetOpp.verificationMethod || `Verify improved GSC clicks and CTR for "${targetOpp.query}" post-optimization.`,
        verificationMethod: targetOpp.verificationMethod,
        status: 'todo',
        verificationStatus: 'unverified',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      }, req);

      // Mark opportunity status as actioned
      targetOpp.status = 'actioned';
      const allOpps = await db.getOpportunities(targetOpp.websiteId, req);
      const updatedOpps = allOpps.map(o => o.id === targetOpp!.id ? { ...o, status: 'actioned' as const } : o);
      await db.saveOpportunities(targetOpp.websiteId, updatedOpps, req);

      return NextResponse.json({
        success: true,
        task,
        isDuplicate: false,
        message: `Task successfully added to Action Center: "${task.title}"`,
      });
    }

    // Action B: Regenerate Opportunities
    if (action === 'regenerate') {
      if (!websiteId) {
        return NextResponse.json({ success: false, error: 'websiteId is required to regenerate opportunities.' }, { status: 400 });
      }
      const gscRows = await db.getGscMetrics(websiteId, req);
      const auditFindings = await db.getFindings(undefined, websiteId, req);
      const site = await db.getWebsiteById(websiteId, req);

      const opps = discoverSeoOpportunities(websiteId, gscRows, {
        auditFindings,
        brandConfig: {
          brandNames: brandNames || [site?.name || 'brand', site?.domain?.replace(/\..*$/, '') || 'domain'].filter(Boolean),
          competitorNames: competitorNames || [],
        },
        minImpressions: 50,
        generateAiOverviewOpps: true,
        generateGeoAeoOpps: true,
      });

      await db.saveOpportunities(websiteId, opps, req);

      return NextResponse.json({
        success: true,
        opportunitiesCount: opps.length,
        opportunities: opps,
      });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, websiteId } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'id and status are required.' }, { status: 400 });
    }

    const allOpps = await db.getOpportunities(websiteId, req);
    const target = allOpps.find(o => o.id === id);
    if (!target) {
      return NextResponse.json({ success: false, error: 'Opportunity not found.' }, { status: 404 });
    }

    target.status = status;
    await db.saveOpportunities(target.websiteId, allOpps, req);

    return NextResponse.json({ success: true, opportunity: target });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
