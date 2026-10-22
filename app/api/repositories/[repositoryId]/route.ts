import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { RepositoryService, deleteRepository } from "@/services/repository.service";
import { GitHubService } from "@/services/github.service";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ repositoryId: string }> }
) {
  try {
    const user = await requireUser();
    const { repositoryId } = await params;
    const repository = await RepositoryService.getRepositoryById(user.id, repositoryId);

    // Attempt to fetch fresh branches and commits from GitHub
    let branches: any[] = [];
    let commits: any[] = [];
    try {
      branches = await GitHubService.getBranches(repository.owner, repository.name);
    } catch {
      branches = [{ name: repository.defaultBranch, commit: { sha: "HEAD", url: "" } }];
    }

    try {
      commits = await GitHubService.getCommits(repository.owner, repository.name, repository.defaultBranch);
    } catch {
      commits = [];
    }

    return NextResponse.json({
      repository,
      branches,
      commits,
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Repository not found" }, { status: 404 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ repositoryId: string }> }
) {
  try {
    const user = await requireUser();
    const { repositoryId } = await params;

    if (typeof deleteRepository === "function") {
      await deleteRepository(user.id, repositoryId);
    } else if (typeof RepositoryService?.deleteRepository === "function") {
      await RepositoryService.deleteRepository(user.id, repositoryId);
    } else {
      // Fallback in case Turbopack dev server has stale class prototype cache
      const repo = await prisma.repository.findFirst({
        where: { id: repositoryId, userId: user.id },
      });
      if (!repo) {
        return NextResponse.json({ error: "Repository not found or access denied" }, { status: 404 });
      }
      await prisma.repository.delete({
        where: { id: repositoryId },
      });
    }

    return NextResponse.json({ success: true, message: "Repository deleted successfully" });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to delete repository" }, { status: 400 });
  }
}
