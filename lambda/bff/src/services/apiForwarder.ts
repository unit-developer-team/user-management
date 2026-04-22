// services/apiForwarder.ts
import { APIGatewayEvent } from "aws-lambda";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { logError, logInfo } from "../utils/logger";

const sm = new SecretsManagerClient({ region: "ap-northeast-1" });

const shape = (data: unknown) => data;

interface Config {
  albUrl: string;
  internalToken: string;
}

// コールドスタート時のみ取得
let cachedConfig: Config | null = null;

const getConfig = async (): Promise<Config> => {
  if (cachedConfig) return cachedConfig;

  const res = await sm.send(
    new GetSecretValueCommand({ SecretId: "/myapp/prod/config" })
  );

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

export const forwardToApi = async (event: APIGatewayEvent) => {
  const { albUrl, internalToken } = await getConfig();

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