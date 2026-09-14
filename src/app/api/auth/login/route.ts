import { NextRequest } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Naive in-memory throttle. Enough to blunt guessing on a single instance. */
const attempts = new Map<string, { n: number; at: number }>();
const WINDOW = 15 * 60 * 1000;
const MAX = 8;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && now - rec.at < WINDOW && rec.n >= MAX) {
    return Response.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 },
    );
  }

  let password = "";
  try {
    ({ password } = await req.json());
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (typeof password !== "string" || !password) {
    return Response.json({ error: "Password required" }, { status: 400 });
  }

  if (!(await verifyPassword(password))) {
    attempts.set(ip, {
      n: rec && now - rec.at < WINDOW ? rec.n + 1 : 1,
      at: now,
    });
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  attempts.delete(ip);
  await createSession();
  return Response.json({ ok: true });
}
