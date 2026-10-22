-- Sprint 4: admin role, rewards, credit card accounts, reward notifications

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('CLIENT', 'ADMIN');

-- AlterEnum
ALTER TYPE "public"."AccountType" ADD VALUE 'CREDIT_CARD';

-- AlterEnum
ALTER TYPE "public"."NotificationType" ADD VALUE 'REWARD_EARNED';

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN "role" "public"."Role" NOT NULL DEFAULT 'CLIENT';

-- CreateTable
CREATE TABLE "public"."rewards" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rewards_userId_idx" ON "public"."rewards"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "rewards_userId_code_key" ON "public"."rewards"("userId", "code");

-- AddForeignKey
ALTER TABLE "public"."rewards" ADD CONSTRAINT "rewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
