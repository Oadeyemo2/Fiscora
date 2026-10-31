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

// REQ-10: each user can switch the weekly summary email on or off
export async function setWeeklySummary(enabled) {
  const user = await getDbUser();
  await db.user.update({
    where: { id: user.id },
    data: { weeklySummary: Boolean(enabled) },
  });
  revalidatePath("/notifications");
  return { success: true, weeklySummary: Boolean(enabled) };
}

// Sends this week's summary now, so a user (or a demo) does not have to
// wait for Monday. Limited to one every 5 minutes.
export async function sendTestWeeklySummary() {
  const user = await getDbUser();
  const recent = await db.notification.findFirst({
    where: {
      userId: user.id,
      type: "WEEKLY_SUMMARY",
      createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
    },
  });
  if (recent) {
    return { success: false, error: "A summary was sent less than 5 minutes ago." };
  }
  const { sendWeeklySummary } = await import("@/lib/inngest/function");
  const result = await sendWeeklySummary(user.id);
  revalidatePath("/notifications");
  return result.success
    ? { success: true }
    : { success: false, error: "The summary was saved here, but the email could not be sent." };
}
