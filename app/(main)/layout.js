import React from "react";
import { auth } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { Ban } from "lucide-react";
import { db } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { SessionTimeout } from "@/components/session-timeout";

// UC-1: a deactivated account can't use any page, even with an open session
const MainLayout = async ({ children }) => {
  const { userId } = await auth();
  const user = userId
    ? await db.user.findUnique({ where: { clerkUserId: userId }, select: { isActive: true } })
    : null;

  if (user && !user.isActive) {
    return (
      <div className="container mx-auto my-32 px-5">
        <div className="max-w-md mx-auto text-center space-y-4">
          <Ban className="h-12 w-12 mx-auto text-red-600" />
          <p className="text-sm font-semibold text-red-600">Account deactivated</p>
          <h1 className="text-3xl font-bold">This account has been deactivated</h1>
          <p className="text-muted-foreground">
            An administrator has switched this account off. Your data is kept, and an
            administrator can reactivate it.
          </p>
          <SignOutButton redirectUrl="/">
            <Button>Sign out</Button>
          </SignOutButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-32">
      {userId && <SessionTimeout />}
      {children}
    </div>
  );
};

export default MainLayout;
