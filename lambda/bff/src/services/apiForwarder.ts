// services/apiForwarder.ts
import { APIGatewayEvent } from "aws-lambda";

const shape = (data: unknown) => data;

export const forwardToApi = async (event: APIGatewayEvent) => {
  const albUrl = process.env.ALB_URL;
  const internalToken = process.env.INTERNAL_TOKEN;
  if (!albUrl || !internalToken) {
    throw new Error("環境変数が設定されていません");
  }

  const path = event.path ?? "/users";
  const url = `${albUrl}${path}`;

 
  console.log("event.path:", event.path);
  console.log("event.httpMethod:", event.httpMethod);
  console.log("転送先URL:", url);
  console.log("INTERNAL_TOKEN:", internalToken);

  try {
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
      console.error(
        "APIコンテナへの転送失敗",
        res.status,
        await res.text()
      );
      return {
        statusCode: res.status,
        body: JSON.stringify({ message: "Bad Gateway" }),
      };
    }

    const data = await res.json();

    // JS にあった CORS ヘッダも TS に反映
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
    console.error("APIコンテナへの接続エラー", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
