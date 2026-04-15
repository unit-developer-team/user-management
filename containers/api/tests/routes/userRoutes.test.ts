// tests/routes/userRoutes.test.ts
import request from "supertest";
import express from "express";
import userRoutes from "../../src/routes/userRoutes";
import * as dynamoService from "../../src/services/dynamoService";

jest.mock("../../src/services/dynamoService");
jest.mock("uuid", () => ({ v4: () => "mock-uuid-1234" }));

const mockGetAllUsers = dynamoService.getAllUsers as jest.MockedFunction<typeof dynamoService.getAllUsers>;
const mockGetUserById = dynamoService.getUserById as jest.MockedFunction<typeof dynamoService.getUserById>;
const mockCreateUser = dynamoService.createUser as jest.MockedFunction<typeof dynamoService.createUser>;
const mockDeleteUser = dynamoService.deleteUser as jest.MockedFunction<typeof dynamoService.deleteUser>;

const VALID_TOKEN = "test-internal-token";

const app = express();
app.use(express.json());
app.use("/", userRoutes);

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

      const res = await request(app)
        .get("/users")
        .set("x-internal-token", VALID_TOKEN);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUsers);
    });

    it("トークンがない場合は403を返す", async () => {
      const res = await request(app).get("/users");

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ message: "Forbidden" });
    });

    it("トークンが不正な場合は403を返す", async () => {
      const res = await request(app)
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

      const res = await request(app)
        .get("/users/1")
        .set("x-internal-token", VALID_TOKEN);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUser);
    });

    it("ユーザーが存在しない場合は404を返す", async () => {
      mockGetUserById.mockResolvedValue(null);

      const res = await request(app)
        .get("/users/999")
        .set("x-internal-token", VALID_TOKEN);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "ユーザーが見つかりません" });
    });

    it("トークンがない場合は403を返す", async () => {
      const res = await request(app).get("/users/1");

      expect(res.status).toBe(403);
    });
  });

  describe("POST /users", () => {
    it("正しいリクエストの場合は201を返す", async () => {
      mockCreateUser.mockResolvedValue(undefined);

      const res = await request(app)
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
      const res = await request(app)
        .post("/users")
        .set("x-internal-token", VALID_TOKEN)
        .send({ email: "yamada@example.com" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "name と email は必須です" });
    });

    it("emailが未入力の場合は400を返す", async () => {
      const res = await request(app)
        .post("/users")
        .set("x-internal-token", VALID_TOKEN)
        .send({ name: "山田太郎" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: "name と email は必須です" });
    });

    it("トークンがない場合は403を返す", async () => {
      const res = await request(app)
        .post("/users")
        .send({ name: "山田太郎", email: "yamada@example.com" });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /users/:id", () => {
    it("正しいリクエストの場合は200を返す", async () => {
      mockDeleteUser.mockResolvedValue(undefined);

      const res = await request(app)
        .delete("/users/1")
        .set("x-internal-token", VALID_TOKEN);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "削除しました" });
    });

    it("トークンがない場合は403を返す", async () => {
      const res = await request(app).delete("/users/1");

      expect(res.status).toBe(403);
    });

    it("DynamoDBエラーの場合は500を返す", async () => {
      mockDeleteUser.mockRejectedValue(new Error("DynamoDB Error"));

      const res = await request(app)
        .delete("/users/1")
        .set("x-internal-token", VALID_TOKEN);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: "Internal Server Error" });
    });
  });
});