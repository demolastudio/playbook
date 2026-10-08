export type AppError = Error & { expose: true };

export const appError = (message: string): AppError =>
  Object.assign(new Error(message), { expose: true as const });

export const isAppError = (error: unknown): error is AppError =>
  error instanceof Error && "expose" in error && error.expose === true;

export const toUserMessage = (error: unknown) =>
  isAppError(error) ? error.message : "Something went wrong. Please try again.";
