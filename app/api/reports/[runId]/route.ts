import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { ReportService } from "@/services/report.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const user = await requireUser();
    const { runId } = await params;
    const { searchParams } = new URL(req.url);

    if (searchParams.get("export") === "json") {
      const exportData = await ReportService.exportReportJson(user.id, runId);
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="testpilot-report-${runId}.json"`,
        },
      });
    }

    const report = await ReportService.getReportForRun(user.id, runId);
    return NextResponse.json({ report });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Report not found" }, { status: 404 });
  }
}
