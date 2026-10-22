import { NormalizedTestResult } from "@/types/test-report";

export class JestParser {
  static parse(output: string): NormalizedTestResult[] {
    const results: NormalizedTestResult[] = [];
    if (!output) return results;

    const testRegex = /(PASS|FAIL)\s+([^\s]+)(?:\s+\((\d+(?:\.\d+)?)\s*s\))?/g;
    let match;
    while ((match = testRegex.exec(output)) !== null) {
      const status = match[1] === "PASS" ? "PASSED" : "FAILED";
      const file = match[2];
      const durationSeconds = match[3] ? parseFloat(match[3]) : 0.5;

      results.push({
        testName: `Suite: ${file}`,
        testFile: file,
        status,
        durationMs: Math.round(durationSeconds * 1000),
        errorMessage: status === "FAILED" ? "Jest test suite reported failures" : undefined,
      });
    }

    return results;
  }
}
