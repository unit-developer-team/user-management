"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forwardToApi = void 0;
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
const logger_1 = require("../utils/logger");
const sm = new client_secrets_manager_1.SecretsManagerClient({ region: "ap-northeast-1" });
const shape = (data) => data;
// コールドスタート時のみ取得
let cachedConfig = null;
const getConfig = async () => {
    if (cachedConfig)
        return cachedConfig;
    const res = await sm.send(new client_secrets_manager_1.GetSecretValueCommand({ SecretId: "/myapp/prod/config" }));
    const secret = JSON.parse(res.SecretString ?? "{}");
    if (!secret.ALB_URL || !secret.INTERNAL_TOKEN) {
        throw new Error("シークレットに必要な値が設定されていません");
    }
    cachedConfig = {
        albUrl: secret.ALB_URL,
        internalToken: secret.INTERNAL_TOKEN,
    };
    return cachedConfig;
};
const forwardToApi = async (event) => {
    const { albUrl, internalToken } = await getConfig();
    const path = event.path ?? "/users";
    const url = `${albUrl}${path}`;
    try {
        (0, logger_1.logInfo)("ECSへの転送 開始", event, { method: event.httpMethod, path: url });
        const res = await fetch(url, {
            method: event.httpMethod,
            headers: {
                "Content-Type": "application/json",
                "X-Internal-Token": internalToken,
            },
            // GET と DELETE は body を送らない
            body: event.body ? event.body : undefined,
        });
        if (!res.ok) {
            const resText = await res.text();
            (0, logger_1.logError)("APIコンテナへの転送失敗", new Error(resText), event, { status: res.status, path: url });
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
            body: JSON.stringify(shape(data)),
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
