import { pool } from "../libs/database.js";


export const getAccount = async (req, res) => {
    try {
        const { userId } = req.user;
        const account = await pool.query({
            text: "SELECT * FROM tblaccount WHERE user_id =$1",
            values: [userId],
        });
        res.status(200).json({
            status: "success",
            data: account.rows,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ status: "failed", message: error.message });
    }
};
export const getAllAccounts = async (req, res) => {
    try {
        const { userId } = req.user;
        const accounts = await pool.query({
            text: "SELECT * FROM tblaccount WHERE user_id =$1",
            values: [userId],
        });
        res.status(200).json({
            status: "success",
            data: accounts.rows,
        });
    } catch (error) {
        console.log(error);
        console.log("ithe gandlay");
        res.status(500).json({ status: "failed", message: error.message });
    }
};

export const createAccount = async (req, res) => {
    try {
        const { userId } = req.user;
        const { account_name, account_balance, account_number } = req.body;

        // Check if account already exists
        const accountExisting = await pool.query({
            text: "SELECT * FROM tblaccount WHERE account_name=$1 AND user_id=$2",
            values: [account_name, userId],
        });

        if (accountExisting.rows.length > 0) {
            return res.status(409).json({ status: "failed", message: "Account already created." });
        }

        // Insert new account
        const newAccount = await pool.query({
            text: "INSERT INTO tblaccount (user_id, account_name, account_number, account_balance) VALUES($1, $2, $3, $4) RETURNING *",
            values: [userId, account_name, account_number, account_balance],
        });

        const account = newAccount.rows[0];
        // const userAccounts = [account_name];

        // // Update user's accounts array
        // await pool.query({
        //     text: "UPDATE tbluser SET accounts=array_cat(accounts,$1), updatedat=CURRENT_TIMESTAMP WHERE id=$2",
        //     values: [userAccounts, userId]
        // });

        // Insert initial deposit transaction
        const description = account.account_name + " Initial Deposit";
        await pool.query({
            text: "INSERT INTO tbltransaction(user_id,account_id,description,type,status,amount,source) VALUES ($1,$2,$3,$4,$5,$6)",
            values: [
                userId,
                account.id,
                description,
                "income",
                "Completed",
                account_balance,
                account.account_name,
            ],
        });

        res.status(201).json({
            status: "success",
            message: account.account_name + " Account created successfully",
            data: account,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "failed", message: error.message });
    }
};

export const addMoneyToAccount = async (req, res) => {
    try {
        const { userId } = req.user;
        const { id } = req.params;
        const { amount } = req.body;
        console.log("userId from JWT:", userId);
        console.log("account id from params:", id);
        console.log("amount from body:", amount);

        const newAmount = Number(amount);
        const result = await pool.query({
            text: "UPDATE tblaccount SET account_balance=(account_balance +$1),updatedat=CURRENT_TIMESTAMP WHERE id=$2 AND user_id=$3 RETURNING *",
            values: [newAmount, id, userId]
        });
        // console.log(result);
        const accountInfo = result.rows[0];
        if (!accountInfo) {
            return res.status(404).json({
                status: "failed",
                message: "Account not found or does not belong to this user",
            });
        }
        const description = accountInfo.account_name + " (Deposit)";
        const transQuery = await pool.query({
            text: `INSERT INTO tbltransaction(user_id,account_id, description, type, status, amount, source) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
            values: [
                userId,
                accountInfo.id,
                description,
                "income",
                "Completed",
                amount,
                accountInfo.account_name,
            ],
        });
        res.status(200).json({
            status: "success",
            message: "Operation completed successfully",
            data: accountInfo,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ status: "failed", message: error.message });
    }
};