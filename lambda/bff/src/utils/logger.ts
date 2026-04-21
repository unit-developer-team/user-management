import { APIGatewayEvent } from "aws-lambda";

export const logError = (message: string, err: unknown, event: APIGatewayEvent, extra?: Record<string, unknown>) => {
  console.log(JSON.stringify({
    level: "ERROR",
    message,
    error: err instanceof Error ? err.message : String(err),
    requestId: event.requestContext?.requestId,
    timestamp: new Date().toISOString(),
    ...extra,
  }));
};

export const logInfo = (message: string, event: APIGatewayEvent, extra?: Record<string, unknown>) => {
  console.log(JSON.stringify({
    level: "INFO",
    message,
    requestId: event.requestContext?.requestId,
    timestamp: new Date().toISOString(),
    ...extra,
  }));
};
