import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Cache the pool on globalThis so Next.js hot-reload reuses a single pool in
// dev instead of leaking a new one on every file change.
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL!,
    idleTimeoutMillis: 10_000, // close idle clients quickly so Neon can auto-suspend
    max: 5,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
