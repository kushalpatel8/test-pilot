import { describe, it, expect } from "vitest";
import { sanitizeLogs } from "@/lib/openai";

describe("Log Sanitizer & Secret Redaction", () => {
  it("should redact OpenAI API keys", () => {
    const raw = "Error connecting to OpenAI with key sk-proj-1234567890abcdefghijklmnop";
    const sanitized = sanitizeLogs(raw);
    expect(sanitized).not.toContain("sk-proj-1234567890abcdefghijklmnop");
    expect(sanitized).toContain("[REDACTED_OPENAI_KEY]");
  });

  it("should redact GitHub personal access tokens", () => {
    const raw = "Cloning repository using token ghp_123456789012345678901234567890123456";
    const sanitized = sanitizeLogs(raw);
    expect(sanitized).not.toContain("ghp_123456789012345678901234567890123456");
    expect(sanitized).toContain("[REDACTED_GITHUB_TOKEN]");
  });

  it("should redact PostgreSQL connection credentials", () => {
    const raw = "Connected to postgresql://neondb_owner:secret_password@ep-host.neon.tech/neondb";
    const sanitized = sanitizeLogs(raw);
    expect(sanitized).not.toContain("secret_password");
    expect(sanitized).toContain("postgresql://user:***@");
  });

  it("should truncate oversized logs to prevent token limits", () => {
    const oversized = "a".repeat(25000);
    const sanitized = sanitizeLogs(oversized, 1000);
    expect(sanitized.length).toBeLessThan(oversized.length);
    expect(sanitized).toContain("TRUNCATED");
  });
});
