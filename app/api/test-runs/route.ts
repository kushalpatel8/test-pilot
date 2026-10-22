import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { TestRunService } from "@/services/test-run.service";
import { z } from "zod";
import { TestRunStatus } from "@prisma/client";

const createTestRunSchema = z.object({
  repositoryId: z.string().min(1, "Repository ID is required"),
  branch: z.string().optional(),
  commitSha: z.string().optional(),
  commitMessage: z.string().optional(),
  runLint: z.boolean().optional(),
  runTypeCheck: z.boolean().optional(),
  runUnitTests: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);

    const repositoryId = searchParams.get("repositoryId") || undefined;
    const status = (searchParams.get("status") as TestRunStatus) || undefined;
    const branch = searchParams.get("branch") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 20;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const data = await TestRunService.listTestRuns(user.id, {
      repositoryId,
      status,
      branch,
      limit,
      offset,
    });

    return NextResponse.json(data);
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to list test runs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const validated = createTestRunSchema.parse(body);

    const testRun = await TestRunService.createTestRun(user.id, validated);
    return NextResponse.json({ testRun }, { status: 201 });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      const msg = err.issues?.[0]?.message || "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to create test run" }, { status: 400 });
  }
}
