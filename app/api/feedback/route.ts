import { NextRequest, NextResponse } from 'next/server';
import { recordFindingFeedback, FeedbackType } from '@/lib/trust/feedback-service';
import { storage } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { findingId, feedbackType, comments } = body;

    if (!findingId || !feedbackType) {
      return NextResponse.json({ success: false, error: 'findingId and feedbackType are required.' }, { status: 400 });
    }

    const user = storage.getUser();
    const record = recordFindingFeedback(findingId, user.id, feedbackType as FeedbackType, comments);

    return NextResponse.json({ success: true, record });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
