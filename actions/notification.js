"use server";

// UC-10 Notifications: every alert is stored first, then handed to the
// Email System (Resend). The row keeps the delivery status.
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDbUser } from "@/lib/get-db-user";

export async function getNotifications() {
  const user = await getDbUser();
  return db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markAllNotificationsRead() {
  const user = await getDbUser();
  await db.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/notifications");
  return { success: true };
}
