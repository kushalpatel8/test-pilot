import { describe, it, expect } from "vitest";
import { GitHubService } from "@/services/github.service";

describe("GitHubService.parseRepoString", () => {
  it("should parse 'owner/repo' strings", () => {
    const res = GitHubService.parseRepoString("facebook/react");
    expect(res).toEqual({ owner: "facebook", repo: "react" });
  });

  it("should parse full GitHub URLs", () => {
    const res = GitHubService.parseRepoString("https://github.com/vercel/next.js");
    expect(res).toEqual({ owner: "vercel", repo: "next.js" });
  });

  it("should parse GitHub URLs with .git suffix", () => {
    const res = GitHubService.parseRepoString("https://github.com/tailwindlabs/tailwindcss.git");
    expect(res).toEqual({ owner: "tailwindlabs", repo: "tailwindcss" });
  });

  it("should return null for invalid strings", () => {
    expect(GitHubService.parseRepoString("invalid-repo")).toBeNull();
    expect(GitHubService.parseRepoString("")).toBeNull();
  });
});
