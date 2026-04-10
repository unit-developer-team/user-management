// src/tests/pages/UsersPage.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsersPage from "../../pages/UsersPage";

// userApiをモック
vi.mock("../../api/userApi", () => ({
  getUsers: vi.fn(),
  createUser: vi.fn(),
  deleteUser: vi.fn(),
}));

import { getUsers, createUser, deleteUser } from "../../api/userApi";

const mockGetUsers = vi.mocked(getUsers);
const mockCreateUser = vi.mocked(createUser);
const mockDeleteUser = vi.mocked(deleteUser);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("UsersPage", () => {
  describe("ユーザー一覧", () => {
    it("ユーザーがいない場合にメッセージを表示する", async () => {
      mockGetUsers.mockResolvedValue([]);

      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText("ユーザーがいません")).toBeInTheDocument();
      });
    });

    it("ユーザー一覧を表示する", async () => {
      mockGetUsers.mockResolvedValue([
        { id: "1", name: "テストユーザー", email: "test@example.com", createdAt: "2024-01-01" },
      ]);

      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText("テストユーザー")).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
      });
    });

    it("取得失敗時にエラーメッセージを表示する", async () => {
      mockGetUsers.mockRejectedValue(new Error("取得失敗"));

      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText("ユーザー一覧の取得に失敗しました")).toBeInTheDocument();
      });
    });
  });

  describe("ユーザー登録", () => {
    it("名前とメールアドレスを入力して登録できる", async () => {
      mockGetUsers.mockResolvedValue([]);
      mockCreateUser.mockResolvedValue({
        id: "1",
        name: "新規ユーザー",
        email: "new@example.com",
        createdAt: "2024-01-01",
      });

      render(<UsersPage />);

      await userEvent.type(screen.getByPlaceholderText("名前"), "新規ユーザー");
      await userEvent.type(screen.getByPlaceholderText("メールアドレス"), "new@example.com");
      await userEvent.click(screen.getByText("登録"));

      await waitFor(() => {
        expect(mockCreateUser).toHaveBeenCalledWith("新規ユーザー", "new@example.com");
      });
    });

    it("名前が空の場合にエラーメッセージを表示する", async () => {
      mockGetUsers.mockResolvedValue([]);

      render(<UsersPage />);

      await userEvent.click(screen.getByText("登録"));

      await waitFor(() => {
        expect(screen.getByText("名前とメールアドレスを入力してください")).toBeInTheDocument();
      });
    });
  });

  describe("ユーザー削除", () => {
    it("削除ボタンをクリックするとユーザーが削除される", async () => {
      mockGetUsers.mockResolvedValue([
        { id: "1", name: "テストユーザー", email: "test@example.com", createdAt: "2024-01-01" },
      ]);
      mockDeleteUser.mockResolvedValue({ message: "削除しました" });

      render(<UsersPage />);

      await waitFor(() => {
        expect(screen.getByText("テストユーザー")).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText("削除"));

      await waitFor(() => {
        expect(mockDeleteUser).toHaveBeenCalledWith("1");
      });
    });
  });
});