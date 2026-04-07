// services/dynamoService.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { User } from "../models/user";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;
if (!TABLE_NAME) throw new Error("TABLE_NAME が設定されていません");

// ユーザー一覧取得
export const getAllUsers = async (): Promise<User[]> => {
  const res = await docClient.send(new ScanCommand({
    TableName: TABLE_NAME,
  }));

  return (res.Items ?? []) as User[];
};

// ユーザー詳細取得
export const getUserById = async (id: string): Promise<User | null> => {
  const res = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { id },
  }));

  return (res.Item as User) ?? null;
};

// ユーザー登録
export const createUser = async (user: User): Promise<void> => {
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: user,
    ConditionExpression: "attribute_not_exists(id)",
  }));
};

// ユーザー削除
export const deleteUser = async (id: string): Promise<void> => {
  await docClient.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { id },
  }));
};