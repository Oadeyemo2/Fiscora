// Feature 14 Gamification / Rewards.
// Each badge has a rule that looks at the user's own data and returns
// { done, progress, goal }. Earned badges are saved in the rewards table
// the first time the rule passes, so they stay earned.
import { db } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

const monthRange = (offset = 0) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
  return { start, end };
};

export const BADGES = [
  {
    code: "FIRST_TRANSACTION",
    title: "First step",
    description: "Log your first income or expense.",
    points: 10,
    check: (s) => ({ progress: Math.min(s.transactions, 1), goal: 1 }),
  },
  {
    code: "TEN_TRANSACTIONS",
    title: "Getting the habit",
    description: "Log 10 transactions.",
    points: 20,
    check: (s) => ({ progress: Math.min(s.transactions, 10), goal: 10 }),
  },
  {
    code: "FIFTY_TRANSACTIONS",
    title: "Money tracker",
    description: "Log 50 transactions.",
    points: 50,
    check: (s) => ({ progress: Math.min(s.transactions, 50), goal: 50 }),
  },
  {
    code: "ACTIVE_WEEK",
    title: "Busy week",
    description: "Log something on 5 different days in the last 7 days.",
    points: 30,
    check: (s) => ({ progress: Math.min(s.activeDaysThisWeek, 5), goal: 5 }),
  },
  {
    code: "TWO_ACCOUNTS",
    title: "Organised",
    description: "Add a second bank account.",
    points: 10,
    check: (s) => ({ progress: Math.min(s.accounts, 2), goal: 2 }),
  },
  {
    code: "BUDGET_SET",
    title: "Planner",
    description: "Set a monthly budget.",
    points: 10,
    check: (s) => ({ progress: s.hasBudget ? 1 : 0, goal: 1 }),
  },
  {
    code: "UNDER_BUDGET",
    title: "On target",
    description: "Finish a month with spending at or under your budget.",
    points: 50,
    check: (s) => ({ progress: s.lastMonthUnderBudget ? 1 : 0, goal: 1 }),
  },
  {
    code: "SAVED_A_MONTH",
    title: "Saver",
    description: "Finish a month with more income than spending.",
    points: 40,
    check: (s) => ({ progress: s.lastMonthSaved ? 1 : 0, goal: 1 }),
  },
  {
    code: "CUSTOM_CATEGORY",
    title: "Made it mine",
    description: "Create a custom category.",
    points: 10,
    check: (s) => ({ progress: Math.min(s.categories, 1), goal: 1 }),
  },
  {
    code: "LOAN_PLANNED",
    title: "Debt planner",
    description: "Add a loan to the loan planner.",
    points: 10,
    check: (s) => ({ progress: Math.min(s.loans, 1), goal: 1 }),
  },
  {
    code: "LOAN_PAID_OFF",
    title: "Debt free",
    description: "Mark a loan as paid off.",
    points: 100,
    check: (s) => ({ progress: Math.min(s.loansPaidOff, 1), goal: 1 }),
  },
  {
    code: "ASKED_ADVISOR",
    title: "Curious",
    description: "Ask the AI advisor a question.",
    points: 10,
    check: (s) => ({ progress: Math.min(s.advisorQuestions, 1), goal: 1 }),
  },
];

export const POINTS_PER_LEVEL = 100;

async function gatherStats(userId) {
  const last = monthRange(-1);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [transactions, accounts, budget, categories, loans, loansPaidOff, advisorQuestions, lastMonth, week] =
    await Promise.all([
      db.transaction.count({ where: { userId } }),
      db.account.count({ where: { userId } }),
      db.budget.findFirst({ where: { userId } }),
      db.category.count({ where: { userId } }),
      db.loan.count({ where: { userId } }),
      db.loan.count({ where: { userId, status: "PAID_OFF" } }),
      db.aiMessage.count({ where: { userId, role: "USER" } }),
      db.transaction.groupBy({
        by: ["type"],
        where: { userId, date: { gte: last.start, lt: last.end } },
        _sum: { amount: true },
      }),
      db.transaction.findMany({
        where: { userId, date: { gte: weekAgo } },
        select: { date: true },
      }),
    ]);

  const sum = (type) => Number(lastMonth.find((g) => g.type === type)?._sum.amount ?? 0);
  const lastIncome = sum("INCOME");
  const lastExpense = sum("EXPENSE");
  const activeDaysThisWeek = new Set(week.map((t) => t.date.toISOString().slice(0, 10))).size;

  return {
    transactions,
    accounts,
    hasBudget: Boolean(budget),
    // budget badge needs some spending last month, so an empty month doesn't count
    lastMonthUnderBudget: Boolean(budget) && lastExpense > 0 && lastExpense <= Number(budget.amount),
    lastMonthSaved: lastIncome > 0 && lastIncome > lastExpense,
    categories,
    loans,
    loansPaidOff,
    advisorQuestions,
    activeDaysThisWeek,
  };
}

// Works out every badge for the user, saves newly earned ones (with a
// notification) and returns the full picture for the rewards page.
export async function evaluateRewards(userId) {
  const [stats, saved] = await Promise.all([
    gatherStats(userId),
    db.reward.findMany({ where: { userId } }),
  ]);
  const earned = new Map(saved.map((r) => [r.code, r]));

  const badges = [];
  for (const badge of BADGES) {
    const { progress, goal } = badge.check(stats);
    let record = earned.get(badge.code);
    if (!record && progress >= goal) {
      record = await db.reward.upsert({
        where: { userId_code: { userId, code: badge.code } },
        update: {},
        create: { userId, code: badge.code, title: badge.title, points: badge.points },
      });
      await createNotification(userId, {
        type: "REWARD_EARNED",
        title: `Reward earned: ${badge.title}`,
        message: `${badge.description} +${badge.points} points.`,
      });
    }
    badges.push({
      code: badge.code,
      title: badge.title,
      description: badge.description,
      points: badge.points,
      progress,
      goal,
      earnedAt: record?.earnedAt ?? null,
    });
  }

  const points = badges.filter((b) => b.earnedAt).reduce((s, b) => s + b.points, 0);
  return {
    badges,
    points,
    level: Math.floor(points / POINTS_PER_LEVEL) + 1,
    pointsIntoLevel: points % POINTS_PER_LEVEL,
  };
}
