import { GitHubRepository, GitHubBranch, GitHubCommit } from "@/types/github";

export class GitHubApi {
  private token?: string;

  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN;
  }

  private get headers(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "TestPilot-QA-Engine/1.0",
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: this.headers,
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch repository ${owner}/${repo} (${res.status})`);
    }

    return res.json();
  }

  async getBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=30`, {
      headers: this.headers,
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch branches for ${owner}/${repo}`);
    }

    return res.json();
  }

  async getCommits(owner: string, repo: string, branch: string = "main"): Promise<GitHubCommit[]> {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=15`, {
      headers: this.headers,
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch commits for ${owner}/${repo} on branch ${branch}`);
    }

    return res.json();
  }

  async listUserRepositories(username?: string): Promise<GitHubRepository[]> {
    const url = username
      ? `https://api.github.com/users/${username}/repos?sort=updated&per_page=30`
      : `https://api.github.com/user/repos?sort=updated&per_page=30`;

    const res = await fetch(url, {
      headers: this.headers,
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to list GitHub repositories");
    }

    return res.json();
  }
}

export const githubApi = new GitHubApi();
