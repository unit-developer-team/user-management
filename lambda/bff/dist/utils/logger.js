"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInfo = exports.logError = void 0;
const logError = (message, err, event, extra) => {
    console.log(JSON.stringify({
        level: "ERROR",
        message,
        error: err instanceof Error ? err.message : String(err),
        requestId: event.requestContext?.requestId,
        timestamp: new Date().toISOString(),
        ...extra,
    }));
};
exports.logError = logError;
const logInfo = (message, event, extra) => {
    console.log(JSON.stringify({
        level: "INFO",
        message,
        requestId: event.requestContext?.requestId,
        timestamp: new Date().toISOString(),
        ...extra,
    }));
};
exports.logInfo = logInfo;
