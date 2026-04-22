"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserHandler = exports.createUserHandler = exports.getUser = exports.getUsers = void 0;
const dynamoService_1 = require("../services/dynamoService");
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
// ユーザー一覧取得
const getUsers = async (req, res) => {
    try {
        (0, logger_1.logInfo)("ユーザー一覧取得 開始", req);
        const users = await (0, dynamoService_1.getAllUsers)();
        users.forEach(user => {
            user.name = `${user.name}さん`;
        });
        (0, logger_1.logInfo)("ユーザー一覧取得 完了", req, { count: users.length });
        res.status(200).json(users);
    }
    catch (err) {
        (0, logger_1.logError)("ユーザー一覧取得エラー", err, req);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getUsers = getUsers;
// ユーザー詳細取得
const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        (0, logger_1.logInfo)("ユーザー詳細取得 開始", req, { userId: id });
        const user = await (0, dynamoService_1.getUserById)(id);
        if (!user) {
            (0, logger_1.logInfo)("ユーザー詳細取得 対象なし", req, { userId: id });
            res.status(404).json({ message: "ユーザーが見つかりません" });
            return;
        }
        (0, logger_1.logInfo)("ユーザー詳細取得 完了", req, { userId: id });
        res.status(200).json(user);
    }
    catch (err) {
        (0, logger_1.logError)("ユーザー詳細取得エラー", err, req, { userId: req.params.id });
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getUser = getUser;
// ユーザー登録
const createUserHandler = async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            (0, logger_1.logInfo)("ユーザー登録 バリデーションエラー", req);
            res.status(400).json({ message: "name と email は必須です" });
            return;
        }
        const user = {
            id: (0, uuid_1.v4)(),
            name,
            email,
            createdAt: new Date().toISOString(),
        };
        (0, logger_1.logInfo)("ユーザー登録 開始", req, { userId: user.id });
        await (0, dynamoService_1.createUser)(user);
        (0, logger_1.logInfo)("ユーザー登録 完了", req, { userId: user.id });
        res.status(201).json(user);
    }
    catch (err) {
        // 同じIDが既に存在する場合
        if (err.name === "ConditionalCheckFailedException") {
            res.status(409).json({ message: "既に存在するユーザーです" });
            return;
        }
        (0, logger_1.logError)("ユーザー登録エラー", err, req);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.createUserHandler = createUserHandler;
// ユーザー削除
const deleteUserHandler = async (req, res) => {
    try {
        const { id } = req.params;
        (0, logger_1.logInfo)("ユーザー削除 開始", req, { userId: id });
        await (0, dynamoService_1.deleteUser)(id);
        (0, logger_1.logInfo)("ユーザー削除 完了", req, { userId: id });
        res.status(200).json({ message: "削除しました" });
    }
    catch (err) {
        (0, logger_1.logError)("ユーザー削除エラー", err, req, { userId: req.params.id });
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.deleteUserHandler = deleteUserHandler;
