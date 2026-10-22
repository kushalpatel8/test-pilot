import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { RepositoryService } from "@/services/repository.service";
import { z } from "zod";

const connectRepoSchema = z.object({
  repoUrlOrName: z.string().min(1, "Repository identifier is required"),
  defaultBranch: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    const repos = await RepositoryService.listUserRepositories(user.id);
    return NextResponse.json({ repositories: repos });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to list repositories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const validated = connectRepoSchema.parse(body);

    const repository = await RepositoryService.connectRepository(user.id, validated);
    return NextResponse.json({ repository }, { status: 201 });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      const msg = err.issues?.[0]?.message || "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to connect repository" }, { status: 400 });
  }
}
