import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const cleanupUnverifiedUsers = async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        isVerified: false,
        createdAt: { lt: cutoff },
      },
      select: { id: true, email: true },
    });

    if (unverifiedUsers.length > 0) {
      console.log("Deleting unverified users:", unverifiedUsers);

      await prisma.verificationToken.deleteMany({
        where: { userId: { in: unverifiedUsers.map((u) => u.id) } },
      });

      await prisma.user.deleteMany({
        where: { id: { in: unverifiedUsers.map((u) => u.id) } },
      });

      console.log(`✅ Deleted ${unverifiedUsers.length} unverified users`);
      return { deleted: unverifiedUsers.length };
    } else {
      console.log("No unverified users to delete");
      return { deleted: 0 };
    }
  } catch (err) {
    console.error("Cleanup error:", err);
    throw err;
  }
};
