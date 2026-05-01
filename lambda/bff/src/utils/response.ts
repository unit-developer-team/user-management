// utils/response.ts

// 共通CORSヘッダー
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS"
};

export const unauthorized = () => ({
    statusCode: 401,
    headers: corsHeaders,
    body: JSON.stringify({ message: "Unauthorized" }),
});

export const badRequest = (error: string) => ({
    statusCode: 400,
    headers: corsHeaders,
    body: JSON.stringify({ message: error }),
});

export const internalServerError = () => ({
    statusCode: 500,
    headers: corsHeaders,
    body: JSON.stringify({ message: "Internal Server Error" }),
});