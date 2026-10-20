-- Optional demo rows for testing the Sprint 3 tables without the web app.
-- Run after fiscora_schema.sql. Uses a fake user; real users are created
-- automatically by the app when they sign in through Clerk.

INSERT INTO "public"."users" ("id", "clerkUserId", "email", "name", "updatedAt")
VALUES ('demo-user-1', 'clerk_demo_1', 'demo@fiscora.test', 'Demo Student', CURRENT_TIMESTAMP);

INSERT INTO "public"."categories" ("id", "name", "type", "color", "userId", "updatedAt")
VALUES ('cat-1', 'Textbooks', 'EXPENSE', '#0ea5e9', 'demo-user-1', CURRENT_TIMESTAMP),
       ('cat-2', 'Tutoring', 'INCOME', '#22c55e', 'demo-user-1', CURRENT_TIMESTAMP);

-- $10,000 at 5% over 60 months -> $188.71 a month, $1,322.74 interest
INSERT INTO "public"."loans" ("id", "name", "lender", "loanType", "principal", "interestRate",
  "termMonths", "startDate", "monthlyPayment", "totalInterest", "payoffDate", "userId", "updatedAt")
VALUES ('loan-1', 'Car loan', 'Delta Community CU', 'AUTO', 10000, 5, 60, '2026-01-15',
        188.71, 1322.74, '2031-01-15', 'demo-user-1', CURRENT_TIMESTAMP);

INSERT INTO "public"."ai_messages" ("id", "role", "content", "userId")
VALUES ('msg-1', 'USER', 'Where can I cut spending this month?', 'demo-user-1');

INSERT INTO "public"."notifications" ("id", "type", "title", "message", "userId")
VALUES ('n-1', 'LOAN_ADDED', 'Loan added', 'Car loan from Delta Community CU: $188.71 a month.', 'demo-user-1');
