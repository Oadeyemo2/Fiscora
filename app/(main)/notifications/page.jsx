import { getNotifications, markAllNotificationsRead } from "@/actions/notification";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDbUser } from "@/lib/get-db-user";
import { EmailSettings } from "./_components/email-settings";

export const metadata = { title: "Notifications | Fiscora" };

const STATUS_VARIANT = { SENT: "default", QUEUED: "secondary", FAILED: "destructive" };

export default async function NotificationsPage() {
  const [notifications, user] = await Promise.all([getNotifications(), getDbUser()]);
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="px-5 max-w-3xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-5xl gradient-title">Notifications</h1>
        {unread > 0 && (
          <form action={markAllNotificationsRead}>
            <Button variant="outline" size="sm">Mark {unread} as read</Button>
          </form>
        )}
      </div>

      <EmailSettings email={user.email} weeklySummary={user.weeklySummary} />

      {notifications.length === 0 && (
        <p className="text-muted-foreground">
          Nothing yet. Budget alerts, unusual expenses, loan updates, rewards and weekly summaries will show up here.
        </p>
      )}

      {notifications.map((n) => (
        <Card key={n.id} className={n.isRead ? "" : "border-blue-400"}>
          <CardContent className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{n.title}</p>
              <Badge variant={STATUS_VARIANT[n.status]}>{n.status.toLowerCase()}</Badge>
            </div>
            <p className="text-sm">{n.message}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(n.createdAt).toLocaleString("en-US")}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
