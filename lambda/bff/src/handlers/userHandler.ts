// handlers/userHandler.ts
import { APIGatewayEvent } from "aws-lambda";
import { forwardToApi } from "../services/apiForwarder";
import { unauthorized, badRequest } from "../utils/response";
import { validate } from "../utils/validate";
import { logInfo } from "../utils/logger";

export const handler = async (event: APIGatewayEvent) => {
  // ① 認証情報の取得
  const userId = event.requestContext.authorizer?.claims?.sub;
  if (!userId) return unauthorized();

  const method = event.httpMethod;
  logInfo("リクエスト受付", event, { method, path: event.path, userId });

  // ② GET と DELETE はバリデーション不要
  if (method === "GET" || method === "DELETE") {
    return await forwardToApi(event);
  }

  // ③ POST などは入力バリデーション
  const validated = validate(event.body);
  if (!validated.ok) {
    logInfo("バリデーションエラー", event, { method, body: event.body });
    return badRequest(validated.error);
  }

  // ④ 振り分け
  switch (method) {
    case "POST":
      return await forwardToApi(event);

    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
  }
};