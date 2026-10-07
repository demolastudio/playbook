import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { captcha, haveIBeenPwned } from "better-auth/plugins";
import * as authSchema from "@/db/auth-schema";
import type { Db } from "@/lib/db";

// The Better Auth CLI loads this file in plain Node, where `cloudflare:workers`
// and `next/*` don't resolve — so runtime values arrive as parameters.
export type AuthRuntime = {
  secret: string;
  turnstileSecretKey: string;
  waitUntil: (promise: Promise<unknown>) => void;
  sendVerificationEmail: (email: { to: string; url: string }) => Promise<void>;
};

export const buildAuth = (db: Db, runtime: AuthRuntime) =>
  betterAuth({
    database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
    secret: runtime.secret,
    baseURL: {
      allowedHosts: ["app.example.com", "*.example.workers.dev", "localhost:3000"],
      fallback: "https://app.example.com",
    },
    emailAndPassword: { enabled: true, requireEmailVerification: true },
    emailVerification: {
      sendVerificationEmail: ({ user, url }) =>
        runtime.sendVerificationEmail({ to: user.email, url }),
    },
    session: { cookieCache: { enabled: true, maxAge: 60 * 5 } },
    rateLimit: {
      storage: "database",
      customRules: { "/get-session": false },
    },
    advanced: {
      ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
      backgroundTasks: { handler: runtime.waitUntil },
    },
    plugins: [
      captcha({
        provider: "cloudflare-turnstile",
        secretKey: runtime.turnstileSecretKey,
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
