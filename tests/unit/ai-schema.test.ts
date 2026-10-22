import { describe, it, expect } from "vitest";
import { AIAnalysisOutput } from "@/types/test-report";

describe("AI Analysis Schema & Severity", () => {
  it("should conform to structured QA report schema", () => {
    const mockAnalysis: AIAnalysisOutput = {
      summary: "All automated assertions completed cleanly.",
      overallAssessment: "HEALTHY",
      failureCount: 0,
      criticalIssuesCount: 0,
      findings: [],
      recommendedActions: ["Maintain unit test coverage."],
      suggestedTestCases: [
        {
          title: "Boundary test on numeric limits",
          description: "Verify large integer payloads do not overflow.",
          type: "EDGE_CASE",
        },
      ],
      limitations: ["Automated analysis reflects provided test run outputs."],
      analyzedAt: new Date().toISOString(),
      modelUsed: "gpt-4o-mini",
    };

    expect(mockAnalysis.overallAssessment).toBe("HEALTHY");
    expect(mockAnalysis.findings).toHaveLength(0);
    expect(mockAnalysis.suggestedTestCases[0].type).toBe("EDGE_CASE");
  });
});
