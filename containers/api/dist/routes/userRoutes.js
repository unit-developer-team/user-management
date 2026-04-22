"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/userRoutes.ts
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
// 内部トークン検証ミドルウェア
const verifyInternalToken = (req, res, next) => {
    const token = req.headers["x-internal-token"];
    if (token !== process.env.INTERNAL_TOKEN) {
        res.status(403).json({ message: "Forbidden" });
        return;
    }
    next();
};
router.get("/users", verifyInternalToken, userController_1.getUsers);
router.get("/users/:id", verifyInternalToken, userController_1.getUser);
router.post("/users", verifyInternalToken, userController_1.createUserHandler);
router.delete("/users/:id", verifyInternalToken, userController_1.deleteUserHandler);
exports.default = router;
