"use strict";
// utils/response.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalServerError = exports.badRequest = exports.unauthorized = void 0;
// 共通CORSヘッダー
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS"
};
const unauthorized = () => ({
    statusCode: 401,
    headers: corsHeaders,
    body: JSON.stringify({ message: "Unauthorized" }),
});
exports.unauthorized = unauthorized;
const badRequest = (error) => ({
    statusCode: 400,
    headers: corsHeaders,
    body: JSON.stringify({ message: error }),
});
exports.badRequest = badRequest;
const internalServerError = () => ({
    statusCode: 500,
    headers: corsHeaders,
    body: JSON.stringify({ message: "Internal Server Error" }),
});
exports.internalServerError = internalServerError;
