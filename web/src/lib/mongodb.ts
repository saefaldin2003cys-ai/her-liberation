import { MongoClient, type Db } from "mongodb";
import { setServers, getServers } from "node:dns";

/**
 * A single MongoClient reused across invocations.
 *
 * Serverless functions are frozen and thawed rather than torn down, so a new
 * client per request would open a new connection pool each time and exhaust
 * the Atlas connection limit. Caching the *promise* (not the resolved client)
 * also means concurrent cold requests share one connection attempt.
 *
 * In development the cache hangs off `globalThis` so hot reload does not leak
 * a pool on every file change.
 */
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "herliberation";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _dnsFallbackApplied: boolean | undefined;
}

/** Public resolvers, tried only after the configured one has actually failed. */
const PUBLIC_DNS = ["1.1.1.1", "8.8.8.8", "9.9.9.9"];

function isDnsFailure(err: unknown): boolean {
  const e = err as { code?: string; syscall?: string };
  return (
    e?.code === "ENOTFOUND" ||
    e?.code === "EAI_AGAIN" ||
    e?.syscall === "querySrv" ||
    e?.syscall === "queryTxt"
  );
}

/**
 * `mongodb+srv://` cannot connect until an SRV lookup succeeds, so a resolver
 * that answers unreliably surfaces as a database outage that has nothing to
 * do with the database.
 *
 * Rather than probe DNS up front — which passes while the very next lookup
 * fails on a flaky resolver — connect for real, and only on a DNS-shaped
 * failure put public resolvers at the front of the list and try once more.
 * A healthy network never reaches the retry.
 */
async function connectWithDnsFallback(
  connectionString: string,
): Promise<MongoClient> {
  const options = {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    maxPoolSize: 10,
  };

  try {
    return await new MongoClient(connectionString, options).connect();
  } catch (err) {
    if (!isDnsFailure(err)) throw err;

    if (!global._dnsFallbackApplied) {
      global._dnsFallbackApplied = true;
      const current = getServers();
      const merged = [...PUBLIC_DNS, ...current.filter((s) => !PUBLIC_DNS.includes(s))];
      setServers(merged);
      console.warn(
        `[db] DNS lookup failed via ${current.join(", ")}. Retrying with ` +
          `${PUBLIC_DNS.join(", ")} in front. If this recurs, switch ` +
          `MONGODB_URI to the non-SRV connection string (npm run db:direct).`,
      );
    }

    return await new MongoClient(connectionString, options).connect();
  }
}

async function createClient(): Promise<MongoClient> {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.",
    );
  }
  try {
    return await connectWithDnsFallback(uri);
  } catch (err) {
    // A failed promise must not stay cached, or every later request reuses
    // the same rejection instead of trying again.
    global._mongoClientPromise = undefined;
    throw err;
  }
}

export function clientPromise(): Promise<MongoClient> {
  return (global._mongoClientPromise ??= createClient());
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  return client.db(dbName);
}

/** True when a connection string is configured at all. */
export const isDbConfigured = Boolean(uri);
