import { NextRequest, NextResponse } from 'next/server';
import { generateClientReportDataAsync } from '@/lib/reports/report-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { websiteId, auditRunId, startDate, endDate } = body;

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId is required.' }, { status: 400 });
    }

    const report = await generateClientReportDataAsync(websiteId, auditRunId, startDate, endDate, req);

    if (!report) {
      return NextResponse.json({ success: false, error: 'Website not found or report generation failed.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
