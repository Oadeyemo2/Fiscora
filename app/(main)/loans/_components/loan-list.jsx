"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, CheckCircle2, ListOrdered } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { calculateLoan } from "@/lib/loan-calculator";
import { deleteLoan, markLoanPaidOff } from "@/actions/loan";
import { ScheduleTable } from "./schedule-table";

const TYPE_LABEL = {
  STUDENT: "Student",
  AUTO: "Auto",
  PERSONAL: "Personal",
  MORTGAGE: "Mortgage",
  OTHER: "Other",
};

export function LoanList({ loans }) {
  if (!loans.length) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No loans yet. Fill in the calculator above and press Save loan.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {loans.map((loan) => (
        <LoanCard key={loan.id} loan={loan} />
      ))}
    </div>
  );
}

function LoanCard({ loan }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const p = loan.progress;
  const paidOff = loan.status === "PAID_OFF";

  const run = async (action, okMessage) => {
    setBusy(true);
    const res = await action(loan.id);
    setBusy(false);
    if (res.success) {
      toast.success(okMessage);
      router.refresh();
    } else toast.error(res.error);
  };

  const onDelete = () => {
    if (confirm(`Delete "${loan.name}"? This cannot be undone.`))
      run(deleteLoan, "Loan deleted");
  };

  return (
    <Card className={paidOff ? "opacity-70" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>{loan.name}</CardTitle>
            <CardDescription>
              {loan.lender} · {TYPE_LABEL[loan.loanType]} · {loan.interestRate}% for {loan.termMonths} months
            </CardDescription>
          </div>
          <Badge variant={paidOff ? "secondary" : "default"}>{paidOff ? "Paid off" : "Active"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Monthly</p>
            <p className="font-semibold">${loan.monthlyPayment.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Left to pay</p>
            <p className="font-semibold">${paidOff ? "0.00" : (p?.remainingBalance ?? loan.principal).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Payoff</p>
            <p className="font-semibold">
              {new Date(loan.payoffDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        {!paidOff && p && (
          <div className="space-y-1">
            <Progress value={p.percentPaid} />
            <p className="text-xs text-muted-foreground">
              {p.paymentsMade} of {loan.termMonths} payments made ({p.percentPaid.toFixed(1)}% of the principal)
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
            <ListOrdered className="h-4 w-4" /> {open ? "Hide" : "Schedule"}
          </Button>
          {!paidOff && (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => run(markLoanPaidOff, "Marked as paid off")}>
              <CheckCircle2 className="h-4 w-4" /> Paid off
            </Button>
          )}
          <Button size="sm" variant="ghost" disabled={busy} onClick={onDelete} className="text-red-600">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>

        {open && (
          <ScheduleTable
            schedule={
              calculateLoan({
                principal: loan.principal,
                annualRate: loan.interestRate,
                termMonths: loan.termMonths,
                startDate: loan.startDate,
              }).schedule
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
