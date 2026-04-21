import { Request } from "express";

export const logError = (message: string, err: unknown, req: Request, extra?: Record<string, unknown>) => {
  console.log(JSON.stringify({
    level: "ERROR",
    message,
    error: err instanceof Error ? err.message : String(err),
    requestId: req.headers["x-request-id"],
    timestamp: new Date().toISOString(),
    ...extra,
  }));
};

export const logInfo = (message: string, req: Request, extra?: Record<string, unknown>) => {
  console.log(JSON.stringify({
    level: "INFO",
    message,
    requestId: req.headers["x-request-id"],
    timestamp: new Date().toISOString(),
    ...extra,
  }));
};
