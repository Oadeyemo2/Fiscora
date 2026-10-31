import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

// Returns the Fiscora users row for the signed-in Clerk user, or throws.
export async function getDbUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");
  if (!user.isActive) throw new Error("Account deactivated"); // UC-1
  return user;
}
