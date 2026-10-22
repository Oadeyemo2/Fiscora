import { Trophy, Lock, CheckCircle2 } from "lucide-react";
import { getMyRewards } from "@/actions/rewards";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const metadata = { title: "Rewards | Fiscora" };

export default async function RewardsPage() {
  const { badges, points, level, pointsIntoLevel } = await getMyRewards();
  const earned = badges.filter((b) => b.earnedAt);
  const locked = badges.filter((b) => !b.earnedAt);

  return (
    <div className="px-5 space-y-8">
      <div>
        <h1 className="text-5xl gradient-title">Rewards</h1>
        <p className="text-muted-foreground mt-2">
          Earn badges and points for good money habits. New badges also show up in your notifications.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Level</p>
              <p className="text-4xl font-bold">{level}</p>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-sm">
              <span><b>{points}</b> points · {earned.length} of {badges.length} badges</span>
              <span className="text-muted-foreground">{100 - pointsIntoLevel} points to level {level + 1}</span>
            </div>
            <Progress value={pointsIntoLevel} />
          </div>
        </CardContent>
      </Card>

      {earned.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Earned</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {earned.map((b) => (
              <Card key={b.code} className="border-emerald-300 dark:border-emerald-800">
                <CardContent className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {b.title}
                    </p>
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">+{b.points}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{b.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Earned {new Date(b.earnedAt).toLocaleDateString("en-US")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Still to earn</h2>
        {locked.length === 0 && <p className="text-muted-foreground">You&apos;ve earned every badge.</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locked.map((b) => (
            <Card key={b.code}>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" /> {b.title}
                  </p>
                  <span className="text-sm text-muted-foreground">+{b.points}</span>
                </div>
                <p className="text-sm text-muted-foreground">{b.description}</p>
                {b.goal > 1 && (
                  <div className="space-y-1">
                    <Progress value={(b.progress / b.goal) * 100} />
                    <p className="text-xs text-muted-foreground">{b.progress} of {b.goal}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
