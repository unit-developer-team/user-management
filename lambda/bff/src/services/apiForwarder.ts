// services/apiForwarder.ts
import { APIGatewayEvent } from "aws-lambda";
import { logError, logInfo } from "../utils/logger";

export const forwardToApi = async (event: APIGatewayEvent) => {
  // ALB_URL は環境変数から取得
  const albUrl = process.env.ALB_URL;
  if (!albUrl) {
    throw new Error("ALB_URL 環境変数が設定されていません");
  }

  const internalToken = process.env.INTERNAL_TOKEN;
  if (!internalToken) {
    throw new Error("INTERNAL_TOKEN 環境変数が設定されていません");
  }

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
