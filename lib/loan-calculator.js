// Loan amortization helpers (UC-11 Loan Tracking and Calculator).
// Pure functions with no database or framework imports, so they run the
// same on the server (when a loan is saved) and in the browser (live preview).

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

function addMonths(date, months) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  // Keep end-of-month dates sensible (Jan 31 + 1 month -> Feb 28/29)
  if (d.getDate() < day) d.setDate(0);
  return d;
}

/**
 * Validate calculator input. Returns an array of error messages (empty if valid).
 */
export function validateLoanInput({ principal, annualRate, termMonths }) {
  const errors = [];
  if (!Number.isFinite(principal) || principal <= 0)
    errors.push("Loan amount must be greater than zero.");
  if (!Number.isFinite(annualRate) || annualRate < 0 || annualRate > 100)
    errors.push("Interest rate must be between 0 and 100 percent.");
  if (!Number.isInteger(termMonths) || termMonths < 1 || termMonths > 600)
    errors.push("Term must be a whole number of months between 1 and 600.");
  return errors;
}

/**
 * Fixed monthly payment for a fully amortizing loan.
 *   M = P * r / (1 - (1 + r)^-n), where r is the monthly rate.
 * With a 0% rate the payment is simply P / n.
 */
export function monthlyPayment(principal, annualRate, termMonths) {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / termMonths;
  return (principal * r) / (1 - Math.pow(1 + r, -termMonths));
}

/**
 * Full repayment schedule plus summary figures.
 */
export function calculateLoan({ principal, annualRate, termMonths, startDate }) {
  const errors = validateLoanInput({ principal, annualRate, termMonths });
  if (errors.length) return { valid: false, errors };

  const r = annualRate / 100 / 12;
  const payment = monthlyPayment(principal, annualRate, termMonths);
  const start = startDate ? new Date(startDate) : new Date();

  const schedule = [];
  let balance = principal;
  let totalInterest = 0;

  for (let month = 1; month <= termMonths; month++) {
    const interest = balance * r;
    let principalPart = payment - interest;
    // The last payment clears whatever rounding left behind
    if (month === termMonths) principalPart = balance;
    balance = Math.max(0, balance - principalPart);
    totalInterest += interest;

    schedule.push({
      month,
      date: addMonths(start, month),
      payment: round2(principalPart + interest),
      principal: round2(principalPart),
      interest: round2(interest),
      balance: round2(balance),
    });
  }

  return {
    valid: true,
    monthlyPayment: round2(payment),
    totalInterest: round2(totalInterest),
    totalPaid: round2(principal + totalInterest),
    payoffDate: addMonths(start, termMonths),
    schedule,
  };
}

/**
 * Where a loan stands today, assuming every payment so far was made on time.
 */
export function loanProgress(loan, today = new Date()) {
  const result = calculateLoan(loan);
  if (!result.valid) return null;
  const paid = result.schedule.filter((row) => row.date <= today);
  const last = paid[paid.length - 1];
  const remainingBalance = last ? last.balance : loan.principal;
  return {
    paymentsMade: paid.length,
    paymentsLeft: loan.termMonths - paid.length,
    remainingBalance,
    percentPaid: round2(((loan.principal - remainingBalance) / loan.principal) * 100),
    nextPayment: result.schedule[paid.length] || null,
  };
}
