import { prisma } from "@/lib/prisma";
import { AiAnalysisService } from "./ai-analysis.service";

export class ReportService {
  /**
   * Get full QA report for a test run with ownership verification.
   */
  static async getReportForRun(userId: string, runId: string) {
    const testRun = await prisma.testRun.findFirst({
      where: { id: runId, userId },
      include: {
        repository: true,
        testResults: {
          orderBy: [{ status: "asc" }, { testFile: "asc" }],
        },
        qaReport: true,
      },
    });

    if (!testRun) {
      throw new Error("Test run not found or unauthorized");
    }

    // If QA report doesn't exist yet and run is finished, generate it
    if (!testRun.qaReport && (testRun.status === "PASSED" || testRun.status === "FAILED" || testRun.status === "ERROR")) {
      try {
        await AiAnalysisService.analyzeTestRun(userId, runId);
        // Refresh
        const refreshed = await prisma.testRun.findFirst({
          where: { id: runId, userId },
          include: {
            repository: true,
            testResults: {
              orderBy: [{ status: "asc" }, { testFile: "asc" }],
            },
            qaReport: true,
          },
        });
        return refreshed;
      } catch (err) {
        console.warn("Could not auto-generate AI analysis on report fetch:", err);
      }
    }

    return testRun;
  }

  /**
   * Export complete report data as JSON.
   */
  static async exportReportJson(userId: string, runId: string) {
    const reportData = await this.getReportForRun(userId, runId);
    if (!reportData) {
      throw new Error("Report not found");
    }

    return {
      testPilotVersion: "1.0.0",
      exportDate: new Date().toISOString(),
      run: {
        id: reportData.id,
        repository: reportData.repository.fullName,
        branch: reportData.branch,
        commitSha: reportData.commitSha,
        status: reportData.status,
        durationMs: reportData.durationMs,
        startedAt: reportData.startedAt,
        completedAt: reportData.completedAt,
        metrics: {
          total: reportData.totalTests,
          passed: reportData.passedTests,
          failed: reportData.failedTests,
          skipped: reportData.skippedTests,
          error: reportData.errorTests,
          passRate: reportData.totalTests > 0 ? Math.round((reportData.passedTests / reportData.totalTests) * 100) : 100,
          coveragePercentage: reportData.coveragePercentage,
        },
      },
      aiAnalysis: reportData.qaReport ? (reportData.qaReport.analysisJson as any) : null,
      results: reportData.testResults.map((r) => ({
        name: r.testName,
        file: r.testFile,
        status: r.status,
        durationMs: r.durationMs,
        error: r.errorMessage,
        stackTrace: r.stackTrace,
      })),
      logs: reportData.logs,
    };
  }

  /**
   * Aggregate overall QA metrics across all user repositories.
   */
  static async getDashboardMetrics(userId: string) {
    const [totalRuns, passedRuns, failedRuns, reposCount, recentRuns] = await Promise.all([
      prisma.testRun.count({ where: { userId } }),
      prisma.testRun.count({ where: { userId, status: "PASSED" } }),
      prisma.testRun.count({ where: { userId, status: "FAILED" } }),
      prisma.repository.count({ where: { userId, isConnected: true } }),
      prisma.testRun.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          repository: {
            select: { fullName: true, name: true, owner: true },
          },
          qaReport: {
            select: { id: true, analysisStatus: true, summary: true },
          },
        },
      }),
    ]);

    const passRate = totalRuns > 0 ? Math.round((passedRuns / totalRuns) * 100) : 100;
    const aiReportsCount = await prisma.qAReport.count({
      where: { testRun: { userId }, analysisStatus: "COMPLETED" },
    });

    return {
      totalRuns,
      passedRuns,
      failedRuns,
      reposCount,
      passRate,
      aiReportsCount,
      recentRuns,
    };
  }
}
