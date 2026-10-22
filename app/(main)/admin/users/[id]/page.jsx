import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminUser, getAdminUserDetail } from "@/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccessDenied } from "../../_components/access-denied";
import { UserActions } from "../../_components/user-actions";

export const metadata = { title: "User | Fiscora admin" };

const money = (n) => (n == null ? "—" : `$${n.toFixed(2)}`);
const ACCOUNT_LABEL = { CURRENT: "Checking", SAVINGS: "Savings", CREDIT_CARD: "Credit card" };

export default async function AdminUserPage({ params }) {
  const admin = await getAdminUser();
  if (!admin) return <AccessDenied />;

  const { id } = await params;
  const u = await getAdminUserDetail(id);
  if (!u) notFound();

  return (
    <div className="px-5 space-y-6">
      <Link href="/admin" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:underline">
        <ArrowLeft className="h-4 w-4" /> All users
      </Link>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold">{u.name || "(no name)"}</h1>
            <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
              {u.role === "ADMIN" ? "Admin" : "Client"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {u.email} · joined {new Date(u.createdAt).toLocaleDateString("en-US")} ·{" "}
            {u.counts.transactions} transactions · {u.counts.aiMessages} advisor messages
          </p>
        </div>
        <UserActions user={{ id: u.id, role: u.role }} isSelf={u.id === admin.id} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Accounts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {u.accounts.length === 0 && <p className="text-sm text-muted-foreground">None</p>}
            {u.accounts.map((a) => (
              <div key={a.id} className="flex justify-between text-sm">
                <span>
                  {a.name} <span className="text-muted-foreground">({ACCOUNT_LABEL[a.type]})</span>
                  {a.isDefault && <span className="text-muted-foreground"> · default</span>}
                </span>
                <span className="font-medium">{money(a.balance)}</span>
              </div>
            ))}
            <p className="text-sm pt-2 border-t">Monthly budget: <b>{money(u.budget)}</b></p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Loans</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {u.loans.length === 0 && <p className="text-sm text-muted-foreground">None</p>}
            {u.loans.map((l) => (
              <div key={l.id} className="text-sm">
                <div className="flex justify-between">
                  <span>{l.name} · {l.lender}</span>
                  <span className="font-medium">{money(l.monthlyPayment)}/mo</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {money(l.principal)} borrowed · {l.status === "PAID_OFF" ? "paid off" : `payoff ${new Date(l.payoffDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Rewards and categories</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-1">
              {u.rewards.length === 0 && <span className="text-muted-foreground">No rewards yet</span>}
              {u.rewards.map((r) => (
                <Badge key={r.id} variant="outline">{r.title} · {r.points} pts</Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {u.categories.length === 0 && <span className="text-muted-foreground">No custom categories</span>}
              {u.categories.map((c) => (
                <Badge key={c.id} variant="secondary">{c.name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Latest transactions</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {u.transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2">Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Account</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {u.transactions.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="py-2">{new Date(t.date).toLocaleDateString("en-US")}</td>
                    <td>{t.description || "—"}</td>
                    <td className="capitalize">{t.category}</td>
                    <td>{t.account}</td>
                    <td className={`text-right font-medium ${t.type === "EXPENSE" ? "text-red-600" : "text-emerald-600"}`}>
                      {t.type === "EXPENSE" ? "-" : "+"}{money(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
