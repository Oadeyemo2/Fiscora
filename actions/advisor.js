"use server";

// UC-8 Get AI Financial Advice
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDbUser } from "@/lib/get-db-user";
import { defaultCategories } from "@/data/categories";

const AI_TIMEOUT_MS = 30_000; // REQ-8: answer within 30 seconds or show a retry message
const HISTORY_FOR_CONTEXT = 6; // earlier messages sent along so follow-ups make sense

const money = (n) => `$${Number(n).toFixed(2)}`;

// Default categories are stored by id; custom ones are stored by name
function categoryName(id) {
  return (
    defaultCategories.find((c) => c.id === id)?.name ||
    id
  );
}

// Builds the spending summary that goes into the prompt (last 90 days).
// Only figures are sent: no password, email, or account numbers (REQ-8).
async function buildFinancialSummary(userId) {
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const [transactions, accounts, budget, loans] = await Promise.all([
    db.transaction.findMany({ where: { userId, date: { gte: since } } }),
    db.account.findMany({ where: { userId } }),
    db.budget.findUnique({ where: { userId } }),
    db.loan.findMany({ where: { userId, status: "ACTIVE" } }),
  ]);

  let income = 0;
  let expenses = 0;
  const byCategory = {};
  for (const t of transactions) {
    const amount = t.amount.toNumber();
    if (t.type === "INCOME") income += amount;
    else {
      expenses += amount;
      const name = categoryName(t.category);
      byCategory[name] = (byCategory[name] || 0) + amount;
    }
  }

  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([name, total]) => `- ${name}: ${money(total)}`)
    .join("\n");

  const lines = [
    `Period: last 90 days (${transactions.length} transactions)`,
    `Total income: ${money(income)}`,
    `Total expenses: ${money(expenses)}`,
    `Net: ${money(income - expenses)}`,
    `Spending by category:\n${topCategories || "- none recorded"}`,
    `Accounts: ${
      accounts.map((a) => `${a.name} (${a.type}) ${money(a.balance.toNumber())}`).join("; ") ||
      "none"
    }`,
    `Monthly budget: ${budget ? money(budget.amount.toNumber()) : "not set"}`,
    `Active loans: ${
      loans
        .map(
          (l) =>
            `${l.name}, ${money(l.principal.toNumber())} at ${l.interestRate.toNumber()}% for ${
              l.termMonths
            } months, ${money(l.monthlyPayment.toNumber())}/month`
        )
        .join("; ") || "none"
    }`,
  ];

  return { text: lines.join("\n"), transactionCount: transactions.length };
}

function buildPrompt(summary, history, question, hasData = true) {
  const past = history
    .map((m) => `${m.role === "USER" ? "User" : "Advisor"}: ${m.content}`)
    .join("\n");

  const guidance = hasData
    ? `Base every suggestion on the figures below. Name the actual categories and amounts.
Do not give generic tips that ignore these numbers.`
    : `This user has not logged any transactions in the last 90 days, so there are no
personal figures yet. Answer the question with practical, general guidance for a student
or young professional, say briefly that the advice will be more personal once they add
income and expenses in Fiscora, and do not invent any numbers about this user.`;

  return `You are Fiscora's financial advisor for students and young professionals.
${guidance} Keep the answer under 200 words,
in plain sentences or a short list. You are not a licensed advisor; do not recommend
specific stocks or investment products.

USER'S FINANCES
${summary}

${past ? `EARLIER IN THIS CHAT\n${past}\n` : ""}
QUESTION
${question}`;
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI_TIMEOUT")), ms)
    ),
  ]);
}

export async function getChatHistory() {
  const user = await getDbUser();
  return db.aiMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
}

export async function askAdvisor(question) {
  const text = String(question || "").trim();
  if (!text) return { success: false, error: "Type a question first." };
  if (text.length > 500)
    return { success: false, error: "Keep the question under 500 characters." };

  try {
    const user = await getDbUser();

    // Save the question first so it stays in the history even if the AI fails
    const userMessage = await db.aiMessage.create({
      data: { userId: user.id, role: "USER", content: text },
    });

    const [summary, history] = await Promise.all([
      buildFinancialSummary(user.id),
      db.aiMessage.findMany({
        where: { userId: user.id, id: { not: userMessage.id } },
        orderBy: { createdAt: "desc" },
        take: HISTORY_FOR_CONTEXT,
      }),
    ]);

    // With no transactions yet the AI still answers, but gives general
    // guidance instead of advice based on the user's own figures
    const hasData = summary.transactionCount > 0;
    if (!process.env.GEMINI_API_KEY) throw new Error("AI_UNAVAILABLE");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite" });
    const prompt = buildPrompt(summary.text, history.reverse(), text, hasData);
    const result = await withTimeout(model.generateContent(prompt), AI_TIMEOUT_MS);
    const answer = result.response.text().trim();
    if (!answer) throw new Error("AI_EMPTY");

    const reply = await db.aiMessage.create({
      data: { userId: user.id, role: "ASSISTANT", content: answer },
    });

    revalidatePath("/advisor");
    return { success: true, data: { question: userMessage, reply } };
  } catch (error) {
    console.error("askAdvisor failed:", error.message);
    const friendly =
      error.message === "AI_TIMEOUT"
        ? "The advisor took too long to answer. Please try again."
        : error.message === "Unauthorized" || error.message === "User not found"
        ? "Please sign in again."
        : "The advisor is unavailable right now. Please try again in a minute.";
    return { success: false, error: friendly };
  }
}

export async function clearChatHistory() {
  const user = await getDbUser();
  await db.aiMessage.deleteMany({ where: { userId: user.id } });
  revalidatePath("/advisor");
  return { success: true };
}
