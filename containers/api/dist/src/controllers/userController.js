"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserHandler = exports.createUserHandler = exports.getUser = exports.getUsers = void 0;
const dynamoService_1 = require("../services/dynamoService");
const uuid_1 = require("uuid");
// ユーザー一覧取得
const getUsers = async (req, res) => {
    try {
        const users = await (0, dynamoService_1.getAllUsers)();
        users.forEach(user => {
            user.name = `${user.name}`;
        });
        res.status(200).json(users);
    }
    catch (err) {
        console.error("ユーザー一覧取得エラー", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getUsers = getUsers;
// ユーザー詳細取得
const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await (0, dynamoService_1.getUserById)(id);
        if (!user) {
            res.status(404).json({ message: "ユーザーが見つかりません" });
            return;
        }
        res.status(200).json(user);
    }
    catch (err) {
        console.error("ユーザー詳細取得エラー", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.getUser = getUser;
// ユーザー登録
const createUserHandler = async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            res.status(400).json({ message: "name と email は必須です" });
            return;
        }
        const user = {
            id: (0, uuid_1.v4)(),
            name,
            email,
            createdAt: new Date().toISOString(),
        };
        await (0, dynamoService_1.createUser)(user);
        res.status(201).json(user);
    }
    catch (err) {
        // 同じIDが既に存在する場合
        if (err.name === "ConditionalCheckFailedException") {
            res.status(409).json({ message: "既に存在するユーザーです" });
            return;
        }
        console.error("ユーザー登録エラー", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.createUserHandler = createUserHandler;
// ユーザー削除
const deleteUserHandler = async (req, res) => {
    try {
        const { id } = req.params;
        await (0, dynamoService_1.deleteUser)(id);
        res.status(200).json({ message: "削除しました" });
    }
    catch (err) {
        console.error("ユーザー削除エラー", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.deleteUserHandler = deleteUserHandler;
