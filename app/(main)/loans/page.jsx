import { getUserLoans } from "@/actions/loan";
import { LoanForm } from "./_components/loan-form";
import { LoanList } from "./_components/loan-list";

export const metadata = { title: "Loans | Fiscora" };

export default async function LoansPage() {
  const loans = await getUserLoans();

  const active = loans.filter((l) => l.status === "ACTIVE");
  const owed = active.reduce((sum, l) => sum + (l.progress?.remainingBalance ?? l.principal), 0);
  const monthly = active.reduce((sum, l) => sum + l.monthlyPayment, 0);

  return (
    <div className="px-5 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-5xl gradient-title">Loans</h1>
          <p className="text-muted-foreground mt-2">
            Log a loan, see the repayment plan, and track what is left to pay.
          </p>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Still owed</p>
            <p className="text-2xl font-bold">${owed.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Monthly payments</p>
            <p className="text-2xl font-bold">${monthly.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <LoanForm />
      <LoanList loans={loans} />
    </div>
  );
}
