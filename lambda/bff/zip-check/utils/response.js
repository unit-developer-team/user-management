"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalServerError = exports.badRequest = exports.unauthorized = void 0;
// utils/response.ts
const unauthorized = () => ({
    statusCode: 401,
    body: JSON.stringify({ message: "Unauthorized" }),
});
exports.unauthorized = unauthorized;
const badRequest = (error) => ({
    statusCode: 400,
    body: JSON.stringify({ message: error }),
});
exports.badRequest = badRequest;
const internalServerError = () => ({
    statusCode: 500,
    body: JSON.stringify({ message: "Internal Server Error" }),
});
exports.internalServerError = internalServerError;
