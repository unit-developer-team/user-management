"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const userController_1 = require("../../src/controllers/userController");
const dynamoService = __importStar(require("../../src/services/dynamoService"));
jest.mock("../../src/services/dynamoService");
jest.mock("uuid", () => ({ v4: () => "mock-uuid-1234" }));
const mockGetAllUsers = dynamoService.getAllUsers;
const mockGetUserById = dynamoService.getUserById;
const mockCreateUser = dynamoService.createUser;
const mockDeleteUser = dynamoService.deleteUser;
const mockReq = (overrides = {}) => ({
    params: {},
    body: {},
    ...overrides,
});
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
describe("userController", () => {
    describe("getUsers", () => {
        it("200とユーザー一覧を返す", async () => {
            const mockUsers = [
                { id: "1", name: "山田太郎", email: "yamada@example.com", createdAt: "2024-01-01T00:00:00.000Z" },
            ];
            mockGetAllUsers.mockResolvedValue(mockUsers);
            const req = mockReq();
            const res = mockRes();
            await (0, userController_1.getUsers)(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUsers);
        });
        it("DynamoDBエラーの場合は500を返す", async () => {
            mockGetAllUsers.mockRejectedValue(new Error("DynamoDB Error"));
            const req = mockReq();
            const res = mockRes();
            await (0, userController_1.getUsers)(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
        });
    });
    describe("getUser", () => {
        it("200と対象ユーザーを返す", async () => {
            const mockUser = { id: "1", name: "山田太郎", email: "yamada@example.com", createdAt: "2024-01-01T00:00:00.000Z" };
            mockGetUserById.mockResolvedValue(mockUser);
            const req = mockReq({ params: { id: "1" } });
            const res = mockRes();
            await (0, userController_1.getUser)(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });
        it("ユーザーが存在しない場合は404を返す", async () => {
            mockGetUserById.mockResolvedValue(null);
            const req = mockReq({ params: { id: "999" } });
            const res = mockRes();
            await (0, userController_1.getUser)(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "ユーザーが見つかりません" });
        });
        it("DynamoDBエラーの場合は500を返す", async () => {
            mockGetUserById.mockRejectedValue(new Error("DynamoDB Error"));
            const req = mockReq({ params: { id: "1" } });
            const res = mockRes();
            await (0, userController_1.getUser)(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
        });
    });
    describe("createUserHandler", () => {
        it("201と作成したユーザーを返す", async () => {
            mockCreateUser.mockResolvedValue(undefined);
            const req = mockReq({ body: { name: "山田太郎", email: "yamada@example.com" } });
            const res = mockRes();
            await (0, userController_1.createUserHandler)(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                id: "mock-uuid-1234",
                name: "山田太郎",
                email: "yamada@example.com",
            }));
        });
        it("nameが未入力の場合は400を返す", async () => {
            const req = mockReq({ body: { email: "yamada@example.com" } });
            const res = mockRes();
            await (0, userController_1.createUserHandler)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "name と email は必須です" });
        });
        it("emailが未入力の場合は400を返す", async () => {
            const req = mockReq({ body: { name: "山田太郎" } });
            const res = mockRes();
            await (0, userController_1.createUserHandler)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "name と email は必須です" });
        });
        it("同じIDが存在する場合は409を返す", async () => {
            const error = new Error("ConditionalCheckFailedException");
            error.name = "ConditionalCheckFailedException";
            mockCreateUser.mockRejectedValue(error);
            const req = mockReq({ body: { name: "山田太郎", email: "yamada@example.com" } });
            const res = mockRes();
            await (0, userController_1.createUserHandler)(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: "既に存在するユーザーです" });
        });
        it("DynamoDBエラーの場合は500を返す", async () => {
            mockCreateUser.mockRejectedValue(new Error("DynamoDB Error"));
            const req = mockReq({ body: { name: "山田太郎", email: "yamada@example.com" } });
            const res = mockRes();
            await (0, userController_1.createUserHandler)(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
        });
    });
    describe("deleteUserHandler", () => {
        it("200と削除メッセージを返す", async () => {
            mockDeleteUser.mockResolvedValue(undefined);
            const req = mockReq({ params: { id: "1" } });
            const res = mockRes();
            await (0, userController_1.deleteUserHandler)(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "削除しました" });
        });
        it("DynamoDBエラーの場合は500を返す", async () => {
            mockDeleteUser.mockRejectedValue(new Error("DynamoDB Error"));
            const req = mockReq({ params: { id: "1" } });
            const res = mockRes();
            await (0, userController_1.deleteUserHandler)(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
        });
    });
});
