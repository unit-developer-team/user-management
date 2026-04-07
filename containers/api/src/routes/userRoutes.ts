// routes/userRoutes.ts
import { Router } from "express";
import { getUsers, getUser } from "../controllers/userController";

const router = Router();

// 内部トークン検証ミドルウェア
const verifyInternalToken = (req: any, res: any, next: any) => {
  const token = req.headers["x-internal-token"];
  if (token !== process.env.INTERNAL_TOKEN) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  next();
};

router.get("/users", verifyInternalToken, getUsers);
router.get("/users/:id", verifyInternalToken, getUser);

export default router;