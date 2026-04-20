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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// tests/routes/userRoutes.test.ts
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const userRoutes_1 = __importDefault(require("../../src/routes/userRoutes"));
const dynamoService = __importStar(require("../../src/services/dynamoService"));
jest.mock("../../src/services/dynamoService");
jest.mock("uuid", () => ({ v4: () => "mock-uuid-1234" }));
const mockGetAllUsers = dynamoService.getAllUsers;
const mockGetUserById = dynamoService.getUserById;
const mockCreateUser = dynamoService.createUser;
const mockDeleteUser = dynamoService.deleteUser;
const VALID_TOKEN = "test-internal-token";
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/", userRoutes_1.default);
beforeEach(() => {
    process.env.INTERNAL_TOKEN = VALID_TOKEN;
});
describe("userRoutes", () => {
    describe("GET /users", () => {
        it("トークンが正しい場合は200を返す", async () => {
            const mockUsers = [
                { id: "1", name: "山田太郎", email: "yamada@example.com", createdAt: "2024-01-01T00:00:00.000Z" },
            ];
            mockGetAllUsers.mockResolvedValue(mockUsers);
            const res = await (0, supertest_1.default)(app)
                .get("/users")
                .set("x-internal-token", VALID_TOKEN);
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockUsers);
        });
        it("トークンがない場合は403を返す", async () => {
            const res = await (0, supertest_1.default)(app).get("/users");
            expect(res.status).toBe(403);
            expect(res.body).toEqual({ message: "Forbidden" });
        });
        it("トークンが不正な場合は403を返す", async () => {
            const res = await (0, supertest_1.default)(app)
                .get("/users")
                .set("x-internal-token", "invalid-token");
            expect(res.status).toBe(403);
            expect(res.body).toEqual({ message: "Forbidden" });
        });
    });
    describe("GET /users/:id", () => {
        it("ユーザーが存在する場合は200を返す", async () => {
            const mockUser = { id: "1", name: "山田太郎", email: "yamada@example.com", createdAt: "2024-01-01T00:00:00.000Z" };
            mockGetUserById.mockResolvedValue(mockUser);
            const res = await (0, supertest_1.default)(app)
                .get("/users/1")
                .set("x-internal-token", VALID_TOKEN);
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockUser);
        });
        it("ユーザーが存在しない場合は404を返す", async () => {
            mockGetUserById.mockResolvedValue(null);
            const res = await (0, supertest_1.default)(app)
                .get("/users/999")
                .set("x-internal-token", VALID_TOKEN);
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ message: "ユーザーが見つかりません" });
        });
        it("トークンがない場合は403を返す", async () => {
            const res = await (0, supertest_1.default)(app).get("/users/1");
            expect(res.status).toBe(403);
        });
    });
    describe("POST /users", () => {
        it("正しいリクエストの場合は201を返す", async () => {
            mockCreateUser.mockResolvedValue(undefined);
            const res = await (0, supertest_1.default)(app)
                .post("/users")
                .set("x-internal-token", VALID_TOKEN)
                .send({ name: "山田太郎", email: "yamada@example.com" });
            expect(res.status).toBe(201);
            expect(res.body).toMatchObject({
                id: "mock-uuid-1234",
                name: "山田太郎",
                email: "yamada@example.com",
            });
        });
        it("nameが未入力の場合は400を返す", async () => {
            const res = await (0, supertest_1.default)(app)
                .post("/users")
                .set("x-internal-token", VALID_TOKEN)
                .send({ email: "yamada@example.com" });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: "name と email は必須です" });
        });
        it("emailが未入力の場合は400を返す", async () => {
            const res = await (0, supertest_1.default)(app)
                .post("/users")
                .set("x-internal-token", VALID_TOKEN)
                .send({ name: "山田太郎" });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: "name と email は必須です" });
        });
        it("トークンがない場合は403を返す", async () => {
            const res = await (0, supertest_1.default)(app)
                .post("/users")
                .send({ name: "山田太郎", email: "yamada@example.com" });
            expect(res.status).toBe(403);
        });
    });
    describe("DELETE /users/:id", () => {
        it("正しいリクエストの場合は200を返す", async () => {
            mockDeleteUser.mockResolvedValue(undefined);
            const res = await (0, supertest_1.default)(app)
                .delete("/users/1")
                .set("x-internal-token", VALID_TOKEN);
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: "削除しました" });
        });
        it("トークンがない場合は403を返す", async () => {
            const res = await (0, supertest_1.default)(app).delete("/users/1");
            expect(res.status).toBe(403);
        });
        it("DynamoDBエラーの場合は500を返す", async () => {
            mockDeleteUser.mockRejectedValue(new Error("DynamoDB Error"));
            const res = await (0, supertest_1.default)(app)
                .delete("/users/1")
                .set("x-internal-token", VALID_TOKEN);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: "Internal Server Error" });
        });
    });
});
