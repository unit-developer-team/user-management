// src/api/userApi.ts
import { fetchAuthSession } from "aws-amplify/auth";

const API_URL = import.meta.env.VITE_API_URL;

// 共通ヘッダー取得
const getHeaders = async () => {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
};

// ユーザー一覧取得
export const getUsers = async () => {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/users`, { headers });
  if (!res.ok) throw new Error("ユーザー一覧の取得に失敗しました");
  return res.json();
};

// ユーザー詳細取得
export const getUser = async (id: string) => {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/users/${id}`, { headers });
  if (!res.ok) throw new Error("ユーザーの取得に失敗しました");
  return res.json();
};

// ユーザー登録
export const createUser = async (name: string, email: string) => {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, email }),
  });
  if (!res.ok) throw new Error("ユーザーの登録に失敗しました");
  return res.json();
};

// ユーザー削除
export const deleteUser = async (id: string) => {
  const headers = await getHeaders();
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("ユーザーの削除に失敗しました");
  return res.json();
};