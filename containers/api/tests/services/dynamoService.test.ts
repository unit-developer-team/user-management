// tests/services/dynamoService.test.ts
import { getAllUsers, getUserById, createUser, deleteUser } from "../../src/services/dynamoService";
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const ddbMock = mockClient(DynamoDBDocumentClient); //DynamoDBDocumentClient をモック

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
      ddbMock.on(ScanCommand).resolves({ Items: mockUsers });

      const result = await getAllUsers(); //getAllUsers の内部で ScanCommand が実行されるとddbMock が返す Items: mockUsers が返る

      expect(result).toEqual([]);
    });

    it("ユーザーが存在しない場合は空配列を返す", async () => {
      ddbMock.on(ScanCommand).resolves({ Items: [] });

      const result = await getAllUsers();

      expect(result).toEqual([]);
    });

    it("Itemsがundefinedの場合は空配列を返す", async () => {
      ddbMock.on(ScanCommand).resolves({});

      const result = await getAllUsers();

      expect(result).toEqual([]);
    });
  });

  describe("getUserById", () => {
    it("IDに一致するユーザーを返す", async () => {
      const mockUser = { id: "1", name: "山田太郎", email: "yamada@example.com", createdAt: "2024-01-01T00:00:00.000Z" };
      ddbMock.on(GetCommand).resolves({ Item: mockUser });

      const result = await getUserById("1");

      expect(result).toEqual(mockUser);
    });

    it("ユーザーが存在しない場合はnullを返す", async () => {
      ddbMock.on(GetCommand).resolves({ Item: undefined });

      const result = await getUserById("999");

      expect(result).toBeNull();
    });
  });

  describe("createUser", () => {
    it("ユーザーを登録する", async () => {
      ddbMock.on(PutCommand).resolves({});

      const user = { id: "1", name: "山田太郎", email: "yamada@example.com", createdAt: "2024-01-01T00:00:00.000Z" };

      await expect(createUser(user)).resolves.toBeUndefined();
    });

    it("同じIDが存在する場合はエラーをスローする", async () => {
      const error = new Error("ConditionalCheckFailedException");
      error.name = "ConditionalCheckFailedException";
      ddbMock.on(PutCommand).rejects(error);

      const user = { id: "1", name: "山田太郎", email: "yamada@example.com", createdAt: "2024-01-01T00:00:00.000Z" };

      await expect(createUser(user)).rejects.toThrow("ConditionalCheckFailedException");
    });
  });

  describe("deleteUser", () => {
    it("ユーザーを削除する", async () => {
      ddbMock.on(DeleteCommand).resolves({});

      await expect(deleteUser("1")).resolves.toBeUndefined();
    });

    it("DynamoDBエラーの場合はエラーをスローする", async () => {
      ddbMock.on(DeleteCommand).rejects(new Error("DynamoDB Error"));

      await expect(deleteUser("1")).rejects.toThrow("DynamoDB Error");
    });
  });
});