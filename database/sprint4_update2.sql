-- Fiscora Sprint 4 database update 2
-- Run this once in Supabase (SQL Editor -> New query -> paste -> Run)
-- BEFORE deploying the code that uses it. Safe to run twice.

-- UC-1: admins can deactivate and reactivate an account
ALTER TABLE "public"."users"
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- REQ-10: each user can switch the weekly summary email off
ALTER TABLE "public"."users"
  ADD COLUMN IF NOT EXISTS "weeklySummary" BOOLEAN NOT NULL DEFAULT true;
