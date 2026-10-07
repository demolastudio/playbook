import { env, waitUntil } from "cloudflare:workers";
import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { captcha, haveIBeenPwned } from "better-auth/plugins";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import * as authSchema from "@/db/auth-schema";
import { getDb, type Db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";

export const createAuth = (db: Db) =>
  betterAuth({
    database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: {
      allowedHosts: ["app.example.com", "*.example.workers.dev", "localhost:3000"],
      fallback: "https://app.example.com",
    },
    emailAndPassword: { enabled: true, requireEmailVerification: true },
    emailVerification: {
      sendVerificationEmail: ({ user, url }) =>
        sendVerificationEmail({ to: user.email, url }),
    },
    session: { cookieCache: { enabled: true, maxAge: 60 * 5 } },
    rateLimit: {
      storage: "database",
      customRules: { "/get-session": false },
    },
    advanced: {
      ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
      backgroundTasks: { handler: waitUntil },
    },
    plugins: [
      captcha({
        provider: "cloudflare-turnstile",
        secretKey: env.TURNSTILE_SECRET_KEY,
        endpoints: [
          "/sign-up/email",
          "/sign-in/email",
          "/request-password-reset",
          "/send-verification-email",
        ],
      }),
      haveIBeenPwned(),
    ],
  });

export const requireSession = async () => {
  const session = await createAuth(getDb()).api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  if (!session) redirect("/login");
  return session;
};
