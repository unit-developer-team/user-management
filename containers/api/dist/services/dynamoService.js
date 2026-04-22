"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
// services/dynamoService.ts
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({});
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;
if (!TABLE_NAME)
    throw new Error("TABLE_NAME が設定されていません");
// ユーザー一覧取得
const getAllUsers = async () => {
    const res = await docClient.send(new lib_dynamodb_1.ScanCommand({
        TableName: TABLE_NAME,
    }));
    return (res.Items ?? []);
};
exports.getAllUsers = getAllUsers;
// ユーザー詳細取得
const getUserById = async (id) => {
    const res = await docClient.send(new lib_dynamodb_1.GetCommand({
        TableName: TABLE_NAME,
        Key: { id },
    }));
    return res.Item ?? null;
};
exports.getUserById = getUserById;
// ユーザー登録
const createUser = async (user) => {
    await docClient.send(new lib_dynamodb_1.PutCommand({
        TableName: TABLE_NAME,
        Item: user,
        ConditionExpression: "attribute_not_exists(id)",
    }));
};
exports.createUser = createUser;
// ユーザー削除
const deleteUser = async (id) => {
    await docClient.send(new lib_dynamodb_1.DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id },
    }));
};
exports.deleteUser = deleteUser;
