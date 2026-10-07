// Schema generation only, never imported by the app:
// npx auth@latest generate --config auth-cli.ts --output db/auth-schema.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "@/db/relations";
import { buildAuth } from "@/lib/auth-config";

export const auth = buildAuth(drizzle.mock({ relations }), {
  secret: "schema-generation-only",
  turnstileSecretKey: "schema-generation-only",
  waitUntil: () => {},
  sendVerificationEmail: async () => {},
});
