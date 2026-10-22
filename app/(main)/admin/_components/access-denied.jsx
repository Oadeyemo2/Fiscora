import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

// Shown when a client opens an admin page (UC-1: access denied, HTTP 403)
export function AccessDenied() {
  return (
    <div className="px-5 max-w-xl mx-auto text-center space-y-4 py-16">
      <ShieldAlert className="h-12 w-12 mx-auto text-red-500" />
      <p className="text-sm font-semibold text-red-600">403 · Access denied</p>
      <h1 className="text-3xl font-bold">This page is for admins only</h1>
      <p className="text-muted-foreground">
        Your account is a client account, so it can see your own money but not other people&apos;s.
      </p>
      <Link href="/dashboard">
        <Button>Back to my dashboard</Button>
      </Link>
    </div>
  );
}
