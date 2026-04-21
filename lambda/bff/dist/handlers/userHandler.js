"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const apiForwarder_1 = require("../services/apiForwarder");
const response_1 = require("../utils/response");
const validate_1 = require("../utils/validate");
const logger_1 = require("../utils/logger");
const handler = async (event) => {
    // ① 認証情報の取得
    const userId = event.requestContext.authorizer?.claims?.sub;
    if (!userId)
        return (0, response_1.unauthorized)();
    const method = event.httpMethod;
    (0, logger_1.logInfo)("リクエスト受付", event, { method, path: event.path, userId });
    // ② GET と DELETE はバリデーション不要
    if (method === "GET" || method === "DELETE") {
        return await (0, apiForwarder_1.forwardToApi)(event);
    }
    // ③ POST などは入力バリデーション
    const validated = (0, validate_1.validate)(event.body);
    if (!validated.ok) {
        (0, logger_1.logInfo)("バリデーションエラー", event, { method, body: event.body });
        return (0, response_1.badRequest)(validated.error);
    }
    // ④ 振り分け
    switch (method) {
        case "POST":
            return await (0, apiForwarder_1.forwardToApi)(event);
        default:
            return {
                statusCode: 405,
                body: JSON.stringify({ message: "Method Not Allowed" }),
            };
    }
};
exports.handler = handler;
