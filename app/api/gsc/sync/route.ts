import { NextRequest, NextResponse } from 'next/server';
import { syncGscPerformance } from '@/lib/gsc/sync-engine';
import { discoverSeoOpportunities } from '@/lib/gsc/opportunity-engine';
import { storage } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { websiteId, daysCount = 28 } = body;

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId is required.' }, { status: 400 });
    }

    const syncResult = await syncGscPerformance(websiteId, daysCount);

    // Automatically discover SEO opportunities from the synced metrics
    const opportunities = discoverSeoOpportunities(websiteId, syncResult.metrics);

    // Save opportunities to storage
    storage.saveOpportunities(websiteId, opportunities);

    // Emit notification for newly synced data
    storage.addNotification({
      id: `notif-gsc-${Date.now()}`,
      organizationId: storage.getOrganization().id,
      websiteId,
      type: 'audit_completed',
      title: `Search Console Synced: ${syncResult.propertyUrl}`,
      message: `Ingested ${syncResult.recordsSynced} performance rows for ${syncResult.dateRange.start} to ${syncResult.dateRange.end}. Discovered ${opportunities.length} opportunities.`,
      severity: 'success',
      isRead: false,
      linkUrl: '/dashboard/gsc',
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
