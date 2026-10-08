import { headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { isAppError, toUserMessage } from "@/lib/errors";
import { logger, withContext } from "@/lib/logger";

type Session = Awaited<ReturnType<typeof requireSession>>;

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; issues?: Record<string, string[] | undefined> };

type Action<S extends z.ZodType, T> = {
  name: string;
  schema: S;
  limit?: (key: string) => Promise<boolean>;
  run: (input: z.infer<S>, session: Session) => Promise<T>;
};

export const defineAction =
  <S extends z.ZodType, T>({ name, schema, limit, run }: Action<S, T>) =>
  async (input: unknown): Promise<ActionResult<T>> => {
    const session = await requireSession();
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Please check the highlighted fields.",
        issues: z.flattenError(parsed.error).fieldErrors,
      };
    }
    const requestId = (await headers()).get("x-request-id") ?? crypto.randomUUID();
    return withContext({ requestId, action: name, userId: session.user.id }, async () => {
      if (limit && !(await limit(`${name}:${session.user.id}`))) {
        logger.warn({}, "action rate limited");
        return { ok: false, error: "Too many attempts. Wait a minute and try again." };
      }
      const started = Date.now();
      try {
        const data = await run(parsed.data, session);
        logger.info({ ms: Date.now() - started }, "action succeeded");
        return { ok: true, data };
      } catch (error) {
        unstable_rethrow(error);
        if (isAppError(error)) {
          logger.warn({ reason: error.message }, "action rejected");
          return { ok: false, error: error.message };
        }
        logger.error({ error, ms: Date.now() - started }, "action failed");
        return { ok: false, error: toUserMessage(error) };
      }
    });
  };
