"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { setWeeklySummary, sendTestWeeklySummary } from "@/actions/notification";

// REQ-10 / UC-10: weekly summary on/off and a button to send one now
export function EmailSettings({ email, weeklySummary }) {
  const [enabled, setEnabled] = useState(weeklySummary);
  const [pending, startTransition] = useTransition();

  const toggle = (value) => {
    setEnabled(value);
    startTransition(async () => {
      const res = await setWeeklySummary(value);
      if (res?.success) {
        toast.success(value ? "Weekly summaries switched on" : "Weekly summaries switched off");
      } else {
        setEnabled(!value);
        toast.error("Could not save the setting");
      }
    });
  };

  const sendNow = () => {
    startTransition(async () => {
      const res = await sendTestWeeklySummary();
      if (res?.success) toast.success(`Summary sent to ${email}`);
      else toast.error(res?.error || "Could not send the summary");
    });
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
          <div className="flex-1">
            <p className="font-semibold">Email notifications</p>
            <p className="text-sm text-muted-foreground">
              Budget warnings and unusual-expense alerts are always emailed to {email}.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <div>
            <p className="text-sm font-medium">Weekly summary</p>
            <p className="text-xs text-muted-foreground">
              Every Monday: last week&rsquo;s income, expenses and top categories.
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={toggle} disabled={pending} />
        </div>
        <Button variant="outline" size="sm" onClick={sendNow} disabled={pending}>
          Send me this week&rsquo;s summary now
        </Button>
      </CardContent>
    </Card>
  );
}
