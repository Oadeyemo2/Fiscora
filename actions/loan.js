"use server";

// UC-11 Loan Tracking and Calculator
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDbUser } from "@/lib/get-db-user";
import { calculateLoan, loanProgress } from "@/lib/loan-calculator";
import { createNotification } from "@/lib/notifications";

const LOAN_TYPES = ["STUDENT", "AUTO", "PERSONAL", "MORTGAGE", "OTHER"];

const serializeLoan = (loan) => ({
  ...loan,
  principal: loan.principal.toNumber(),
  interestRate: loan.interestRate.toNumber(),
  monthlyPayment: loan.monthlyPayment.toNumber(),
  totalInterest: loan.totalInterest.toNumber(),
});

function parseLoanForm(data) {
  return {
    name: String(data.name || "").trim(),
    lender: String(data.lender || "").trim(),
    loanType: data.loanType,
    principal: Number(data.principal),
    annualRate: Number(data.interestRate),
    termMonths: Number(data.termMonths),
    startDate: data.startDate ? new Date(data.startDate) : new Date(),
  };
}

export async function createLoan(data) {
  try {
    const user = await getDbUser();
    const input = parseLoanForm(data);

    if (!input.name) throw new Error("Loan name is required.");
    if (!input.lender) throw new Error("Lender is required.");
    if (!LOAN_TYPES.includes(input.loanType)) throw new Error("Choose a loan type.");
    if (Number.isNaN(input.startDate.getTime())) throw new Error("Start date is invalid.");

    // Same calculation the browser preview uses, re-run on the server
    const result = calculateLoan(input);
    if (!result.valid) throw new Error(result.errors.join(" "));

    const loan = await db.loan.create({
      data: {
        name: input.name,
        lender: input.lender,
        loanType: input.loanType,
        principal: input.principal,
        interestRate: input.annualRate,
        termMonths: input.termMonths,
        startDate: input.startDate,
        monthlyPayment: result.monthlyPayment,
        totalInterest: result.totalInterest,
        payoffDate: result.payoffDate,
        userId: user.id,
      },
    });

    await createNotification(user.id, {
      type: "LOAN_ADDED",
      title: "Loan added",
      message: `${loan.name} from ${loan.lender}: $${result.monthlyPayment.toFixed(
        2
      )} a month until ${result.payoffDate.toLocaleDateString("en-US")}.`,
    });

    revalidatePath("/loans");
    return { success: true, data: serializeLoan(loan) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getUserLoans() {
  const user = await getDbUser();
  const loans = await db.loan.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return loans.map((loan) => {
    const plain = serializeLoan(loan);
    const progress = loanProgress({
      principal: plain.principal,
      annualRate: plain.interestRate,
      termMonths: plain.termMonths,
      startDate: plain.startDate,
    });
    return { ...plain, progress };
  });
}

export async function getLoanSchedule(id) {
  const user = await getDbUser();
  const loan = await db.loan.findFirst({ where: { id, userId: user.id } });
  if (!loan) throw new Error("Loan not found");
  const plain = serializeLoan(loan);
  const result = calculateLoan({
    principal: plain.principal,
    annualRate: plain.interestRate,
    termMonths: plain.termMonths,
    startDate: plain.startDate,
  });
  return { loan: plain, ...result };
}

export async function markLoanPaidOff(id) {
  try {
    const user = await getDbUser();
    await db.loan.update({
      where: { id, userId: user.id },
      data: { status: "PAID_OFF" },
    });
    revalidatePath("/loans");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteLoan(id) {
  try {
    const user = await getDbUser();
    await db.loan.delete({ where: { id, userId: user.id } });
    revalidatePath("/loans");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
