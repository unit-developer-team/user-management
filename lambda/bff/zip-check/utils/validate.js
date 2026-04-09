"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (body) => {
    if (!body)
        return { ok: false, error: "リクエストボディがありません" };
    try {
        const data = JSON.parse(body);
        return { ok: true, data };
    }
    catch {
        return { ok: false, error: "JSONのパースに失敗しました" };
    }
};
exports.validate = validate;
