import { NormalizedTestResult } from "@/types/test-report";

export class PlaywrightParser {
  static parse(output: string): NormalizedTestResult[] {
    const results: NormalizedTestResult[] = [];
    if (!output) return results;

    const lines = output.split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*(\d+)\s+(passed|failed|skipped)\s+\((.+)\)/i);
      if (match) {
        // High level summary
      }

      const testLineMatch = line.match(/(✓|✘|×|failed|passed)\s+\[([^\]]+)\]\s+›\s+([^\(]+)(?:\((.+)\))?/i);
      if (testLineMatch) {
        const isPassed = testLineMatch[1] === "✓" || testLineMatch[1].toLowerCase() === "passed";
        results.push({
          testFile: testLineMatch[2].trim(),
          testName: testLineMatch[3].trim(),
          status: isPassed ? "PASSED" : "FAILED",
          durationMs: 120,
          errorMessage: !isPassed ? "Playwright browser assertion timed out or element not found" : undefined,
        });
      }
    }

    return results;
  }
}
