import express from "express";
import { authMiddleware } from "../../middleware/authmiddleware.js";
import {
  addTransaction,
  getDashboardInformation,
  getTransactions,
  transferMoneyToAccount,
} from "../controller/transactioncontroller.js";

const router = express.Router();

router.get("/", authMiddleware, getTransactions);
router.get("/dashboard", authMiddleware, getDashboardInformation);
router.post("/add-transaction/:account_id", authMiddleware, addTransaction);
router.post("/transfer-money", authMiddleware, transferMoneyToAccount);

export default router;