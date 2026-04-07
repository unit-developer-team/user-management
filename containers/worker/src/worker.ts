// worker.ts
import { processMessages } from "./consumers/sqsConsumer";

const POLLING_INTERVAL_MS = 1000; // 1秒

const run = async (): Promise<void> => {
  console.log("Worker起動しました");

  while (true) {
    try {
      await processMessages();
    } catch (err) {
      console.error("ポーリングエラー:", err);
      // エラーが出ても止まらずに継続する
    }

    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
  }
};

run();