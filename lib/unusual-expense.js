// UC-10 Email Notifications: unusual transaction alert.
// Server-only helper (not a "use server" file), called after an expense is saved.
import { db } from "@/lib/prisma";
import { createNotification, recordDelivery } from "@/lib/notifications";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";
import { defaultCategories } from "@/data/categories";

const HISTORY_DAYS = 90;
const MIN_HISTORY = 3; // need a few earlier expenses before "usual" means anything
const TIMES_USUAL = 3; // 3x the usual amount for the category
const LARGE_EXPENSE = 1000; // any single expense this big is flagged

const money = (n) => Number(n).toFixed(2);
const categoryName = (id) => defaultCategories.find((c) => c.id === id)?.name || id;

// Returns the reason the expense is unusual, or null if it looks normal.
export async function findUnusualReason(transaction) {
  const amount = Number(transaction.amount);
  const since = new Date();
  since.setDate(since.getDate() - HISTORY_DAYS);

  const earlier = await db.transaction.aggregate({
    where: {
      userId: transaction.userId,
      type: "EXPENSE",
      category: transaction.category,
      id: { not: transaction.id },
      date: { gte: since },
    },
    _avg: { amount: true },
    _count: true,
  });

  const count = earlier._count;
  const usual = earlier._avg.amount ? earlier._avg.amount.toNumber() : 0;

  if (count >= MIN_HISTORY && amount >= usual * TIMES_USUAL) {
    return `That is ${(amount / usual).toFixed(1)} times your usual ${categoryName(
      transaction.category
    )} expense of $${money(usual)} over the last ${HISTORY_DAYS} days.`;
  }
  if (amount >= LARGE_EXPENSE) {
    return `Fiscora flags any single expense of $${LARGE_EXPENSE} or more.`;
  }
  return null;
}

// Stores an in-app notification and emails the user when an expense is unusual.
export async function checkUnusualExpense(transaction) {
  try {
    if (transaction.type !== "EXPENSE") return null;
    const reason = await findUnusualReason(transaction);
    if (!reason) return null;

    const [user, account] = await Promise.all([
      db.user.findUnique({ where: { id: transaction.userId } }),
      db.account.findUnique({ where: { id: transaction.accountId } }),
    ]);
    if (!user) return null;

    const category = categoryName(transaction.category);
    const notification = await createNotification(user.id, {
      type: "UNUSUAL_TRANSACTION",
      title: `Unusual expense: $${money(transaction.amount)} on ${category}`,
      message: reason,
    });

    const delivery = await sendEmail({
      to: user.email,
      subject: `Unusual expense of $${money(transaction.amount)} in Fiscora`,
      react: EmailTemplate({
        userName: user.name || "",
        type: "unusual-transaction",
        data: {
          amount: money(transaction.amount),
          category,
          description: transaction.description,
          accountName: account?.name || "your account",
          date: new Date(transaction.date).toLocaleDateString("en-US"),
          reason,
        },
      }),
    });
    await recordDelivery(notification.id, delivery.success);
    return notification;
  } catch (error) {
    // never let an alert problem break adding the expense
    console.error("Unusual expense check failed:", error.message);
    return null;
  }
}
