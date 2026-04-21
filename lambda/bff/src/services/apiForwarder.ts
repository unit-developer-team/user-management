// services/apiForwarder.ts
import { APIGatewayEvent } from "aws-lambda";
import { logError, logInfo } from "../utils/logger";

const shape = (data: unknown) => data;

export const forwardToApi = async (event: APIGatewayEvent) => {
  const albUrl = process.env.ALB_URL;
  const internalToken = process.env.INTERNAL_TOKEN;
  if (!albUrl || !internalToken) {
    throw new Error("環境変数が設定されていません");
  }

  const path = event.path ?? "/users";
  const url = `${albUrl}${path}`;


  try {
    logInfo("ECSへの転送 開始", event, { method: event.httpMethod, path: url });
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
      logError("APIコンテナへの転送失敗", new Error(resText), event, { status: res.status, path: url });
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
      body: JSON.stringify(shape(data)),
    };

  } catch (err) {
    logError("APIコンテナへの接続エラー", err, event, { path: url });
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
