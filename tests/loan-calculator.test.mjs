// Run with: node tests/loan-calculator.test.mjs
import assert from "node:assert/strict";
import { calculateLoan, validateLoanInput, loanProgress } from "../lib/loan-calculator.js";

// Textbook case: $200,000 at 6.5% for 30 years -> $1,264.14 / month
const mortgage = calculateLoan({ principal: 200000, annualRate: 6.5, termMonths: 360, startDate: "2026-01-01" });
assert.equal(mortgage.monthlyPayment, 1264.14);
assert.equal(mortgage.schedule.length, 360);
assert.equal(mortgage.schedule.at(-1).balance, 0);

// $10,000 at 5% for 5 years -> $188.71 / month, about $1,322.74 interest
const car = calculateLoan({ principal: 10000, annualRate: 5, termMonths: 60, startDate: "2026-01-15" });
assert.equal(car.monthlyPayment, 188.71);
assert.ok(Math.abs(car.totalInterest - 1322.74) < 0.05, `interest ${car.totalInterest}`);
assert.equal(car.payoffDate.toISOString().slice(0, 10), "2031-01-15");

// Zero interest -> straight division
const zero = calculateLoan({ principal: 1200, annualRate: 0, termMonths: 12 });
assert.equal(zero.monthlyPayment, 100);
assert.equal(zero.totalInterest, 0);

// Validation
assert.equal(validateLoanInput({ principal: -5, annualRate: 5, termMonths: 12 }).length, 1);
assert.equal(calculateLoan({ principal: 1000, annualRate: 5, termMonths: 0 }).valid, false);

// Progress after 12 on-time payments
const p = loanProgress({ principal: 10000, annualRate: 5, termMonths: 60, startDate: "2025-01-15" }, new Date("2026-01-20"));
assert.equal(p.paymentsMade, 12);
assert.equal(p.paymentsLeft, 48);

console.log("All loan calculator tests passed.");
