import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const basePrisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  return basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          try {
            return await query(args);
          } catch (error: any) {
            const isConnectionTerminated =
              error?.message?.includes("57P01") ||
              error?.message?.includes("terminating connection due to administrator command") ||
              error?.message?.includes("Connection closed") ||
              error?.code === "P1017";

            if (isConnectionTerminated) {
              console.warn(
                "[Prisma] Neon compute woke from idle state (57P01). Reconnecting and retrying operation..."
              );
              await basePrisma.$disconnect().catch(() => {});
              return await query(args);
            }
            throw error;
          }
        },
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

