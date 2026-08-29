import express from "express";
import { authMiddleware } from "../../middleware/authmiddleware.js";
import { addMoneyToAccount, createAccount, getAccount, getAllAccounts } from "../controller/accountcontroller.js";
const router = express.Router();
router.get("/",authMiddleware,getAllAccounts);
router.get("/:id",authMiddleware,getAccount);
router.post("/create",authMiddleware,createAccount);
router.put("/add-money/:id",authMiddleware,addMoneyToAccount);


export default router; // default export required