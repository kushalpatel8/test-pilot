import { describe, it, expect } from "vitest";
import { VitestParser } from "@/worker/parsers/vitest.parser";
import { JestParser } from "@/worker/parsers/jest.parser";

describe("VitestParser", () => {
  it("should parse passing tests correctly", () => {
    const rawOutput = `
 ✓ tests/unit/auth.test.ts > should link Clerk identity (15ms)
 ✓ tests/unit/prisma.test.ts > should enforce unique constraints (22ms)
`;
    const results = VitestParser.parse(rawOutput);
    expect(results).toHaveLength(2);
    expect(results[0].status).toBe("PASSED");
    expect(results[0].testName).toBe("should link Clerk identity");
    expect(results[0].durationMs).toBe(15);
  });

  it("should parse failing tests and extract error stack traces", () => {
    const rawOutput = `
 ✕ tests/unit/payment.test.ts > should charge credit card (42ms)
AssertionError: expected status 200 to equal 400
    at /app/tests/unit/payment.test.ts:34:12
 ✓ tests/unit/health.test.ts > should return 200 OK (8ms)
`;
    const results = VitestParser.parse(rawOutput);
    expect(results).toHaveLength(2);
    
    const failed = results.find((r) => r.status === "FAILED");
    expect(failed).toBeDefined();
    expect(failed?.testName).toBe("should charge credit card");
    expect(failed?.errorMessage).toContain("AssertionError");
    expect(failed?.stackTrace).toContain("payment.test.ts");
  });

  it("should handle empty or malformed output gracefully", () => {
    const results = VitestParser.parse("");
    expect(results).toEqual([]);
  });
});

describe("JestParser", () => {
  it("should parse Jest suite summary lines", () => {
    const raw = `
PASS src/components/button.test.tsx (1.2s)
FAIL src/services/api.test.ts (2.4s)
`;
    const results = JestParser.parse(raw);
    expect(results).toHaveLength(2);
    expect(results[0].status).toBe("PASSED");
    expect(results[1].status).toBe("FAILED");
    expect(results[1].durationMs).toBe(2400);
  });
});
