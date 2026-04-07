// consumers/sqsConsumer.ts
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { createUser } from "../services/dynamoService";
import { deleteUser } from "../services/dynamoService";
import { User } from "../models/user";

const sqs = new SQSClient({});

const QUEUE_URL = process.env.QUEUE_URL;
if (!QUEUE_URL) throw new Error("QUEUE_URL が設定されていません");

// SQSからメッセージを取得して処理する
export const processMessages = async (): Promise<void> => {
  const res = await sqs.send(new ReceiveMessageCommand({
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,       // ロングポーリング
    VisibilityTimeout: 60,
  }));

  const messages = res.Messages ?? [];
  if (messages.length === 0) return;

  for (const message of messages) {
    try {
      const body = JSON.parse(message.Body ?? "");
      const { action, payload } = body;

      // actionで処理を振り分け
      switch (action) {
        case "CREATE_USER":
          await createUser(payload as User);
          break;
        case "DELETE_USER":
          await deleteUser(payload.id);
          break;
        default:
          console.warn("未知のaction:", action);
      }

      // 処理成功したらSQSからメッセージを削除
      await sqs.send(new DeleteMessageCommand({
        QueueUrl: QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle!,
      }));

      console.log("メッセージ処理完了:", body.messageId);

    } catch (err) {
      // エラー時はSQSから削除しない → 可視性タイムアウト後に再配信される
      console.error("メッセージ処理失敗:", err);
    }
  }
};