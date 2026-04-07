// services/dynamoService.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { User } from "../models/user";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;
if (!TABLE_NAME) throw new Error("TABLE_NAME が設定されていません");

// ユーザー登録
export const createUser = async (user: User): Promise<void> => {
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: user,
    // 同じIDが既に存在する場合は上書きしない
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