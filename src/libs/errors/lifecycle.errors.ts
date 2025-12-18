export class AbortError extends Error {
  override readonly name = "AbortError" as const;

  constructor(message = "Operation aborted") {
    super(message);
  }
}

export class TimeoutError extends Error {
  override readonly name = "TimeoutError" as const;

  constructor(message = "Operation timed out") {
    super(message);
  }
}

export function isAbortError(error: unknown): error is AbortError {
  return error instanceof Error && error.name === "AbortError";
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof Error && error.name === "TimeoutError";
}
