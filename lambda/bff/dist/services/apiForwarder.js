"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forwardToApi = void 0;
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
const logger_1 = require("../utils/logger");
const sm = new client_secrets_manager_1.SecretsManagerClient({ region: "ap-northeast-1" });
// コールドスタート時のみ取得
let cachedToken = null;
// INTERNAL_TOKEN だけ Secrets Manager から取得
const getInternalToken = async () => {
    if (cachedToken)
        return cachedToken;
    const res = await sm.send(new client_secrets_manager_1.GetSecretValueCommand({ SecretId: "/myapp/prod/config" }));
    const secret = JSON.parse(res.SecretString ?? "{}");
    if (!secret.INTERNAL_TOKEN) {
        throw new Error("シークレットに INTERNAL_TOKEN がありません");
    }
    cachedToken = secret.INTERNAL_TOKEN;
    if (!cachedToken) {
        throw new Error("Token が取得されていません");
    }
    return cachedToken;
};
const forwardToApi = async (event) => {
    // ALB_URL は環境変数から取得
    const albUrl = process.env.ALB_URL;
    if (!albUrl) {
        throw new Error("ALB_URL 環境変数が設定されていません");
    }
    // INTERNAL_TOKEN は Secrets Manager から取得
    const internalToken = await getInternalToken();
    const path = event.rawPath ?? event.path ?? "/users";
    const url = `${albUrl}${path}`;
    // HTTP APIとREST API両対応
    const method = event.requestContext?.http?.method || event.httpMethod;
    try {
        (0, logger_1.logInfo)("ECSへの転送 開始", event, { method: event.httpMethod, path: url });
        const res = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "X-Internal-Token": internalToken,
            },
            body: event.body ? event.body : undefined,
        });
        if (!res.ok) {
            const resText = await res.text();
            (0, logger_1.logError)("APIコンテナへの転送失敗", new Error(resText), event, {
                status: res.status,
                path: url,
            });
            return {
                statusCode: res.status,
                body: JSON.stringify({ message: "Bad Gateway" }),
            };
        }
        const data = await res.json();
        (0, logger_1.logInfo)("ECSへの転送 完了", event, { status: res.status, path: url });
        return {
            statusCode: res.status,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
            },
            body: JSON.stringify(data),
        };
    }
    catch (err) {
        (0, logger_1.logError)("APIコンテナへの接続エラー", err, event, { path: url });
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};
exports.forwardToApi = forwardToApi;
