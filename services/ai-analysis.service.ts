import { prisma } from "@/lib/prisma";
import { getOpenAIClient, getOpenAIModel, sanitizeLogs } from "@/lib/openai";
import { AIAnalysisOutput } from "@/types/test-report";

export class AiAnalysisService {
  /**
   * Run structured AI QA Analysis on an authorized test run.
   */
  static async analyzeTestRun(userId: string, testRunId: string): Promise<AIAnalysisOutput> {
    // 1. Retrieve test run and verify ownership
    const testRun = await prisma.testRun.findFirst({
      where: {
        id: testRunId,
        userId,
      },
      include: {
        repository: true,
        testResults: true,
      },
    });

    if (!testRun) {
      throw new Error("Test run not found or unauthorized");
    }

    // 2. Format evidence and failures
    const failedResults = testRun.testResults.filter((r) => r.status === "FAILED" || r.status === "ERROR");
    const passedResults = testRun.testResults.filter((r) => r.status === "PASSED");

    const failureSnippets = failedResults.slice(0, 15).map((f, idx) => `
Failure #${idx + 1}:
- Test Name: ${f.testName}
- File: ${f.testFile}
- Status: ${f.status}
- Error: ${f.errorMessage || "N/A"}
- Stack Trace:
${f.stackTrace ? f.stackTrace.slice(0, 1000) : "N/A"}
`).join("\n");

    const sanitizedExecutionLogs = sanitizeLogs(testRun.logs || "", 12000);

    const systemPrompt = `You are TestPilot's Senior AI QA Engineer and Reliability Specialist.
Your task is to analyze automated software test results, static analysis findings, and execution evidence.

IMPORTANT QA PRINCIPLES:
1. Ground every finding in observed execution evidence.
2. Distinguish confirmed observed errors (e.g. failing assertion, syntax error) from hypotheses (root cause speculations).
3. Classify severity appropriately:
   - CRITICAL: App-breaking, crash, security vulnerability, data corruption, or core auth/payment failure.
   - HIGH: Significant functional failure or broken primary user flow.
   - MEDIUM: Non-critical edge case, performance regression, or partial failure.
   - LOW: Minor UI bug, warning, or deprecation.
   - INFO: Recommendation, architecture insight, or test coverage expansion.
4. Provide actionable, precise recommendations for engineers.
5. Suggest targeted, valuable test cases (edge cases, regression guards).

You must respond ONLY with valid, RFC 8259 JSON adhering strictly to this schema:
{
  "summary": "High level executive summary of the test execution (2-3 sentences)",
  "overallAssessment": "HEALTHY" | "DEGRADED" | "CRITICAL_ISSUES_FOUND" | "CONFIG_OR_SETUP_ERROR",
  "failureCount": number,
  "criticalIssuesCount": number,
  "findings": [
    {
      "id": "F-1",
      "title": "Short descriptive title of the issue",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO",
      "evidence": "Direct quote or observed failure from the test logs/results",
      "likelyCause": "Technical hypothesis explaining why this failed",
      "affectedFileOrTest": "file path or test name",
      "recommendedAction": "Concrete code or configuration fix step",
      "confidence": "HIGH" | "MEDIUM" | "LOW",
      "isHypothesis": true
    }
  ],
  "recommendedActions": [
    "Prioritized bullet action 1",
    "Prioritized bullet action 2"
  ],
  "suggestedTestCases": [
    {
      "title": "Test case title",
      "description": "What to test and expected behavior",
      "type": "EDGE_CASE" | "REGRESSION" | "SECURITY" | "PERFORMANCE"
    }
  ],
  "limitations": [
    "Caveat or limitation of this automated analysis"
  ]
}`;

    const userPrompt = `Analyze the following test execution:
Repository: ${testRun.repository.fullName}
Branch: ${testRun.branch}
Commit: ${testRun.commitSha}
Execution Status: ${testRun.status}
Total Tests: ${testRun.totalTests} | Passed: ${testRun.passedTests} | Failed: ${testRun.failedTests} | Skipped: ${testRun.skippedTests}

Failed Test Items (${failedResults.length}):
${failureSnippets || "None (All automated assertions passed)"}

Execution Logs:
${sanitizedExecutionLogs || "Logs empty or completed cleanly."}
`;

    const model = getOpenAIModel();
    let analysisOutput: AIAnalysisOutput;

    try {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error("Received empty response from OpenAI API");
      }

      const parsedJson = JSON.parse(responseText);
      analysisOutput = {
        ...parsedJson,
        analyzedAt: new Date().toISOString(),
        modelUsed: model,
      };
    } catch (apiError: any) {
      console.warn("OpenAI API call failed, falling back to structured deterministic QA analysis:", apiError.message);
      
      // Fallback deterministic analysis so the report is never broken
      analysisOutput = {
        summary: failedResults.length > 0
          ? `Test execution completed with ${failedResults.length} test failure(s) out of ${testRun.totalTests} total tests in ${testRun.repository.fullName}.`
          : `All ${testRun.totalTests} QA checks and tests completed successfully with a 100% pass rate.`,
        overallAssessment: failedResults.length > 0 ? "DEGRADED" : "HEALTHY",
        failureCount: failedResults.length,
        criticalIssuesCount: failedResults.length > 0 ? 1 : 0,
        findings: failedResults.map((f, i) => ({
          id: `F-${i + 1}`,
          title: `Failure in ${f.testName}`,
          severity: "HIGH" as const,
          evidence: f.errorMessage || "Assertion error reported",
          likelyCause: "Assertion condition failed or unhandled exception during test execution.",
          affectedFileOrTest: f.testFile,
          recommendedAction: "Inspect the stack trace and verify function inputs and boundary assertions.",
          confidence: "HIGH" as const,
          isHypothesis: true,
        })),
        recommendedActions: failedResults.length > 0
          ? [
              "Investigate failed assertion logs in the report.",
              "Run local verification on the failing module.",
              "Ensure mock data matches production schemas.",
            ]
          : [
              "Maintain current test coverage.",
              "Consider adding edge-case tests for unexpected inputs.",
            ],
        suggestedTestCases: [
          {
            title: "Null and undefined payload validation",
            description: "Verify that all API routes handle malformed payloads gracefully.",
            type: "SECURITY",
          },
          {
            title: "Concurrency and simultaneous request tests",
            description: "Test state transitions under concurrent test execution jobs.",
            type: "PERFORMANCE",
          },
        ],
        limitations: [
          "Analysis derived from test outputs; review code diffs for full semantic verification.",
        ],
        analyzedAt: new Date().toISOString(),
        modelUsed: `${model} (fallback)`,
      };
    }

    // 3. Upsert QAReport in Prisma
    await prisma.qAReport.upsert({
      where: { testRunId },
      update: {
        summary: analysisOutput.summary,
        analysisJson: analysisOutput as any,
        model,
        analysisStatus: "COMPLETED",
      },
      create: {
        testRunId,
        summary: analysisOutput.summary,
        analysisJson: analysisOutput as any,
        model,
        analysisStatus: "COMPLETED",
      },
    });

    return analysisOutput;
  }
}
