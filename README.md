# Fiscora

Fiscora is a free personal finance web app for students and young professionals. It keeps income, expenses, budgets, bank accounts and loans in one place, and adds two AI tools on top: a receipt scanner that fills in an expense from a photo, and an advisor that answers questions using your own spending.

**Live app:** https://getfiscora.vercel.app

Built by Group 2 for Software Engineering (CRN 88643), Fall 2026: Eziz Bagshiyev, Olorunfemi Adeyemo, Aminur Ramim and Bradley Tsambou.

## Features

| Feature | Page | What it does |
|---|---|---|
| Sign up and log in | `/sign-up`, `/sign-in` | Clerk accounts with a 6-digit email verification code |
| Dashboard | `/dashboard` | Income, spending and every account balance, with a monthly expense chart |
| Income and expenses | `/transaction/create` | Amount, category, date, description and an optional recurring schedule |
| AI receipt scanner | `/transaction/create` | Upload a receipt photo and Gemini fills in the amount, date, store and category |
| Monthly budget | `/dashboard` | Set a limit, watch the progress bar, get an email alert at 80% |
| Bank accounts | `/dashboard`, `/account/[id]` | Checking and savings, each with its own balance and history |
| Loan planner | `/loans` | Monthly payment, total interest, payoff date and a full repayment schedule |
| AI advisor | `/advisor` | Chat that answers from a summary of your last 90 days; the conversation is saved |
| Custom categories | `/categories` | Your own income and expense categories next to the built-in ones |
| Notifications | `/notifications` | Budget alerts and loan updates, with delivery status |

Planned for Sprint 4: rewards, a light and dark theme toggle, an admin page for managing users, and Arcjet rate limiting.

## Tech stack

- **Front end:** Next.js 15 (App Router, server actions), React 19, Tailwind CSS v4, shadcn/ui
- **Authentication:** Clerk
- **Database:** PostgreSQL on Supabase, accessed through Prisma ORM
- **AI:** Google Gemini API (receipt scanning and financial advice)
- **Email and background jobs:** Resend and Inngest
- **Rate limiting:** Arcjet (optional; the app runs without a key)
- **Hosting:** Vercel

## How the front end talks to the database

Pages call Next.js server actions in `actions/`, which run on the server. Each action asks Clerk who is signed in, looks up that user in the `users` table (`lib/get-db-user.js`), validates the input and reads or writes through Prisma (`lib/prisma.js`). Every query is filtered by the user's id, so people only ever see their own data, and the browser never sees the database credentials.

For example, saving a loan calls `createLoan()` in `actions/loan.js`. It re-runs the loan maths from `lib/loan-calculator.js` on the server, inserts a row into `loans`, adds a "Loan added" row to `notifications`, and refreshes the page so the new card shows straight away.

## Database

Eight tables: `users`, `accounts`, `transactions`, `budgets`, `loans`, `categories`, `ai_messages` and `notifications`. Every table links back to `users` with a foreign key and cascade delete.

- `prisma/schema.prisma` is the data model.
- `prisma/migrations/` holds the migrations; `npx prisma migrate deploy` applies them.
- `database/fiscora_schema.sql` creates all eight tables on an empty PostgreSQL database in one go.
- `database/demo_data.sql` adds sample rows for testing.

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

   # Optional
   ARCJET_KEY=
   RESEND_API_KEY=
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
lib/           Prisma client, loan calculator, Arcjet, Inngest jobs, helpers
prisma/        schema and migrations
tests/         loan calculator tests
```
