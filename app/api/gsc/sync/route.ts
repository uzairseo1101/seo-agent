import { NextRequest, NextResponse } from 'next/server';
import { syncGscPerformance } from '@/lib/gsc/sync-engine';
import { discoverSeoOpportunities } from '@/lib/gsc/opportunity-engine';
import { storage } from '@/lib/storage';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { websiteId, daysCount = 28, brandNames, competitorNames } = body;

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId is required.' }, { status: 400 });
    }

    const syncResult = await syncGscPerformance(websiteId, daysCount);

    // Persist performance metrics in storage and database
    await db.saveGscMetrics(websiteId, syncResult.metrics, req);

    // Retrieve verified audit findings for connected analysis
    const auditFindings = await db.getFindings(undefined, websiteId, req);

    // Configure brand names
    const site = await db.getWebsiteById(websiteId, req);
    const resolvedBrandNames = (brandNames && Array.isArray(brandNames) && brandNames.length > 0)
      ? brandNames
      : [site?.name || 'brand', site?.domain?.replace(/\..*$/, '') || 'domain'].filter(Boolean);

    // Automatically discover SEO opportunities combining GSC data and verified audit findings
    const opportunities = discoverSeoOpportunities(websiteId, syncResult.metrics, {
      auditFindings,
      brandConfig: {
        brandNames: resolvedBrandNames,
        competitorNames: competitorNames || [],
      },
      minImpressions: 50,
      generateAiOverviewOpps: true,
      generateGeoAeoOpps: true,
    });

    // Save opportunities to storage and database
    await db.saveOpportunities(websiteId, opportunities, req);

    // Emit notification for newly synced data
    storage.addNotification({
      id: `notif-gsc-${Date.now()}`,
      organizationId: storage.getOrganization().id,
      websiteId,
      type: 'audit_completed',
      title: `Search Console Synced: ${syncResult.propertyUrl}`,
      message: `Ingested ${syncResult.recordsSynced} performance rows for ${syncResult.dateRange.start} to ${syncResult.dateRange.end}. Discovered ${opportunities.length} evidence-backed opportunities.`,
      severity: 'success',
      isRead: false,
      linkUrl: '/dashboard/opportunities',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      syncResult,
      opportunitiesCount: opportunities.length,
      opportunities,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
