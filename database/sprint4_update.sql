-- Fiscora Sprint 4 database update
-- Run this once in Supabase (SQL Editor -> New query -> paste -> Run)
-- BEFORE deploying the Sprint 4 code. Safe to run twice.

-- 1. Admin role on users
DO $$ BEGIN
  CREATE TYPE "public"."Role" AS ENUM ('CLIENT', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "public"."users"
  ADD COLUMN IF NOT EXISTS "role" "public"."Role" NOT NULL DEFAULT 'CLIENT';

-- 2. Credit card accounts and reward notifications
ALTER TYPE "public"."AccountType" ADD VALUE IF NOT EXISTS 'CREDIT_CARD';
ALTER TYPE "public"."NotificationType" ADD VALUE IF NOT EXISTS 'REWARD_EARNED';

-- 3. Rewards table (feature 14)
CREATE TABLE IF NOT EXISTS "public"."rewards" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "rewards_userId_fkey" FOREIGN KEY ("userId")
      REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "rewards_userId_idx" ON "public"."rewards"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "rewards_userId_code_key" ON "public"."rewards"("userId", "code");
ALTER TABLE "public"."rewards" ENABLE ROW LEVEL SECURITY;
