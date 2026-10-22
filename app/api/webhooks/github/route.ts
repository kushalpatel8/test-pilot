import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TestRunService } from "@/services/test-run.service";

export async function POST(req: NextRequest) {
  try {
    const event = req.headers.get("x-github-event");
    if (!event) {
      return NextResponse.json({ error: "Missing x-github-event header" }, { status: 400 });
    }

    const payload = await req.json();

    if (event === "ping") {
      return NextResponse.json({ message: "pong" });
    }

    if (event === "push") {
      const repoFullName = payload.repository?.full_name;
      if (!repoFullName) {
        return NextResponse.json({ error: "Missing repository information" }, { status: 400 });
      }

      // Find matching repository in database
      const repo = await prisma.repository.findFirst({
        where: { fullName: repoFullName, isConnected: true },
      });

      if (!repo) {
        return NextResponse.json({ message: "Repository not connected in TestPilot" }, { status: 200 });
      }

      const branch = (payload.ref || "").replace("refs/heads/", "") || repo.defaultBranch;
      const commitSha = payload.after || payload.head_commit?.id || "HEAD";
      const commitMessage = payload.head_commit?.message || "Webhook push trigger";

      const testRun = await TestRunService.createTestRun(repo.userId, {
        repositoryId: repo.id,
        branch,
        commitSha,
        commitMessage,
      });

      return NextResponse.json({
        message: "Test run queued via GitHub push webhook",
        testRunId: testRun.id,
      });
    }

    return NextResponse.json({ message: `Ignored event: ${event}` });
  } catch (err: any) {
    console.error("GitHub webhook error:", err);
    return NextResponse.json({ error: err.message || "Webhook processing failed" }, { status: 500 });
  }
}
