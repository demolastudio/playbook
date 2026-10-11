import { AsyncLocalStorage } from "node:async_hooks";

type Fields = Record<string, unknown>;
type Level = "debug" | "info" | "warn" | "error";

const context = new AsyncLocalStorage<Fields>();

export const withContext = <T>(fields: Fields, run: () => T): T =>
  context.run({ ...context.getStore(), ...fields }, run);

const sensitive = /password|secret|token|authorization|cookie|api[-_]?key|signature/i;

const serialize = (key: string, value: unknown) => {
  if (sensitive.test(key)) return "[redacted]";
  return value instanceof Error
    ? { name: value.name, message: value.message, stack: value.stack }
    : value;
};

const write = (level: Level) => (fields: Fields, message: string) =>
  console[level](
    JSON.stringify({ level, message, ...context.getStore(), ...fields }, serialize),
  );

export const logger = {
  debug: write("debug"),
  info: write("info"),
  warn: write("warn"),
  error: write("error"),
};
