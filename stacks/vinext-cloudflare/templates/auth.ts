import { env, waitUntil } from "cloudflare:workers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { buildAuth } from "@/lib/auth-config";
import { getDb, type Db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

export const createAuth = (db: Db) =>
  buildAuth(db, {
    secret: env.BETTER_AUTH_SECRET,
    turnstileSecretKey: env.TURNSTILE_SECRET_KEY,
    waitUntil,
    sendVerificationEmail,
  });

export const requireSession = async () => {
  const session = await createAuth(getDb()).api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  if (!session) redirect("/login");
  return session;
};
