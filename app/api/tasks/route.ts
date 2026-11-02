import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { db } from '@/lib/db';
import { ActionItem, TaskPriority, TaskStatus, FindingCategory } from '@/lib/types';

export async function GET(req: NextRequest) {
  const websiteId = req.nextUrl.searchParams.get('websiteId') || undefined;
  const tasks = await db.getActionItems(websiteId, req);
  return NextResponse.json({ success: true, tasks });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, priority, affectedUrl, recommendedSolution, websiteId, dueDate } = body;

    if (!title || !affectedUrl) {
      return NextResponse.json({ success: false, error: 'Title and Affected URL are required.' }, { status: 400 });
    }

    const org = storage.getOrganization();
    const websites = await db.getWebsites(req);
    const targetWebId = websiteId || websites[0]?.id || '00000000-0000-0000-0000-000000000001';

    const newTask = await db.createActionItem({
      organizationId: org.id,
      websiteId: targetWebId,
      sourceType: 'manual',
      title,
      description: description || title,
      category: (category as FindingCategory) || 'technical',
      priority: (priority as TaskPriority) || 'medium',
      affectedUrl,
      recommendedSolution: recommendedSolution || 'Implement on-page optimization.',
      steps: [
        'Review current URL implementation',
        'Execute required optimization',
        'Deploy changes to production',
        'Mark task completed and run verification re-check',
      ],
      status: 'todo',
      verificationStatus: 'unverified',
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    }, req);

    return NextResponse.json({ success: true, task: newTask });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, userNotes, dueDate } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Task ID is required.' }, { status: 400 });
    }

    const task = await db.updateActionItemStatus(id, status as TaskStatus, userNotes, req);
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found.' }, { status: 404 });
    }

    if (dueDate) {
      task.dueDate = dueDate;
    }

    return NextResponse.json({ success: true, task });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
