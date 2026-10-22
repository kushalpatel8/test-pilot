import { githubApi, GitHubApi } from "@/lib/github";
import { GitHubRepository, GitHubBranch, GitHubCommit } from "@/types/github";

export class GitHubService {
  /**
   * Parse GitHub repo from string like "owner/repo" or "https://github.com/owner/repo"
   */
  static parseRepoString(input: string): { owner: string; repo: string } | null {
    const cleaned = input.trim().replace(/\.git$/, "");
    const match = cleaned.match(/(?:github\.com\/|^)([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)$/);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  }

  static async getRepositoryInfo(owner: string, repo: string, token?: string): Promise<GitHubRepository> {
    const client = token ? new GitHubApi(token) : githubApi;
    return client.getRepository(owner, repo);
  }

  static async getBranches(owner: string, repo: string, token?: string): Promise<GitHubBranch[]> {
    const client = token ? new GitHubApi(token) : githubApi;
    return client.getBranches(owner, repo);
  }

  static async getCommits(owner: string, repo: string, branch: string = "main", token?: string): Promise<GitHubCommit[]> {
    const client = token ? new GitHubApi(token) : githubApi;
    return client.getCommits(owner, repo, branch);
  }
}
