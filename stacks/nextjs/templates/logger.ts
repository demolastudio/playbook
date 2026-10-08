import { AsyncLocalStorage } from "node:async_hooks";

type Fields = Record<string, unknown>;
type Level = "debug" | "info" | "warn" | "error";

const context = new AsyncLocalStorage<Fields>();

export const withContext = <T>(fields: Fields, run: () => T): T =>
  context.run({ ...context.getStore(), ...fields }, run);

const serialize = (_key: string, value: unknown) =>
  value instanceof Error
    ? { name: value.name, message: value.message, stack: value.stack }
    : value;

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
