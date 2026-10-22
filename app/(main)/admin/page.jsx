import Link from "next/link";
import { getAdminUser, getAdminOverview } from "@/actions/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccessDenied } from "./_components/access-denied";
import { UserTable } from "./_components/user-table";

export const metadata = { title: "Admin | Fiscora" };

export default async function AdminPage() {
  const admin = await getAdminUser();
  if (!admin) return <AccessDenied />;

  const { stats, users } = await getAdminOverview();
  const cards = [
    ["Users", stats.userCount],
    ["Bank accounts", stats.accountCount],
    ["Transactions", stats.transactionCount],
    ["Loans", stats.loanCount],
    ["Advisor questions", stats.advisorQuestions],
  ];

  return (
    <div className="px-5 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-5xl gradient-title">Admin</h1>
          <p className="text-muted-foreground mt-2">
            Every Fiscora user and what they use. Open a user to see their accounts,
            transactions, loans and rewards, change their role or delete them.
          </p>
        </div>
        <Link href="/dashboard?view=me">
          <Button variant="outline">My own dashboard</Button>
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <CardContent>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <UserTable users={JSON.parse(JSON.stringify(users))} currentAdminId={admin.id} />
    </div>
  );
}
