// services/apiForwarder.ts
import { APIGatewayEvent } from "aws-lambda";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { logError, logInfo } from "../utils/logger";

const sm = new SecretsManagerClient({ region: "ap-northeast-1" });

interface Config {
  albUrl: string;          // ← 環境変数
  internalToken: string;   // ← Secrets Manager
}

// コールドスタート時のみ取得
let cachedToken: string | null = null;

// INTERNAL_TOKEN だけ Secrets Manager から取得
const getInternalToken = async (): Promise<string> => {
  if (cachedToken) return cachedToken;

  const res = await sm.send(
    new GetSecretValueCommand({ SecretId: "/myapp/prod/config" })
  );

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

export const forwardToApi = async (event: APIGatewayEvent) => {
  // ALB_URL は環境変数から取得
  const albUrl = process.env.ALB_URL;
  if (!albUrl) {
    throw new Error("ALB_URL 環境変数が設定されていません");
  }

  // INTERNAL_TOKEN は Secrets Manager から取得
  const internalToken = await getInternalToken();

  const path = (event as any).rawPath ?? event.path ?? "/users";
  const url = `${albUrl}${path}`;

  // HTTP APIとREST API両対応
  const method = (event.requestContext as any)?.http?.method || event.httpMethod;

  try {
    logInfo("ECSへの転送 開始", event, { method: event.httpMethod, path: url });

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
      logError("APIコンテナへの転送失敗", new Error(resText), event, {
        status: res.status,
        path: url,
      });

      return {
        statusCode: res.status,
        body: JSON.stringify({ message: "Bad Gateway" }),
      };
    }

    const data = await res.json();

    logInfo("ECSへの転送 完了", event, { status: res.status, path: url });

    return {
      statusCode: res.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    logError("APIコンテナへの接続エラー", err, event, { path: url });

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
