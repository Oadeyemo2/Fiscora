# Fiscora

Fiscora is a free personal finance web app for students and young professionals. It keeps income, expenses, budgets, bank accounts and loans in one place, and adds two AI tools on top: a receipt scanner that fills in an expense from a photo, and an advisor that answers questions using your own spending.

**Live app:** https://getfiscora.vercel.app

Built by Group 2 for Software Engineering (CRN 88643), Fall 2026: Eziz Bagshiyev, Olorunfemi Adeyemo, Aminur Ramim and Bradley Tsambou.

## Features

| Feature | Page | What it does |
|---|---|---|
| Sign up and log in | `/sign-up`, `/sign-in` | Clerk accounts with a 6-digit email verification code; client and admin roles |
| Dashboard | `/dashboard` | Income, spending and every account balance, with a monthly expense chart |
| Income and expenses | `/transaction/create` | Amount, category, date, description and an optional recurring schedule; a scanned receipt photo is kept with the expense |
| AI receipt scanner | `/transaction/create` | Upload a receipt photo and Gemini fills in the amount, date, store and category |
| Monthly budget | `/dashboard` | Set a limit, watch the progress bar, get an email alert at 80% |
| Bank accounts | `/dashboard`, `/account/[id]` | Checking and savings, each with its own balance and history |
| Loan planner | `/loans` | Monthly payment, total interest, payoff date and a full repayment schedule |
| AI advisor | `/advisor` | Chat that answers from a summary of your last 90 days; the conversation is saved |
| Custom categories | `/categories` | Your own income and expense categories next to the built-in ones |
| Notifications | `/notifications` | Budget alerts, unusual-expense alerts, weekly summaries, loan updates and new rewards, with delivery status; weekly summaries can be switched off |
| Transaction history | `/account/[id]` | Every transaction for an account, searchable and filterable |
| Financial notes | `/transaction/create` | Suggests descriptions you've used before in the chosen category |
| Rewards | `/rewards` | Badges, points and levels for logging regularly, staying on budget and paying off loans |
| Light and dark mode | moon button in the header | Switches the whole app between light and dark, remembered per browser |
| Admin | `/admin` | Admins see every user with their accounts, transactions, loans and rewards, change roles, deactivate or reactivate accounts and delete users |

Bank accounts can be checking, savings or credit card.

## Tech stack

- **Front end:** Next.js 15 (App Router, server actions), React 19, Tailwind CSS v4, shadcn/ui
- **Authentication:** Clerk
- **Database:** PostgreSQL on Supabase, accessed through Prisma ORM
- **AI:** Google Gemini API (receipt scanning and financial advice)
- **Email and background jobs:** Resend and Inngest
- **Hosting:** Vercel

## Roles

Everyone who signs up is a client and only ever sees their own data. An admin also gets an **Admin** page listing every user, with a detail page per user. To make the first admin, put that person's email in `ADMIN_EMAILS`; they become an admin the next time they sign in, and from then on they can promote or demote others on the Admin page. Clients who open an admin page get a 403 access denied page. An admin can also deactivate an account: its login is refused (the user is locked in Clerk) and any session still open shows a "deactivated" page, until an admin reactivates it. Nothing is deleted. Every session also ends after 30 minutes without activity.

Deleting a user on the Admin page removes their Clerk login and their `users` row, and the cascade removes all their accounts, transactions, loans and other rows. The same email can then sign up again as a brand-new user.

## How the front end talks to the database

Pages call Next.js server actions in `actions/`, which run on the server. Each action asks Clerk who is signed in, looks up that user in the `users` table (`lib/get-db-user.js`), validates the input and reads or writes through Prisma (`lib/prisma.js`). Every query is filtered by the user's id, so people only ever see their own data, and the browser never sees the database credentials.

For example, saving a loan calls `createLoan()` in `actions/loan.js`. It re-runs the loan maths from `lib/loan-calculator.js` on the server, inserts a row into `loans`, adds a "Loan added" row to `notifications`, and refreshes the page so the new card shows straight away.

## Database

Nine tables: `users`, `accounts`, `transactions`, `budgets`, `loans`, `categories`, `ai_messages`, `notifications` and `rewards`. Every table links back to `users` with a foreign key and cascade delete. `users.role` is `CLIENT` or `ADMIN`.

- `prisma/schema.prisma` is the data model.
- `prisma/migrations/` holds the migrations; `npx prisma migrate deploy` applies them.
- `database/fiscora_schema.sql` creates all eight tables on an empty PostgreSQL database in one go.
- `database/demo_data.sql` adds sample rows for testing.
- `database/sprint4_update.sql` upgrades a database created before Sprint 4 (adds the role column, the rewards table and the credit card account type). Run it once in the Supabase SQL Editor.

## Running it locally

You need Node.js 20 or newer, Git, and free accounts with Clerk, Supabase and Google AI Studio (Gemini).

1. Clone the repository and install the packages:

   ```bash
   git clone https://github.com/Oadeyemo2/Fiscora.git
   cd Fiscora
   npm install
   ```

2. Copy the example environment file and fill in your own keys:

   ```bash
   cp .env.example .env
   ```

   ```env
   # Clerk (dashboard.clerk.com -> API keys)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

   # Supabase (Project -> Connect)
   DATABASE_URL=   # transaction pooler, port 6543, ending in ?pgbouncer=true
   DIRECT_URL=     # direct or session connection, port 5432

   # Gemini (aistudio.google.com -> Get API key)
   GEMINI_API_KEY=

   # Admins: comma-separated emails that get the admin role when they sign in
   ADMIN_EMAILS=

   # Email (resend.com -> API Keys). Without a verified domain Resend only
   # delivers to the email address you signed up with.
   RESEND_API_KEY=

   # Scheduled jobs (added for you by the Inngest integration on Vercel)
   INNGEST_EVENT_KEY=
   INNGEST_SIGNING_KEY=

   # Receipt photos (added for you when a Vercel Blob store is connected)
   BLOB_READ_WRITE_TOKEN=

   # Optional: Gemini model, default gemini-3.5-flash-lite
   GEMINI_MODEL=
   ```

3. Create the tables (first time only):

   ```bash
   npx prisma migrate deploy
   ```

   Or run `psql "$DIRECT_URL" -f database/fiscora_schema.sql`, then `database/demo_data.sql` if you want sample data.

4. Start the app and open http://localhost:3000:

   ```bash
   npm run dev
   ```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm test` | Check the loan calculator against known repayment figures |
| `npm run lint` | Lint the code |
| `npm run db:push` | Apply the Prisma migrations |

## Deploying

The live app runs on Vercel, connected to this repository, so every push to `main` deploys automatically. Add the same environment variables in Vercel under Project Settings > Environment Variables.

## Project structure

```
actions/       server actions (loans, advisor, categories, notifications, transactions...)
app/           pages and layouts (App Router)
components/    shared UI, including shadcn/ui components
data/          landing page content and default categories
database/      plain SQL schema and demo data
emails/        email templates
lib/           Prisma client, loan calculator, rewards rules, Inngest jobs, helpers
prisma/        schema and migrations
tests/         loan calculator tests
```
