// src/tests/api/userApi.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUsers, createUser, deleteUser } from "../../api/userApi";

// aws-amplify/authをモック
vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn().mockResolvedValue({
    tokens: {
      idToken: {
        toString: () => "mock-token",
      },
    },
  }),
}));

// fetchをモック
const mockFetch = vi.fn();
global.fetch = mockFetch; // 処理の中でfetchが呼ばれたら、mockFetch に差し変わる

beforeEach(() => {
  mockFetch.mockReset();
});

describe("userApi", () => {
  describe("getUsers", () => {
    it("ユーザー一覧を取得できる", async () => {
      const mockUsers = [
        { id: "1", name: "テストユーザー", email: "test@example.com", createdAt: "2024-01-01" }
      ];

      mockFetch.mockResolvedValue({ //mockFetchはOKとmockUsersを返す
        ok: true,
        json: async () => mockUsers,
      });

      const result = await getUsers();
       expect(result).toEqual([]); // 意図的に失敗させる
    });

    it("取得失敗時にエラーをスローする", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
      });

      await expect(getUsers()).rejects.toThrow("ユーザー一覧の取得に失敗しました");
    });
  });

  describe("createUser", () => {
    it("ユーザーを登録できる", async () => {
      const mockUser = {
        id: "1",
        name: "テストユーザー",
        email: "test@example.com",
        createdAt: "2024-01-01"
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const result = await createUser("テストユーザー", "test@example.com");
      expect(result).toEqual(mockUser);
    });

    it("登録失敗時にエラーをスローする", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
      });

      await expect(createUser("テストユーザー", "test@example.com"))
        .rejects.toThrow("ユーザーの登録に失敗しました");
    });
  });

  describe("deleteUser", () => {
    it("ユーザーを削除できる", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ message: "削除しました" }),
      });

      const result = await deleteUser("1");
      expect(result).toEqual({ message: "削除しました" });
    });

    it("削除失敗時にエラーをスローする", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
      });

      await expect(deleteUser("1")).rejects.toThrow("ユーザーの削除に失敗しました");
    });
  });
});