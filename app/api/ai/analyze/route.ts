import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { AiAnalysisService } from "@/services/ai-analysis.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const analyzeSchema = z.object({
  testRunId: z.string().min(1, "testRunId is required"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { testRunId } = analyzeSchema.parse(body);

    const analysis = await AiAnalysisService.analyzeTestRun(user.id, testRunId);
    return NextResponse.json({ analysis });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      const msg = err.issues?.[0]?.message || "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to analyze test run" }, { status: 500 });
  }
}
