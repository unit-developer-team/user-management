"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tests/services/dynamoService.test.ts
const dynamoService_1 = require("../../src/services/dynamoService");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const aws_sdk_client_mock_1 = require("aws-sdk-client-mock");
const ddbMock = (0, aws_sdk_client_mock_1.mockClient)(lib_dynamodb_1.DynamoDBDocumentClient); //DynamoDBDocumentClient をモック
beforeEach(() => {
    ddbMock.reset();
    process.env.TABLE_NAME = "UsersTable";
});
describe("dynamoService", () => {
    describe("getAllUsers", () => {
        it("ユーザー一覧を返す", async () => {
            const mockUsers = [
                { id: "1", name: "山田太郎", email: "yamada@example.com", createdAt: "2024-01-01T00:00:00.000Z" },
                { id: "2", name: "田中花子", email: "tanaka@example.com", createdAt: "2024-01-02T00:00:00.000Z" },
            ];
            ddbMock.on(lib_dynamodb_1.ScanCommand).resolves({ Items: mockUsers });
            const result = await (0, dynamoService_1.getAllUsers)(); //getAllUsers の内部で ScanCommand が実行されるとddbMock が返す Items: mockUsers が返る
            expect(result).toEqual(mockUsers);
        });
        it("ユーザーが存在しない場合は空配列を返す", async () => {
            ddbMock.on(lib_dynamodb_1.ScanCommand).resolves({ Items: [] });
            const result = await (0, dynamoService_1.getAllUsers)();
            expect(result).toEqual([]);
        });
        it("Itemsがundefinedの場合は空配列を返す", async () => {
            ddbMock.on(lib_dynamodb_1.ScanCommand).resolves({});
            const result = await (0, dynamoService_1.getAllUsers)();
            expect(result).toEqual([]);
        });
    });
    describe("getUserById", () => {
        it("IDに一致するユーザーを返す", async () => {
            const mockUser = { id: "1", name: "山田太郎", email: "yamada@example.com", createdAt: "2024-01-01T00:00:00.000Z" };
            ddbMock.on(lib_dynamodb_1.GetCommand).resolves({ Item: mockUser });
            const result = await (0, dynamoService_1.getUserById)("1");
            expect(result).toEqual(mockUser);
        });
        it("ユーザーが存在しない場合はnullを返す", async () => {
            ddbMock.on(lib_dynamodb_1.GetCommand).resolves({ Item: undefined });
            const result = await (0, dynamoService_1.getUserById)("999");
            expect(result).toBeNull();
        });
    });
    describe("createUser", () => {
        it("ユーザーを登録する", async () => {
            ddbMock.on(lib_dynamodb_1.PutCommand).resolves({});
            const user = { id: "1", name: "山田太郎", email: "yamada@example.com", createdAt: "2024-01-01T00:00:00.000Z" };
            await expect((0, dynamoService_1.createUser)(user)).resolves.toBeUndefined();
        });
        it("同じIDが存在する場合はエラーをスローする", async () => {
            const error = new Error("ConditionalCheckFailedException");
            error.name = "ConditionalCheckFailedException";
            ddbMock.on(lib_dynamodb_1.PutCommand).rejects(error);
            const user = { id: "1", name: "山田太郎", email: "yamada@example.com", createdAt: "2024-01-01T00:00:00.000Z" };
            await expect((0, dynamoService_1.createUser)(user)).rejects.toThrow("ConditionalCheckFailedException");
        });
    });
    describe("deleteUser", () => {
        it("ユーザーを削除する", async () => {
            ddbMock.on(lib_dynamodb_1.DeleteCommand).resolves({});
            await expect((0, dynamoService_1.deleteUser)("1")).resolves.toBeUndefined();
        });
        it("DynamoDBエラーの場合はエラーをスローする", async () => {
            ddbMock.on(lib_dynamodb_1.DeleteCommand).rejects(new Error("DynamoDB Error"));
            await expect((0, dynamoService_1.deleteUser)("1")).rejects.toThrow("DynamoDB Error");
        });
    });
});
