/**
 * Verifies the MongoDB connection before you run the app.
 *
 *   npm run db:check
 *
 * Reports precisely which step failed — DNS, authentication, network access
 * or the database itself — because "connection failed" on its own tells you
 * nothing about which of the four to go and fix.
 */
import { MongoClient } from "mongodb";
import { readFileSync } from "node:fs";
import { Resolver } from "node:dns";

// Read .env.local without a dependency.
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
} catch {
  console.error("✗  .env.local not found. Copy .env.example to .env.local first.");
  process.exit(1);
}

const uri = env.MONGODB_URI;
const dbName = env.MONGODB_DB || "herliberation";

if (!uri) {
  console.error("✗  MONGODB_URI is empty in .env.local");
  process.exit(1);
}

const masked = uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:••••••@");
console.log("connection string :", masked);
console.log("database          :", dbName);

// ---- 1. DNS ----
// mongodb+srv:// needs an SRV lookup, which some networks block outright.
// This machine's resolver has done exactly that before, so check it first
// and say so plainly rather than letting it surface as a vague timeout.
if (uri.startsWith("mongodb+srv://")) {
  const host = uri.split("@")[1]?.split("/")[0]?.split("?")[0];
  const srv = `_mongodb._tcp.${host}`;
  const ok = await new Promise((resolve) => {
    const r = new Resolver();
    r.setServers(["8.8.8.8", "1.1.1.1"]);
    r.resolveSrv(srv, (err, addrs) =>
      resolve(err ? null : addrs?.length ?? 0),
    );
  });
  if (ok) {
    console.log(`✓  DNS: SRV record found (${ok} host${ok === 1 ? "" : "s"})`);
  } else {
    console.log("✗  DNS: could not resolve", srv);
    console.log(
      "   Your network is blocking SRV lookups. In Atlas, click Connect →\n" +
        "   Drivers, then switch the driver version to 'Node.js 2.2.12 or later'\n" +
        "   to get a plain mongodb:// string that does not need SRV.",
    );
  }
}

// ---- 2. Connect, authenticate, read ----
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
try {
  await client.connect();
  console.log("✓  Connected");

  const db = client.db(dbName);
  await db.command({ ping: 1 });
  console.log("✓  Authenticated and reachable");

  const cols = await db.listCollections().toArray();
  console.log(
    "✓  Database '" + dbName + "':",
    cols.length ? cols.map((c) => c.name).join(", ") : "(empty — that is fine)",
  );

  const n = cols.some((c) => c.name === "articles")
    ? await db.collection("articles").countDocuments()
    : 0;
  console.log("   articles:", n);
  console.log("\nAll good. Run: npm run dev");
} catch (err) {
  const m = String(err?.message ?? err);
  console.log("✗  Failed:", m);
  if (/tlsv1 alert|SSL routines|ssl3_read_bytes/i.test(m)) {
    console.log(
      "   Atlas refused the TLS handshake. That is almost always an IP that is\n" +
        "   not on the allowlist: Atlas > Network Access > Add IP Address.\n" +
        "   Add your current address for local work, and 0.0.0.0/0 for Vercel,\n" +
        "   whose outbound addresses are not fixed.",
    );
  } else if (/authentication failed|bad auth/i.test(m)) {
    console.log(
      "   The username or password is wrong. Atlas → Database Access →\n" +
        "   Edit the user → set a new password, then update MONGODB_URI.\n" +
        "   If the password contains @ : / ? # or %, it must be URL-encoded.",
    );
  } else if (/ENOTFOUND|querySrv|EAI_AGAIN/i.test(m)) {
    console.log("   A DNS problem — see the DNS note above.");
  } else if (/timed out|ServerSelection/i.test(m)) {
    console.log(
      "   Nothing answered. Atlas → Network Access → Add IP Address.\n" +
        "   Add your current IP for local work, and 0.0.0.0/0 for Vercel,\n" +
        "   whose outbound addresses are not fixed.",
    );
  }
  process.exitCode = 1;
} finally {
  await client.close().catch(() => {});
}
