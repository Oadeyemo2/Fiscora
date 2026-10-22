"use server";

// Admin System: view every user and their data, change roles, delete users.
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";

const toNumber = (d) => (d == null ? null : Number(d));

// Returns the signed-in user's row if they are an admin, otherwise null.
export async function getAdminUser() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  return user?.role === "ADMIN" ? user : null;
}

async function requireAdmin() {
  const admin = await getAdminUser();
  if (!admin) throw new Error("Forbidden: admin only");
  return admin;
}

export async function getAdminOverview() {
  await requireAdmin();

  const [users, totals] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            accounts: true,
            transactions: true,
            loans: true,
            aiMessages: true,
            rewards: true,
          },
        },
        budgets: { select: { amount: true } },
      },
    }),
    Promise.all([
      db.user.count(),
      db.account.count(),
      db.transaction.count(),
      db.loan.count(),
      db.aiMessage.count({ where: { role: "USER" } }),
    ]),
  ]);

  const [userCount, accountCount, transactionCount, loanCount, advisorQuestions] = totals;

  return {
    stats: { userCount, accountCount, transactionCount, loanCount, advisorQuestions },
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      budget: toNumber(u.budgets[0]?.amount),
      counts: u._count,
    })),
  };
}

export async function getAdminUserDetail(id) {
  await requireAdmin();

  const u = await db.user.findUnique({
    where: { id },
    include: {
      accounts: { orderBy: { createdAt: "asc" } },
      budgets: true,
      loans: { orderBy: { createdAt: "desc" } },
      categories: { orderBy: { name: "asc" } },
      rewards: { orderBy: { earnedAt: "desc" } },
      transactions: { orderBy: { date: "desc" }, take: 25 },
      _count: { select: { transactions: true, aiMessages: true, notifications: true } },
    },
  });
  if (!u) return null;

  const accountNames = Object.fromEntries(u.accounts.map((a) => [a.id, a.name]));

  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    imageUrl: u.imageUrl,
    createdAt: u.createdAt,
    budget: toNumber(u.budgets[0]?.amount),
    counts: u._count,
    accounts: u.accounts.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      balance: toNumber(a.balance),
      isDefault: a.isDefault,
    })),
    loans: u.loans.map((l) => ({
      id: l.id,
      name: l.name,
      lender: l.lender,
      principal: toNumber(l.principal),
      monthlyPayment: toNumber(l.monthlyPayment),
      status: l.status,
      payoffDate: l.payoffDate,
    })),
    categories: u.categories.map((c) => ({ id: c.id, name: c.name, type: c.type })),
    rewards: u.rewards.map((r) => ({ id: r.id, title: r.title, points: r.points, earnedAt: r.earnedAt })),
    transactions: u.transactions.map((t) => ({
      id: t.id,
      date: t.date,
      type: t.type,
      category: t.category,
      description: t.description,
      amount: toNumber(t.amount),
      account: accountNames[t.accountId] || "",
    })),
  };
}

export async function setUserRole(id, role) {
  const admin = await requireAdmin();
  if (!["CLIENT", "ADMIN"].includes(role)) throw new Error("Unknown role");
  if (id === admin.id && role !== "ADMIN") {
    throw new Error("You can't remove your own admin role.");
  }
  await db.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin");
  revalidatePath(`/admin/users/${id}`);
  return { success: true };
}

// Deletes the person everywhere: their Clerk login and their users row.
// Every other table cascades from users, so all their data goes with it.
export async function deleteUserAccount(id) {
  const admin = await requireAdmin();
  if (id === admin.id) throw new Error("You can't delete your own account here.");

  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(user.clerkUserId);
  } catch (error) {
    // 404 means the Clerk login was already gone; anything else stops here
    if (error?.status !== 404) {
      throw new Error("Couldn't delete the login in Clerk: " + (error?.message || "unknown error"));
    }
  }

  await db.user.delete({ where: { id } });
  revalidatePath("/admin");
  return { success: true };
}
