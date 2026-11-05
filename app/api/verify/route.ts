import { NextRequest, NextResponse } from 'next/server';
import { verifyTaskFix } from '@/lib/verification/verification-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json({ success: false, error: 'taskId is required.' }, { status: 400 });
    }

    const result = await verifyTaskFix(taskId, req);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
