import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return null;
  }

  // Find user in database
  let user = await prisma.user.findUnique({
    where: { clerkUserId },
  });

  // If not found in database, create or sync from Clerk
  if (!user) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;
    const name = clerkUser
      ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || null
      : null;
    const imageUrl = clerkUser?.imageUrl ?? null;

    user = await prisma.user.upsert({
      where: { clerkUserId },
      update: {
        email,
        name,
        imageUrl,
      },
      create: {
        clerkUserId,
        email,
        name,
        imageUrl,
      },
    });
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
