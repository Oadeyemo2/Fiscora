// Keeps the Supabase database from being paused for inactivity.
// Vercel Cron calls this once a day (see vercel.json). It runs one
// read-only query and returns no user data.
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ ok: true, at: new Date().toISOString() });
  } catch (error) {
    console.error("Keep-alive query failed:", error.message);
    return Response.json({ ok: false }, { status: 500 });
  }
}
