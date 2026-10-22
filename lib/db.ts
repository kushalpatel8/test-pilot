import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === "production") {
  console.warn("DATABASE_URL / DATABASE_URL_POOLED environment variable is not set.");
}

export const sql = neon(databaseUrl || "");

export async function checkDatabaseConnection() {
  const result = await sql`
    SELECT 
      NOW() as current_time, 
      current_database() as database_name, 
      version() as version;
  `;
  return result[0];
}
