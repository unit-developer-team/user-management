// handlers/userHandler.ts
import { APIGatewayEvent } from "aws-lambda";
import { forwardToApi } from "../services/apiForwarder";
import { unauthorized, badRequest } from "../utils/response";
import { validate } from "../utils/validate";

export const handler = async (event: APIGatewayEvent) => {

  // ① 認証情報の取得
  const userId = event.requestContext.authorizer?.claims?.sub;
  if (!userId) return unauthorized();

  // ② GETはバリデーション不要なのでそのまま転送
  if (event.httpMethod === "GET") {
    return await forwardToApi(event);
  }

  // ③ GET以外は入力バリデーション
  const validated = validate(event.body);
  if (!validated.ok) return badRequest(validated.error);

  // ④ 振り分け
  switch (event.httpMethod) {
    case "POST":
    case "DELETE":
      return await forwardToApi(event);
    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method Not Allowed" }),
      };
  }
};