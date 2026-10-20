"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const fmt = (n) => `$${n.toFixed(2)}`;

export function ScheduleTable({ schedule }) {
  return (
    <div className="max-h-96 overflow-y-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Payment</TableHead>
            <TableHead className="text-right">Principal</TableHead>
            <TableHead className="text-right">Interest</TableHead>
            <TableHead className="text-right">Balance left</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.map((row) => (
            <TableRow key={row.month}>
              <TableCell>{row.month}</TableCell>
              <TableCell>{new Date(row.date).toLocaleDateString("en-US")}</TableCell>
              <TableCell className="text-right">{fmt(row.payment)}</TableCell>
              <TableCell className="text-right">{fmt(row.principal)}</TableCell>
              <TableCell className="text-right">{fmt(row.interest)}</TableCell>
              <TableCell className="text-right">{fmt(row.balance)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
