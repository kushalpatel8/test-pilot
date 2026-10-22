import { NormalizedTestResult } from "@/types/test-report";

export class VitestParser {
  /**
   * Parse standard or structured Vitest/Jest output into normalized test results.
   */
  static parse(output: string): NormalizedTestResult[] {
    const results: NormalizedTestResult[] = [];
    if (!output) return results;

    const lines = output.split("\n");
    let currentTest: Partial<NormalizedTestResult> | null = null;
    let stackLines: string[] = [];
    let collectingError = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match PASS / FAIL file blocks: e.g. "✓ tests/unit/auth.test.ts > should authenticate user (12ms)"
      // or "✕ tests/unit/payment.test.ts > should charge card (45ms)"
      const passMatch = line.match(/(?:✓|PASS|\✔)\s+([^\s>]+)\s*(?:>\s*(.+))?(?:\s+\((\d+)\s*ms\))?/i);
      const failMatch = line.match(/(?:✕|FAIL|✖)\s+([^\s>]+)\s*(?:>\s*(.+))?(?:\s+\((\d+)\s*ms\))?/i);

      if (failMatch) {
        if (currentTest && currentTest.testName) {
          if (stackLines.length > 0) {
            currentTest.stackTrace = stackLines.join("\n").trim();
            currentTest.errorMessage = stackLines[0]?.trim() || "Assertion failed";
          }
          results.push(currentTest as NormalizedTestResult);
          stackLines = [];
        }

        const file = failMatch[1] || "unknown.test.ts";
        let testName = failMatch[2]?.trim() || file;
        let duration = failMatch[3] ? parseInt(failMatch[3], 10) : 35;
        const durMatch = testName.match(/(.*?)\s*\((\d+)\s*ms\)$/);
        if (durMatch) {
          testName = durMatch[1].trim();
          duration = parseInt(durMatch[2], 10);
        }

        currentTest = {
          testFile: file,
          testName,
          status: "FAILED",
          durationMs: duration,
        };
        collectingError = true;
        continue;
      }

      if (passMatch) {
        if (currentTest && currentTest.testName) {
          if (stackLines.length > 0) {
            currentTest.stackTrace = stackLines.join("\n").trim();
            currentTest.errorMessage = stackLines[0]?.trim() || "Assertion failed";
          }
          results.push(currentTest as NormalizedTestResult);
          stackLines = [];
          collectingError = false;
        }

        const file = passMatch[1] || "unknown.test.ts";
        let testName = passMatch[2]?.trim() || file;
        let duration = passMatch[3] ? parseInt(passMatch[3], 10) : 18;
        const durMatch = testName.match(/(.*?)\s*\((\d+)\s*ms\)$/);
        if (durMatch) {
          testName = durMatch[1].trim();
          duration = parseInt(durMatch[2], 10);
        }

        results.push({
          testFile: file,
          testName,
          status: "PASSED",
          durationMs: duration,
        });
        currentTest = null;
        continue;
      }

      // Collect stack trace or assertion error lines if current test is failing
      if (collectingError && currentTest) {
        if (line.includes("Error:") || line.includes("AssertionError:") || line.includes("Expected:") || line.includes("Received:") || line.includes("at ")) {
          stackLines.push(line);
        } else if (line.trim().length === 0 && stackLines.length > 5) {
          collectingError = false;
        }
      }
    }

    if (currentTest && currentTest.testName) {
      if (stackLines.length > 0) {
        currentTest.stackTrace = stackLines.join("\n").trim();
        currentTest.errorMessage = stackLines[0]?.trim() || "Assertion failed";
      }
      results.push(currentTest as NormalizedTestResult);
    }

    return results;
  }
}
