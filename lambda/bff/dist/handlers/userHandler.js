"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const apiForwarder_1 = require("../services/apiForwarder");
const response_1 = require("../utils/response");
const validate_1 = require("../utils/validate");
const handler = async (event) => {
    // ① 認証情報の取得
    const userId = event.requestContext.authorizer?.claims?.sub;
    if (!userId)
        return (0, response_1.unauthorized)();
    // ② GETはバリデーション不要なのでそのまま転送
    if (event.httpMethod === "GET") {
        return await (0, apiForwarder_1.forwardToApi)(event);
    }
    // ③ GET以外は入力バリデーション
    const validated = (0, validate_1.validate)(event.body);
    if (!validated.ok)
        return (0, response_1.badRequest)(validated.error);
    // ④ 振り分け
    switch (event.httpMethod) {
        case "POST":
        case "DELETE":
            return await (0, apiForwarder_1.forwardToApi)(event);
        default:
            return {
                statusCode: 405,
                body: JSON.stringify({ message: "Method Not Allowed" }),
            };
    }
};
exports.handler = handler;
