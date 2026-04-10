"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forwardToApi = void 0;
const shape = (data) => data;
const forwardToApi = async (event) => {
    const albUrl = process.env.ALB_URL;
    const internalToken = process.env.INTERNAL_TOKEN;
    if (!albUrl || !internalToken)
        throw new Error("環境変数が設定されていません");
    const path = event.path ?? "/users";
    const url = `${albUrl}${path}`;
    try {
        const res = await fetch(url, {
            method: event.httpMethod,
            headers: {
                "Content-Type": "application/json",
                "X-Internal-Token": internalToken,
            },
            // GETとDELETEはボディなし
            body: event.body ? event.body : undefined,
        });
        if (!res.ok) {
            console.error("APIコンテナへの転送失敗", res.status);
            return {
                statusCode: res.status,
                body: JSON.stringify({ message: "Bad Gateway" }),
            };
        }
        const data = await res.json();
        return {
          statusCode: res.status,
          headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Headers": "Content-Type,Authorization",
                  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
                   },
                   body: JSON.stringify(shape(data)),
                };
    }
    catch (err) {
        console.error("APIコンテナへの接続エラー", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};
exports.forwardToApi = forwardToApi;
