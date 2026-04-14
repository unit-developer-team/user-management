"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;

const { forwardToApi } = require("../services/apiForwarder");
const { unauthorized, badRequest } = require("../utils/response");
const { validate } = require("../utils/validate");

const handler = async (event) => {
  // ① 認証情報の取得
  const userId = event.requestContext.authorizer?.claims?.sub;
  if (!userId) return unauthorized();

  const method = event.httpMethod;

  // ② GET と DELETE はバリデーション不要
  if (method === "GET" || method === "DELETE") {
    return await forwardToApi(event);
  }

  // ③ POST などは入力バリデーション
  const validated = validate(event.body);
  if (!validated.ok) return badRequest(validated.error);

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

exports.handler = handler;
