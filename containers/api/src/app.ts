import "./tracing";

import express from "express";
import userRoutes from "./routes/userRoutes";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use("/", userRoutes);

// ヘルスチェック（ALBが死活監視に使う）
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
