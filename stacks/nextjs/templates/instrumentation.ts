import type { Instrumentation } from "next";
import { logger } from "@/lib/logger";

export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  logger.error(
    { error, path: request.path, method: request.method, route: context.routePath },
    "unhandled request error",
  );
};
