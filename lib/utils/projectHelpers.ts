import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

/**
 * Finds a project that belongs to the given user using the compound unique index `[id, userId]`.
 * Guarantees 100% type safety and instant O(1) B-Tree index lookup.
 */
export async function getOwnedProject<
  T extends Prisma.ProjectSelect,
>(userId: string, projectId: string, select: T) {
  return prisma.project.findUnique({
    where: {
      id_userId: { id: projectId, userId },
    },
    select,
  });
}