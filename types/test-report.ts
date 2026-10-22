export type FindingSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export interface AIFinding {
  id: string;
  title: string;
  severity: FindingSeverity;
  evidence: string;
  likelyCause: string;
  affectedFileOrTest?: string;
  recommendedAction: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  isHypothesis: boolean;
}

export interface AIAnalysisOutput {
  summary: string;
  overallAssessment: "HEALTHY" | "DEGRADED" | "CRITICAL_ISSUES_FOUND" | "CONFIG_OR_SETUP_ERROR";
  failureCount: number;
  criticalIssuesCount: number;
  findings: AIFinding[];
  recommendedActions: string[];
  suggestedTestCases: {
    title: string;
    description: string;
    type: "EDGE_CASE" | "REGRESSION" | "SECURITY" | "PERFORMANCE";
  }[];
  limitations: string[];
  analyzedAt: string;
  modelUsed: string;
}

export interface NormalizedTestResult {
  testName: string;
  testFile: string;
  status: "PASSED" | "FAILED" | "SKIPPED" | "ERROR";
  durationMs?: number;
  errorMessage?: string;
  stackTrace?: string;
}

export interface TestExecutionOutput {
  status: "PASSED" | "FAILED" | "ERROR" | "CANCELLED";
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  errorTests: number;
  coveragePercentage?: number;
  durationMs: number;
  logs: string;
  results: NormalizedTestResult[];
}
