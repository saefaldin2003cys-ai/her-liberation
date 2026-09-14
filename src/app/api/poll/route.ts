import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEY = { _id: "minimum_marriage_age" };
const VOTED_COOKIE = "hl_voted";

/**
 * The old poll stored every voter's raw IP address in the database, forever.
 * On a site about vulnerable people, a plaintext log of who expressed an
 * opinion on child marriage is a liability, not a feature. We store a salted
 * hash instead — enough to spot a repeat vote, useless to anyone who reads
 * the collection.
 */
function fingerprint(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const salt = process.env.AUTH_SECRET ?? "dev-salt";
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex").slice(0, 32);
}

// Singleton document addressed by a string _id rather than an ObjectId.
type PollDoc = {
  _id: string;
  agree18?: number;
  disagree?: number;
  voters?: string[];
};

function shape(doc: PollDoc | null, alreadyVoted = false) {
  const agree18 = doc?.agree18 ?? 0;
  const disagree = doc?.disagree ?? 0;
  return { agree18, disagree, total: agree18 + disagree, alreadyVoted };
}

export async function GET() {
  try {
    const db = await getDb();
    const doc = await db.collection<PollDoc>("poll").findOne(KEY);
    const voted = (await cookies()).get(VOTED_COOKIE)?.value === "1";
    return Response.json(shape(doc, voted));
  } catch (err) {
    console.error("GET /api/poll", err);
    return Response.json(shape(null));
  }
}

export async function POST(req: NextRequest) {
  let choice = "";
  try {
    ({ choice } = await req.json());
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (choice !== "agree18" && choice !== "disagree") {
    return Response.json({ error: "Invalid choice" }, { status: 400 });
  }

  const jar = await cookies();
  const db = await getDb();
  const col = db.collection<PollDoc>("poll");

  if (jar.get(VOTED_COOKIE)?.value === "1") {
    return Response.json(shape(await col.findOne(KEY), true));
  }

  const fp = fingerprint(req);
  const existing = await col.findOne(KEY);
  if (existing?.voters?.includes(fp)) {
    return Response.json(shape(existing, true));
  }

  try {
    const res = await col.findOneAndUpdate(
      KEY,
      { $inc: { [choice]: 1 }, $addToSet: { voters: fp } },
      { upsert: true, returnDocument: "after" },
    );
    jar.set(VOTED_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return Response.json(shape(res));
  } catch (err) {
    console.error("POST /api/poll", err);
    return Response.json({ error: "Could not record vote" }, { status: 500 });
  }
}
