import { env } from "cloudflare:workers";

export const perUserLimit = async (key: string) =>
  (await env.ACTION_LIMITER.limit({ key })).success;
