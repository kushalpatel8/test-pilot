import { describe, it, expect, vi } from "vitest";
import { RepositoryService } from "@/services/repository.service";
import { prisma } from "@/lib/prisma";

describe("Resource Authorization & Ownership Enforcement", () => {
  it("should prevent access to another user's repository", async () => {
    // Mock prisma.repository.findFirst to simulate not finding repository for userB
    const findFirstSpy = vi.spyOn(prisma.repository, "findFirst").mockResolvedValue(null as any);

    await expect(
      RepositoryService.getRepositoryById("user-attacker", "repo-private-123")
    ).rejects.toThrow("Repository not found or access denied");

    expect(findFirstSpy).toHaveBeenCalledWith({
      where: {
        id: "repo-private-123",
        userId: "user-attacker",
      },
      include: expect.any(Object),
    });

    findFirstSpy.mockRestore();
  });

  it("should prevent disconnecting another user's repository", async () => {
    const findFirstSpy = vi.spyOn(prisma.repository, "findFirst").mockResolvedValue(null as any);

    await expect(
      RepositoryService.disconnectRepository("user-attacker", "repo-victim-456")
    ).rejects.toThrow("Repository not found or access denied");

    findFirstSpy.mockRestore();
  });

  it("should prevent deleting another user's repository", async () => {
    const findFirstSpy = vi.spyOn(prisma.repository, "findFirst").mockResolvedValue(null as any);

    await expect(
      RepositoryService.deleteRepository("user-attacker", "repo-victim-456")
    ).rejects.toThrow("Repository not found or access denied");

    findFirstSpy.mockRestore();
  });
});
