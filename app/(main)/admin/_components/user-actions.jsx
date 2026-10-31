"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Ban, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setUserRole, setUserActive, deleteUserAccount } from "@/actions/admin";

export function UserActions({ user, isSelf }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const changeRole = (role) =>
    startTransition(async () => {
      try {
        await setUserRole(user.id, role);
        toast.success(role === "ADMIN" ? "Now an admin" : "Now a client");
        router.refresh();
      } catch (e) {
        toast.error(e.message);
      }
    });

  const changeActive = (active) =>
    startTransition(async () => {
      try {
        await setUserActive(user.id, active);
        toast.success(active ? "Account reactivated" : "Account deactivated; their login is now refused");
        router.refresh();
      } catch (e) {
        toast.error(e.message);
      }
    });

  const remove = () =>
    startTransition(async () => {
      try {
        await deleteUserAccount(user.id);
        toast.success("User deleted from Fiscora and Clerk");
        router.push("/admin");
      } catch (e) {
        toast.error(e.message);
        setConfirming(false);
      }
    });

  if (isSelf) {
    return <p className="text-sm text-muted-foreground">This is your own account.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {user.role === "ADMIN" ? (
        <Button variant="outline" disabled={pending} onClick={() => changeRole("CLIENT")}>
          Make client
        </Button>
      ) : (
        <Button variant="outline" disabled={pending} onClick={() => changeRole("ADMIN")}>
          Make admin
        </Button>
      )}

      {user.isActive ? (
        <Button variant="outline" disabled={pending} onClick={() => changeActive(false)}>
          <Ban className="h-4 w-4" /> Deactivate
        </Button>
      ) : (
        <Button variant="outline" disabled={pending} onClick={() => changeActive(true)}>
          <RotateCcw className="h-4 w-4" /> Reactivate
        </Button>
      )}

      {confirming ? (
        <>
          <Button variant="destructive" disabled={pending} onClick={remove}>
            Yes, delete everything
          </Button>
          <Button variant="ghost" disabled={pending} onClick={() => setConfirming(false)}>
            Cancel
          </Button>
        </>
      ) : (
        <Button variant="outline" className="text-red-600" onClick={() => setConfirming(true)}>
          <Trash2 className="h-4 w-4" /> Delete user
        </Button>
      )}
    </div>
  );
}
