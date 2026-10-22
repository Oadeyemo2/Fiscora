"use server";

// Feature 14 Gamification / Rewards
import { getDbUser } from "@/lib/get-db-user";
import { evaluateRewards } from "@/lib/rewards";

export async function getMyRewards() {
  const user = await getDbUser();
  const result = await evaluateRewards(user.id);
  return JSON.parse(JSON.stringify(result));
}
