// controllers/userController.ts
import { Request, Response } from "express";
import { getAllUsers, getUserById, createUser, deleteUser } from "../services/dynamoService";
import { logError, logInfo } from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

// ユーザー一覧取得
export const getUsers = async (req: Request, res: Response) => {
  try {
    logInfo("ユーザー一覧取得 開始", req);
    const users = await getAllUsers();

    users.forEach(user => {
    user.name = `${user.name}`;
    });

    logInfo("ユーザー一覧取得 完了", req, { count: users.length });
    res.status(200).json(users);
  } catch (err) {
    logError("ユーザー一覧取得エラー", err, req);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ユーザー詳細取得
export const getUser = async (req: Request, res: Response) => {
  try {
   const { id } = req.params as { id: string };
    logInfo("ユーザー詳細取得 開始", req, { userId: id });
    const user = await getUserById(id);

    if (!user) {
      logInfo("ユーザー詳細取得 対象なし", req, { userId: id });
      res.status(404).json({ message: "ユーザーが見つかりません" });
      return;
    }

    logInfo("ユーザー詳細取得 完了", req, { userId: id });
    res.status(200).json(user);
  } catch (err) {
    logError("ユーザー詳細取得エラー", err, req, { userId: req.params.id });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ユーザー登録
export const createUserHandler = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      logInfo("ユーザー登録 バリデーションエラー", req);
      res.status(400).json({ message: "name と email は必須です" });
      return;
    }

    const user = {
      id: uuidv4(),
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    logInfo("ユーザー登録 開始", req, { userId: user.id });
    await createUser(user);
    logInfo("ユーザー登録 完了", req, { userId: user.id });
    res.status(201).json(user);
  } catch (err: any) {
    // 同じIDが既に存在する場合
    if (err.name === "ConditionalCheckFailedException") {
      res.status(409).json({ message: "既に存在するユーザーです" });
      return;
    }
    logError("ユーザー登録エラー", err, req);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ユーザー削除
export const deleteUserHandler = async (req: Request, res: Response) => {
  try {
   const { id } = req.params as { id: string };
    logInfo("ユーザー削除 開始", req, { userId: id });
    await deleteUser(id);
    logInfo("ユーザー削除 完了", req, { userId: id });
    res.status(200).json({ message: "削除しました" });
  } catch (err) {
    logError("ユーザー削除エラー", err, req, { userId: req.params.id });
    res.status(500).json({ message: "Internal Server Error" });
  }
};