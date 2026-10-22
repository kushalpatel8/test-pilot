import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { githubApi } from "@/lib/github";

export async function GET(req: NextRequest) {
  try {
    await requireUser();
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username") || undefined;

    const repos = await githubApi.listUserRepositories(username);
    return NextResponse.json({ repositories: repos });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || "Failed to list GitHub repositories" }, { status: 400 });
  }
}
