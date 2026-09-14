/**
 * Converts the `mongodb+srv://` string into the plain `mongodb://` form.
 *
 *   npm run db:direct
 *
 * Why you might want this: an SRV connection string cannot connect until a
 * `_mongodb._tcp.<cluster>` SRV lookup succeeds. On a network whose resolver
 * answers unreliably — ISP-level filtering, a home router that drops queries
 * — that lookup fails intermittently and the app reports a database outage
 * that has nothing to do with the database.
 *
 * The direct string lists the cluster's hosts explicitly, so connecting needs
 * only ordinary A-record lookups and never touches SRV.
 *
 * The trade-off: if Atlas ever changes the cluster's hosts (a tier change, a
 * region move) the list goes stale and you re-run this. Day to day that does
 * not happen. Use SRV on hosted environments, this locally if SRV is flaky.
 */
import { Resolver } from "node:dns";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const uri = env.MONGODB_URI;
if (!uri?.startsWith("mongodb+srv://")) {
  console.log(
    uri
      ? "MONGODB_URI is already a direct mongodb:// string — nothing to do."
      : "MONGODB_URI is missing from .env.local",
  );
  process.exit(0);
}

const rest = uri.slice("mongodb+srv://".length);
const at = rest.lastIndexOf("@");
const credentials = at === -1 ? "" : rest.slice(0, at + 1);
const afterHost = rest.slice(at + 1);
const host = afterHost.split(/[/?]/)[0];
const pathAndQuery = afterHost.slice(host.length);
const [pathPart = "", queryPart = ""] = pathAndQuery.split("?");

// Resolve through public DNS: the whole point is that the local one is
// unreliable, so do not depend on it to produce the workaround.
const resolver = new Resolver({ timeout: 5000, tries: 3 });
resolver.setServers(["1.1.1.1", "8.8.8.8", "9.9.9.9"]);

const srv = await new Promise((resolve, reject) =>
  resolver.resolveSrv(`_mongodb._tcp.${host}`, (e, a) =>
    e ? reject(e) : resolve(a),
  ),
).catch((e) => {
  console.error(`Could not resolve _mongodb._tcp.${host}: ${e.message}`);
  process.exit(1);
});

const txt = await new Promise((resolve) =>
  resolver.resolveTxt(host, (e, r) => resolve(e ? [] : r.flat())),
);

const hosts = srv
  .map((r) => `${r.name}:${r.port}`)
  .sort()
  .join(",");

// Atlas publishes replicaSet and authSource in the cluster's TXT record;
// both are implicit with +srv and must be stated explicitly without it.
const fromTxt = Object.fromEntries(
  txt
    .join("&")
    .split("&")
    .filter(Boolean)
    .map((kv) => kv.split("=")),
);

const params = new URLSearchParams(queryPart);
params.set("ssl", "true");
for (const [k, v] of Object.entries(fromTxt)) {
  if (!params.has(k)) params.set(k, v);
}

const direct = `mongodb://${credentials}${hosts}${pathPart}?${params.toString()}`;

console.log("Resolved hosts:");
srv.forEach((r) => console.log(`  ${r.name}:${r.port}`));
if (txt.length) console.log("TXT options   :", txt.join(" "));
console.log("\nPaste this into .env.local as MONGODB_URI:\n");
console.log(direct.replace(/\/\/([^:]+):([^@]+)@/, "//$1:$2@"));
console.log(
  "\n(Keep the +srv string somewhere — it is the better choice on Vercel,\n" +
    " whose DNS is reliable, and it survives cluster host changes.)",
);
