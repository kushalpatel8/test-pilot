import { prisma } from "@/lib/prisma";
import { TestRunner } from "@/worker/runner";
import { TestRunStatus } from "@prisma/client";

export interface CreateTestRunInput {
  repositoryId: string;
  branch?: string;
  commitSha?: string;
  commitMessage?: string;
  runLint?: boolean;
  runTypeCheck?: boolean;
  runUnitTests?: boolean;
}

export class TestRunService {
  /**
   * Create a new test run and dispatch asynchronous worker.
   */
  static async createTestRun(userId: string, input: CreateTestRunInput) {
    // 1. Verify user owns the repository
    const repository = await prisma.repository.findFirst({
      where: {
        id: input.repositoryId,
        userId,
        isConnected: true,
      },
    });

    if (!repository) {
      throw new Error("Repository not found or unauthorized");
    }

    const branch = input.branch || repository.defaultBranch || "main";
    const commitSha = input.commitSha || `mock-${Date.now().toString(16)}`;
    const commitMessage = input.commitMessage || `Manual QA test trigger for ${branch}`;

    // 2. Create TestRun record
    const testRun = await prisma.testRun.create({
      data: {
        repositoryId: repository.id,
        userId,
        branch,
        commitSha,
        commitMessage,
        status: "QUEUED",
      },
    });

    // 3. Dispatch execution asynchronously without blocking caller
    setImmediate(() => {
      TestRunner.execute(testRun.id, {
        runLint: input.runLint ?? true,
        runTypeCheck: input.runTypeCheck ?? true,
        runUnitTests: input.runUnitTests ?? true,
      }).catch((err) => {
        console.error(`Background test execution error on run ${testRun.id}:`, err);
      });
    });

    return testRun;
  }

  /**
   * List test runs for an authorized user with filters.
   */
  static async listTestRuns(
    userId: string,
    filters: {
      repositoryId?: string;
      status?: TestRunStatus;
      branch?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const { repositoryId, status, branch, limit = 20, offset = 0 } = filters;

    const where: any = { userId };
    if (repositoryId) where.repositoryId = repositoryId;
    if (status) where.status = status;
    if (branch) where.branch = branch;

    const [total, runs] = await Promise.all([
      prisma.testRun.count({ where }),
      prisma.testRun.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          repository: {
            select: {
              id: true,
              fullName: true,
              owner: true,
              name: true,
            },
          },
          qaReport: {
            select: {
              id: true,
              analysisStatus: true,
              summary: true,
            },
          },
        },
      }),
    ]);

    return { total, runs };
  }

  /**
   * Get single test run by ID with all test results and QA report.
   */
  static async getTestRunById(userId: string, runId: string) {
    const testRun = await prisma.testRun.findFirst({
      where: {
        id: runId,
        userId,
      },
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

    return testRun;
  }

  /**
   * Cancel an ongoing or queued test run.
   */
  static async cancelTestRun(userId: string, runId: string) {
    const testRun = await prisma.testRun.findFirst({
      where: { id: runId, userId },
    });

    if (!testRun) {
      throw new Error("Test run not found or unauthorized");
    }

    if (testRun.status === "PASSED" || testRun.status === "FAILED" || testRun.status === "CANCELLED") {
      return testRun;
    }

    return prisma.testRun.update({
      where: { id: runId },
      data: {
        status: "CANCELLED",
        completedAt: new Date(),
      },
    });
  }
}
