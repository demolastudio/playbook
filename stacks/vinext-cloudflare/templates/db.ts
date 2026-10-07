import { env } from "cloudflare:workers";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { cache } from "react";
import { relations } from "@/db/relations";

export type Db = NodePgDatabase<typeof relations>;

const connect = (connectionString: string): Db =>
  drizzle({ client: new Pool({ connectionString, max: 1 }), relations });

export const getDb = cache(() => connect(env.HYPERDRIVE_FRESH.connectionString));

export const getCachedReadDb = cache(() => connect(env.HYPERDRIVE.connectionString));
