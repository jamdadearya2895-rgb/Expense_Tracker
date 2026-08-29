import express from "express";
import { authMiddleware } from "../../middleware/authmiddleware.js"; // ✅ fixed import
import { changePassword, getUser, updateUser } from "../controller/usercontroller.js";

const router = express.Router();

router.get("/", authMiddleware, getUser);
router.put("/change-password", authMiddleware, changePassword);
router.put("/:id", authMiddleware, updateUser);

export default router;
