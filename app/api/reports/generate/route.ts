import { NextRequest, NextResponse } from 'next/server';
import { generateClientReportData } from '@/lib/reports/report-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { websiteId, startDate, endDate } = body;

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId is required.' }, { status: 400 });
    }

    const report = generateClientReportData(websiteId, startDate, endDate);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
