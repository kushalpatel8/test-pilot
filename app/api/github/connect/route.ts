import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    await requireUser();

    const clientId = process.env.GITHUB_CLIENT_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/api/github/callback`;

    if (!clientId) {
      // In development or when using direct repository URL connection
      return NextResponse.json({
        configured: false,
        message: "GitHub App client ID not configured. Repositories can be connected directly via repository owner/name or URL.",
      });
    }

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=repo,read:user`;

    return NextResponse.json({
      configured: true,
      url: githubAuthUrl,
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
