/**
 * End-to-end smoke test.
 *
 *   npm run verify          against the dev server (start it first)
 *   npm run verify -- 3001  against another port
 *
 * Checks, in order: environment, database, then every page and API route on a
 * running server — asserting each one actually contains what it should, not
 * merely that it returned 200. A page that renders an error message still
 * returns 200, so status codes alone prove nothing.
 */
import { readFileSync } from "node:fs";

const PORT = process.argv[2] || "3000";
const BASE = `http://localhost:${PORT}`;

let pass = 0;
let fail = 0;
const failures = [];

function ok(label, detail = "") {
  pass++;
  console.log(`  ✓ ${label}${detail ? "  " + detail : ""}`);
}
function bad(label, detail = "") {
  fail++;
  failures.push(label + (detail ? " — " + detail : ""));
  console.log(`  ✗ ${label}${detail ? "  " + detail : ""}`);
}

function heading(t) {
  console.log(`\n${t}`);
}

/* ---------- 1. environment ---------- */
heading("Environment");
let env = {};
try {
  env = Object.fromEntries(
    readFileSync(new URL("../.env.local", import.meta.url), "utf8")
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith("#") && l.includes("="))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      }),
  );
  ok(".env.local found");
} catch {
  bad(".env.local missing", "copy .env.example to .env.local");
}

for (const key of ["MONGODB_URI", "AUTH_SECRET", "ADMIN_PASSWORD_HASH"]) {
  if (env[key]) ok(key + " set");
  else bad(key + " missing");
}
if (env.AUTH_SECRET && env.AUTH_SECRET.length < 32) {
  bad("AUTH_SECRET too short", `${env.AUTH_SECRET.length} chars, needs 32+`);
}
for (const key of ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]) {
  if (!env[key]) console.log(`  · ${key} not set — image upload will be disabled`);
}

/* ---------- 2. database ---------- */
heading("Database");
if (env.MONGODB_URI) {
  try {
    const { MongoClient } = await import("mongodb");
    const c = new MongoClient(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    await c.connect();
    const db = c.db(env.MONGODB_DB || "herliberation");
    await db.command({ ping: 1 });
    ok("connected");

    const articles = await db.collection("articles").countDocuments({ published: { $ne: false } });
    ok("published articles", String(articles));

    const stats = await db.collection("stats").findOne({ _id: "site" });
    if (stats) ok("stats singleton", `views=${stats.views} likes=${stats.likes}`);
    else bad("stats singleton missing", "run: npm run db:migrate");

    const poll = await db.collection("poll").findOne({ _id: "minimum_marriage_age" });
    if (poll) ok("poll document", `agree=${poll.agree18} disagree=${poll.disagree}`);
    else bad("poll document missing", "run: npm run db:migrate");

    const stale = await db
      .collection("articles")
      .countDocuments({ coverImage: /schoolgirls|visual-insight/ });
    if (stale === 0) ok("no articles point at deleted images");
    else bad("articles point at deleted images", String(stale));

    await c.close();
  } catch (e) {
    const m = String(e.message);
    if (/tlsv1 alert|SSL routines|ssl3_read_bytes/i.test(m)) {
      let ip = "unknown";
      try {
        ip = (await (await fetch("https://api.ipify.org?format=json")).json()).ip;
      } catch {}
      bad(
        "connection refused by Atlas",
        `add ${ip} at Atlas > Network Access (or 0.0.0.0/0 for Vercel)`,
      );
    } else {
      bad("connection failed", m.slice(0, 90));
    }
  }
} else {
  bad("skipped", "no MONGODB_URI");
}

/* ---------- 3. the running site ---------- */
heading(`Pages  (${BASE})`);

async function fetchText(path, { expectStatus = 200 } = {}) {
  const res = await fetch(BASE + path, { redirect: "manual" });
  const body = res.status < 300 ? await res.text() : "";
  return { status: res.status, body, location: res.headers.get("location") };
}

let serverUp = true;
try {
  await fetch(BASE + "/ar");
} catch {
  serverUp = false;
  bad("server not reachable", `start it with: npm run dev`);
}

if (serverUp) {
  // Each page must contain a phrase only that page renders.
  const pages = [
    ["/ar", "حكايا المرأة", "home (ar)"],
    ["/en", "women", "home (en)"],
    ["/ar/campaigns", "حملاتنا", "campaigns index"],
    ["/ar/campaigns/before-18", "اختر عمر", "campaign"],
    ["/ar/blog", "مدونتنا", "blog"],
    ["/ar/about", "رسالتنا", "about"],
    ["/ar/contact", "التواصل", "contact"],
    ["/ar/donate", "ادعم", "donate"],
    ["/ar/programs", "برامجنا", "programs"],
    ["/ar/credits", "المصادر", "credits"],
    ["/ar/admin", "لوحة الإدارة", "admin login"],
  ];

  for (const [path, needle, label] of pages) {
    try {
      const r = await fetchText(path);
      if (r.status !== 200) bad(label, `HTTP ${r.status}`);
      else if (!r.body.includes(needle)) bad(label, `rendered, but "${needle}" not found`);
      else ok(label, path);
    } catch (e) {
      bad(label, String(e.message).slice(0, 60));
    }
  }

  // Things that must NOT be on any page.
  heading("Content rules");
  const home = (await fetchText("/ar")).body;
  const emoji = (home.match(/\p{Extended_Pictographic}/gu) || []).filter((e) => e !== "©");
  if (emoji.length === 0) ok("no emoji used as icons");
  else bad("emoji found in markup", [...new Set(emoji)].join(" "));

  if (!/schoolgirls|visual-insight/.test(home)) ok("no AI-generated images referenced");
  else bad("AI image still referenced");

  if (/dir="rtl"/.test(home)) ok("Arabic page sets dir=rtl");
  else bad("dir=rtl missing on the html element");

  const en = (await fetchText("/en")).body;
  if (/dir="ltr"/.test(en)) ok("English page sets dir=ltr");
  else bad("dir=ltr missing on the html element");

  if (!/MISSING_MESSAGE/.test(home + en)) ok("no missing translations");
  else bad("a translation key is missing");

  heading("API");
  const apis = [
    ["/api/stats", (j) => typeof j.views === "number", "stats"],
    ["/api/poll", (j) => typeof j.total === "number", "poll"],
    ["/api/articles", (j) => Array.isArray(j.articles), "articles"],
  ];
  for (const [path, check, label] of apis) {
    try {
      const res = await fetch(BASE + path);
      const j = await res.json();
      if (res.ok && check(j)) ok(label, JSON.stringify(j).slice(0, 60));
      else bad(label, JSON.stringify(j).slice(0, 70));
    } catch (e) {
      bad(label, String(e.message).slice(0, 60));
    }
  }

  // The admin API must refuse an unauthenticated write.
  try {
    const res = await fetch(BASE + "/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    if (res.status === 401) ok("admin API rejects unauthenticated writes");
    else bad("admin API is not protected", `POST returned ${res.status}`);
  } catch (e) {
    bad("admin API check failed", String(e.message).slice(0, 60));
  }

  heading("Routing");
  const root = await fetchText("/");
  if (root.status === 307 && (root.location || "").includes("/ar")) {
    ok("/ redirects to /ar");
  } else {
    bad("/ does not redirect to a locale", `HTTP ${root.status}`);
  }
  const missing = await fetchText("/ar/definitely-not-a-page");
  if (missing.status === 404) ok("unknown page returns 404");
  else bad("unknown page did not 404", `HTTP ${missing.status}`);
}

/* ---------- summary ---------- */
console.log(`\n${"=".repeat(54)}`);
console.log(`  ${pass} passed, ${fail} failed`);
if (fail) {
  console.log("\n  Failures:");
  failures.forEach((f) => console.log("   - " + f));
  process.exitCode = 1;
} else {
  console.log("\n  Everything checks out.");
}
