"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateLoan } from "@/lib/loan-calculator";
import { createLoan } from "@/actions/loan";
import { ScheduleTable } from "./schedule-table";

const LOAN_TYPES = [
  { value: "STUDENT", label: "Student loan" },
  { value: "AUTO", label: "Auto loan" },
  { value: "PERSONAL", label: "Personal loan" },
  { value: "MORTGAGE", label: "Mortgage" },
  { value: "OTHER", label: "Other" },
];

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  name: "",
  lender: "",
  loanType: "STUDENT",
  principal: "",
  interestRate: "",
  termMonths: "",
  startDate: today(),
};

export function LoanForm() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e?.target ? e.target.value : e }));

  // Live preview: recalculates on every keystroke, nothing is saved yet
  const preview = useMemo(() => {
    if (!form.principal || form.interestRate === "" || !form.termMonths) return null;
    return calculateLoan({
      principal: Number(form.principal),
      annualRate: Number(form.interestRate),
      termMonths: Number(form.termMonths),
      startDate: form.startDate,
    });
  }, [form.principal, form.interestRate, form.termMonths, form.startDate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await createLoan(form);
    setSaving(false);
    if (res.success) {
      toast.success(`${res.data.name} saved`);
      setForm({ ...emptyForm, startDate: today() });
      setShowSchedule(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" /> Loan calculator
        </CardTitle>
        <CardDescription>
          Enter the loan details to see the monthly payment, total interest and payoff date.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Loan name">
              <Input value={form.name} onChange={set("name")} placeholder="e.g. Car loan" required />
            </Field>
            <Field label="Lender">
              <Input value={form.lender} onChange={set("lender")} placeholder="e.g. Sallie Mae" required />
            </Field>
            <Field label="Type">
              <Select value={form.loanType} onValueChange={set("loanType")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Amount borrowed ($)">
              <Input type="number" min="0" step="0.01" value={form.principal} onChange={set("principal")} placeholder="10000" required />
            </Field>
            <Field label="Interest rate (% per year)">
              <Input type="number" min="0" max="100" step="0.01" value={form.interestRate} onChange={set("interestRate")} placeholder="5" required />
            </Field>
            <Field label="Term (months)">
              <Input type="number" min="1" max="600" step="1" value={form.termMonths} onChange={set("termMonths")} placeholder="60" required />
            </Field>
            <Field label="First payment month starts">
              <Input type="date" value={form.startDate} onChange={set("startDate")} required />
            </Field>
          </div>

          {preview && !preview.valid && (
            <ul className="text-sm text-red-600 list-disc pl-5">
              {preview.errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}

          {preview?.valid && (
            <div className="grid gap-4 md:grid-cols-4 rounded-lg bg-muted p-4">
              <Stat label="Monthly payment" value={`$${preview.monthlyPayment.toFixed(2)}`} />
              <Stat label="Total interest" value={`$${preview.totalInterest.toFixed(2)}`} />
              <Stat label="Total paid" value={`$${preview.totalPaid.toFixed(2)}`} />
              <Stat label="Paid off by" value={preview.payoffDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })} />
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving || !preview?.valid}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save loan
            </Button>
            {preview?.valid && (
              <Button type="button" variant="outline" onClick={() => setShowSchedule((s) => !s)}>
                {showSchedule ? "Hide" : "Show"} repayment schedule
              </Button>
            )}
          </div>

          {showSchedule && preview?.valid && <ScheduleTable schedule={preview.schedule} />}
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }) {
  return (
    <label className="space-y-2 block">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
