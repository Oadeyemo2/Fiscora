"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function UserTable({ users, currentAdminId }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("ALL");

  const q = query.trim().toLowerCase();
  const shown = users.filter(
    (u) =>
      (role === "ALL" || u.role === role) &&
      (!q || (u.name || "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  );

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-background"
            aria-label="Filter by role"
          >
            <option value="ALL">All roles</option>
            <option value="CLIENT">Clients</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Accounts</TableHead>
                <TableHead className="text-right">Transactions</TableHead>
                <TableHead className="text-right">Loans</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Rewards</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No users match.
                  </TableCell>
                </TableRow>
              )}
              {shown.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Link href={`/admin/users/${u.id}`} className="font-medium hover:underline">
                      {u.name || "(no name)"}
                    </Link>
                    {u.id === currentAdminId && (
                      <span className="text-xs text-muted-foreground"> (you)</span>
                    )}
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                      {u.role === "ADMIN" ? "Admin" : "Client"}
                    </Badge>
                    {!u.isActive && (
                      <Badge variant="destructive" className="ml-1">Deactivated</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{u.counts.accounts}</TableCell>
                  <TableCell className="text-right">{u.counts.transactions}</TableCell>
                  <TableCell className="text-right">{u.counts.loans}</TableCell>
                  <TableCell className="text-right">
                    {u.budget == null ? "—" : `$${u.budget.toFixed(2)}`}
                  </TableCell>
                  <TableCell className="text-right">{u.counts.rewards}</TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString("en-US")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
