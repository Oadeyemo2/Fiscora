-- UC-1: admins can deactivate an account; REQ-10: weekly summary on/off
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "weeklySummary" BOOLEAN NOT NULL DEFAULT true;
