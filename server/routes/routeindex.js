import express from "express";
import accountroutes from "./accountroutes.js";
import authroutes from "./authroutes.js";
import transactionroutes from "./transactionroutes.js";
import userroutes from "./userroutes.js";
const router =express.Router();

router.use("/auth", authroutes);
router.use("/user", userroutes);
router.use("/account", accountroutes);
router.use("/transactions", transactionroutes);

export default router;