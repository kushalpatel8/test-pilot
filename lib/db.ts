import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === "production") {
  console.warn("DATABASE_URL / DATABASE_URL_POOLED environment variable is not set.");
}

export const sql = neon(databaseUrl || "");

/**
 * Checks database connectivity with automatic retry to handle Neon compute wakeups.
 */
export async function checkDatabaseConnection(retries: number = 2) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await sql`
        SELECT 
          NOW() as current_time, 
          current_database() as database_name, 
          version() as version;
      `;
      return result[0];
    } catch (err: any) {
      if (attempt === retries) throw err;
      // Brief delay to allow serverless compute wakeup from idle state
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }
}
