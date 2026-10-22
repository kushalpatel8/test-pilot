import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/db";

export async function GET() {
  try {
    const data = await checkDatabaseConnection();
    return NextResponse.json({
      status: "connected",
      service: "neon-postgres",
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        service: "neon-postgres",
        error: error.message || "Failed to query database",
      },
      { status: 500 }
    );
  }
}
