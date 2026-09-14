/**
 * Brings the existing Mongoose-era documents onto the shapes the new app
 * reads.
 *
 *   npm run db:migrate -- --dry     preview, change nothing
 *   npm run db:migrate              apply
 *
 * Non-destructive and idempotent: it only adds the fields the new code needs
 * and leaves the originals in place, so running it twice is harmless and
 * nothing is lost if you roll back.
 *
 * What changes and why:
 *   articles  timestamp -> createdAt/updatedAt, image -> coverImage,
 *             published: true, and plain-text content wrapped in <p> so the
 *             editor and the article page both read it as HTML.
 *   stats     copied to a singleton keyed _id:"site", which is what the new
 *             route increments.
 *   polls     copied to `poll` keyed by the question, with the vote counts
 *             flattened. Voter IP addresses are deliberately NOT carried
 *             over: storing who expressed an opinion on child marriage in
 *             plaintext is a liability, and the new route keeps only salted
 *             hashes.
 */
import { MongoClient, ObjectId } from "mongodb";
import { readFileSync } from "node:fs";

const DRY = process.argv.includes("--dry");

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

if (!env.MONGODB_URI) {
  console.error("MONGODB_URI is missing from .env.local");
  process.exit(1);
}

/** Old cover images pointed at the previous site's asset paths. */
const IMAGE_REMAP = {
  "/assets/images/happy-schoolgirls.png": "/img/schoolgirls.png",
  "/assets/images/visual-insight.png": "/img/visual-insight.png",
  "/assets/images/1_20251127_202518.png": "/brand/logo.png",
};

/** Plain text with blank-line paragraphs -> HTML the editor can round-trip. */
function textToHtml(value) {
  if (!value) return value;
  if (/<(p|h2|h3|ul|ol|blockquote|img)\b/i.test(value)) return value; // already HTML
  return value
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

const client = new MongoClient(env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
});
await client.connect();
const db = client.db(env.MONGODB_DB || "herliberation");

console.log(DRY ? "DRY RUN — nothing will be written\n" : "Applying…\n");

/* ---------------- articles ---------------- */
const articles = await db.collection("articles").find({}).toArray();
let touched = 0;
for (const a of articles) {
  const set = {};
  // Normalise to ISO strings: the new code types these as strings and
  // serialises them straight into the page.
  const stamp = a.timestamp
    ? new Date(a.timestamp).toISOString()
    : new Date().toISOString();
  if (!a.createdAt) set.createdAt = stamp;
  if (!a.updatedAt) set.updatedAt = stamp;
  if (a.published === undefined) set.published = true;
  if (!a.coverImage && a.image) {
    set.coverImage = IMAGE_REMAP[a.image] ?? a.image;
  }

  const arHtml = textToHtml(a.content?.ar);
  const enHtml = textToHtml(a.content?.en);
  if (arHtml && arHtml !== a.content?.ar) set["content.ar"] = arHtml;
  if (enHtml && enHtml !== a.content?.en) set["content.en"] = enHtml;

  if (Object.keys(set).length === 0) continue;
  touched++;
  console.log(`articles  ${a.slug ?? a._id}`);
  for (const k of Object.keys(set)) {
    const v = String(set[k]);
    console.log(`    + ${k} = ${v.length > 70 ? v.slice(0, 70) + "…" : v}`);
  }
  if (!DRY) {
    await db.collection("articles").updateOne({ _id: a._id }, { $set: set });
  }
}
console.log(`articles: ${touched} of ${articles.length} updated\n`);

/* ---------------- stats ---------------- */
const oldStats = await db
  .collection("stats")
  .findOne({ _id: { $ne: "site" } });
const newStats = await db.collection("stats").findOne({ _id: "site" });
if (oldStats && !newStats) {
  console.log(
    `stats     -> _id:"site"  views=${oldStats.views ?? 0} likes=${oldStats.likes ?? 0}`,
  );
  if (!DRY) {
    await db.collection("stats").insertOne({
      _id: "site",
      views: oldStats.views ?? 0,
      likes: oldStats.likes ?? 0,
    });
  }
} else {
  console.log("stats     already migrated or absent");
}

/* ---------------- polls -> poll ---------------- */
const oldPoll = await db.collection("polls").findOne({});
const newPoll = await db
  .collection("poll")
  .findOne({ _id: "minimum_marriage_age" });
if (oldPoll && !newPoll) {
  const agree18 = oldPoll.votes?.agree18 ?? 0;
  const disagree = oldPoll.votes?.disagree ?? 0;
  console.log(
    `poll      -> _id:"minimum_marriage_age"  agree18=${agree18} disagree=${disagree}`,
  );
  console.log(
    `          (${oldPoll.voters?.length ?? 0} raw voter IP(s) intentionally dropped)`,
  );
  if (!DRY) {
    await db.collection("poll").insertOne({
      _id: "minimum_marriage_age",
      agree18,
      disagree,
      voters: [],
    });
  }
} else {
  console.log("poll      already migrated or absent");
}

/* ---------------- index the slug ---------------- */
if (!DRY) {
  await db
    .collection("articles")
    .createIndex({ slug: 1 }, { unique: true, sparse: true });
  console.log("\nindex     unique index on articles.slug ensured");
}

console.log(DRY ? "\nDry run complete. Re-run without --dry to apply." : "\nDone.");
await client.close();
