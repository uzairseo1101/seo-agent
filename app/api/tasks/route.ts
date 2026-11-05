import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerAuthContext } from '@/lib/auth-server';
import { ActionItem, TaskPriority, TaskStatus, FindingCategory } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const websiteId = req.nextUrl.searchParams.get('websiteId') || undefined;
    const tasks = await db.getActionItems(websiteId, req);
    return NextResponse.json({ success: true, tasks });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getServerAuthContext(req);
    if (!auth.user || !auth.organizationId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to create a task.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      category,
      priority,
      affectedUrl,
      recommendedSolution,
      websiteId,
      dueDate,
      sourceType = 'manual',
      sourceId,
      steps,
      targetKeyword,
      opportunityCategory,
      baselineMetrics,
      expectedOutcome,
      evidenceSummary,
      relatedAuditFindings,
      verificationCriteria,
      verificationMethod,
    } = body;

    if (!title || !affectedUrl) {
      return NextResponse.json({ success: false, error: 'Title and Affected URL are required.' }, { status: 400 });
    }

    const websites = await db.getWebsites(req);
    const targetWebId = websiteId || websites[0]?.id;

    if (!targetWebId) {
      return NextResponse.json({ success: false, error: 'Please connect a website before creating tasks.' }, { status: 400 });
    }

    const defaultSteps = [
      'Review current URL implementation',
      'Execute required optimization',
      'Deploy changes to production',
      'Mark task completed and run verification re-check',
    ];

    const newTask = await db.createActionItem({
      organizationId: auth.organizationId,
      websiteId: targetWebId,
      sourceType,
      sourceId,
      title,
      description: description || title,
      category: (category as FindingCategory) || 'technical',
      priority: (priority as TaskPriority) || 'medium',
      affectedUrl,
      recommendedSolution: recommendedSolution || 'Implement on-page optimization.',
      steps: Array.isArray(steps) && steps.length > 0 ? steps : defaultSteps,
      status: 'todo',
      verificationStatus: 'unverified',
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      targetKeyword,
      opportunityCategory,
      baselineMetrics,
      expectedOutcome,
      evidenceSummary,
      relatedAuditFindings,
      verificationCriteria,
      verificationMethod,
    }, req);

    return NextResponse.json({ success: true, task: newTask });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getServerAuthContext(req);
    if (!auth.user || !auth.organizationId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, userNotes, dueDate } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Task ID is required.' }, { status: 400 });
    }

    const updated = await db.updateActionItemStatus(id, status, userNotes, req);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Task not found or update failed.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
