import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isServerSupabaseConfigured, createAdminClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const websites = await db.getWebsites();
    const audits = await db.getAuditRuns();
    const users = await db.getProfiles();
    const tasks = await db.getActionItems();
    const logs = await db.getActivityLogs(10);

    const metrics = {
      totalUsers: users.length,
      totalWebsites: websites.length,
      totalAudits: audits.length,
      totalTasks: tasks.length,
      criticalTasks: tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length,
      avgSeoScore: websites.length > 0 
        ? Math.round(websites.reduce((acc, w) => acc + (w.latestSeoScore || 0), 0) / websites.length) 
        : 0,
      supabaseConnected: isServerSupabaseConfigured,
      crawlerStatus: 'operational',
    };

    return NextResponse.json({
      success: true,
      metrics,
      recentUsers: users.slice(0, 5),
      recentWebsites: websites.slice(0, 5),
      recentAudits: audits.slice(0, 5),
      recentLogs: logs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch admin overview.' },
      { status: 500 }
    );
  }
}
