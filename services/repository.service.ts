import { prisma } from "@/lib/prisma";
import { GitHubService } from "./github.service";

export interface ConnectRepoInput {
  repoUrlOrName: string;
  defaultBranch?: string;
}

export class RepositoryService {
  /**
   * List all connected repositories for an authorized user.
   */
  static async listUserRepositories(userId: string) {
    const repos = await prisma.repository.findMany({
      where: {
        userId,
        isConnected: true,
      },
      include: {
        _count: {
          select: { testRuns: true },
        },
        testRuns: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            createdAt: true,
            passedTests: true,
            failedTests: true,
            totalTests: true,
            coveragePercentage: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return repos.map((repo) => ({
      ...repo,
      latestRun: repo.testRuns[0] || null,
    }));
  }

  /**
   * Get single repository by ID with ownership verification.
   */
  static async getRepositoryById(userId: string, repositoryId: string) {
    const repo = await prisma.repository.findFirst({
      where: {
        id: repositoryId,
        userId,
      },
      include: {
        testRuns: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            qaReport: {
              select: { id: true, analysisStatus: true, summary: true },
            },
          },
        },
        _count: {
          select: { testRuns: true },
        },
      },
    });

    if (!repo) {
      throw new Error("Repository not found or access denied");
    }

    return repo;
  }

  /**
   * Connect a new GitHub repository for the user.
   */
  static async connectRepository(userId: string, input: ConnectRepoInput) {
    const parsed = GitHubService.parseRepoString(input.repoUrlOrName);
    if (!parsed) {
      throw new Error("Invalid repository format. Please provide 'owner/repo' or full GitHub URL.");
    }

    const { owner, repo: name } = parsed;
    const fullName = `${owner}/${name}`;

    // Verify repository exists on GitHub
    let defaultBranch = input.defaultBranch || "main";
    let githubId = `${owner}-${name}`;

    try {
      const ghInfo = await GitHubService.getRepositoryInfo(owner, name);
      defaultBranch = ghInfo.default_branch || defaultBranch;
      githubId = String(ghInfo.id);
    } catch {
      // If repository is private or unauthenticated, use provided branch
      console.warn(`Could not verify GitHub repo metadata for ${fullName}, proceeding with defaults.`);
    }

    // Check if user already connected this repo
    const existing = await prisma.repository.findFirst({
      where: {
        userId,
        fullName,
      },
    });

    if (existing) {
      if (!existing.isConnected) {
        return prisma.repository.update({
          where: { id: existing.id },
          data: { isConnected: true, defaultBranch },
        });
      }
      return existing;
    }

    return prisma.repository.create({
      data: {
        userId,
        githubRepositoryId: githubId,
        owner,
        name,
        fullName,
        defaultBranch,
        isConnected: true,
      },
    });
  }

  /**
   * Disconnect a repository. Enforces user ownership.
   */
  static async disconnectRepository(userId: string, repositoryId: string) {
    const existing = await prisma.repository.findFirst({
      where: { id: repositoryId, userId },
    });

    if (!existing) {
      throw new Error("Repository not found or access denied");
    }

    return prisma.repository.update({
      where: { id: repositoryId },
      data: { isConnected: false },
    });
  }

  /**
   * Permanently delete a repository and all cascaded runs & reports. Enforces user ownership.
   */
  static async deleteRepository(userId: string, repositoryId: string) {
    const existing = await prisma.repository.findFirst({
      where: { id: repositoryId, userId },
    });

    if (!existing) {
      throw new Error("Repository not found or access denied");
    }

    return prisma.repository.delete({
      where: { id: repositoryId },
    });
  }
}

export const deleteRepository = RepositoryService.deleteRepository;
