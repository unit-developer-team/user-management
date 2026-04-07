// controllers/userController.ts
import { Request, Response } from "express";
import { getAllUsers, getUserById, createUser, deleteUser } from "../services/dynamoService";
import { v4 as uuidv4 } from "uuid";

// ユーザー一覧取得
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    console.error("ユーザー一覧取得エラー", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ユーザー詳細取得
export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);

    if (!user) {
      res.status(404).json({ message: "ユーザーが見つかりません" });
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("ユーザー詳細取得エラー", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ユーザー登録
export const createUserHandler = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      res.status(400).json({ message: "name と email は必須です" });
      return;
    }

    const user = {
      id: uuidv4(),
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    await createUser(user);
    res.status(201).json(user);
  } catch (err: any) {
    // 同じIDが既に存在する場合
    if (err.name === "ConditionalCheckFailedException") {
      res.status(409).json({ message: "既に存在するユーザーです" });
      return;
    }
    console.error("ユーザー登録エラー", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ユーザー削除
export const deleteUserHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteUser(id);
    res.status(200).json({ message: "削除しました" });
  } catch (err) {
    console.error("ユーザー削除エラー", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};