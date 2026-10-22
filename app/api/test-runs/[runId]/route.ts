import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { TestRunService } from "@/services/test-run.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const user = await requireUser();
    const { runId } = await params;
    const testRun = await TestRunService.getTestRunById(user.id, runId);
    return NextResponse.json({ testRun });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Test run not found" }, { status: 404 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const user = await requireUser();
    const { runId } = await params;
    const body = await req.json().catch(() => ({}));

    if (body.action === "cancel") {
      const cancelled = await TestRunService.cancelTestRun(user.id, runId);
      return NextResponse.json({ testRun: cancelled });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to update test run" }, { status: 400 });
  }
}
