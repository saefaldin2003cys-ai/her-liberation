import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Singleton document addressed by a string _id rather than an ObjectId.
type StatsDoc = { _id: string; views?: number; likes?: number };

const KEY = { _id: "site" };

export async function GET() {
  try {
    const db = await getDb();
    const doc = await db.collection<StatsDoc>("stats").findOne(KEY);
    return Response.json({ views: doc?.views ?? 0, likes: doc?.likes ?? 0 });
  } catch (err) {
    console.error("GET /api/stats", err);
    return Response.json({ views: 0, likes: 0 });
  }
}

/** Increments a counter. `{"metric":"views"}` or `{"metric":"likes"}`. */
export async function POST(req: Request) {
  let metric = "";
  try {
    ({ metric } = await req.json());
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (metric !== "views" && metric !== "likes") {
    return Response.json({ error: "Unknown metric" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const res = await db
      .collection<StatsDoc>("stats")
      .findOneAndUpdate(
        KEY,
        { $inc: { [metric]: 1 } },
        { upsert: true, returnDocument: "after" },
      );
    return Response.json({ views: res?.views ?? 0, likes: res?.likes ?? 0 });
  } catch (err) {
    console.error("POST /api/stats", err);
    return Response.json({ error: "Could not record" }, { status: 500 });
  }
}
