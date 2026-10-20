// Internal helpers for UC-10 notifications. Deliberately NOT a "use server"
// file: these are called from other server code only, never from the browser.
import { db } from "@/lib/prisma";

const MAX_ATTEMPTS = 3;

export async function createNotification(userId, { type, title, message }) {
  return db.notification.create({
    data: { userId, type, title, message, status: "QUEUED" },
  });
}

// Called after an email send attempt so the row reflects what happened.
export async function recordDelivery(notificationId, delivered) {
  const current = await db.notification.findUnique({
    where: { id: notificationId },
  });
  if (!current) return null;
  const attempts = current.attempts + 1;
  return db.notification.update({
    where: { id: notificationId },
    data: {
      attempts,
      status: delivered ? "SENT" : attempts >= MAX_ATTEMPTS ? "FAILED" : "QUEUED",
      sentAt: delivered ? new Date() : null,
    },
  });
}

