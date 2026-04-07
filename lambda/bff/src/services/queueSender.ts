// services/queueSender.ts  ← 更新系のSQS送信ロジック

export const enqueue = async (action: string, payload: unknown) => {
  const messageId = crypto.randomUUID();

  await sqs.sendMessage({
    QueueUrl: process.env.QUEUE_URL,
    MessageBody: JSON.stringify({
      messageId,
      action,
      payload,
      timestamp: new Date().toISOString(),
    }),
  }).promise();

  // クライアントには jobId だけ返す（非同期を意識させない）
  return {
    statusCode: 202,
    body: JSON.stringify({ jobId: messageId }),
  };
};