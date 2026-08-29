import { pool } from "../libs/database.js";
import { getMonthName } from "../libs/index.js";
export const addTransaction = async (req, res) => {
    try {
        const { userId } = req.user;
        const { account_id } = req.params;
        const { description, source, amount } = req.body;
        if (!description || !source || !amount) {
            return res
                .status(403)
                .json({ status: "failed", message: "Provide Required Fields!" });
        }
        if (Number(amount) < 0) {
            return res
                .status(403)
                .json({ status: "failed", message: "Amount should be grater than 0." });
        }
        const result = await pool.query({
            text: "SELECT * FROM tblaccount WHERE id=$1",
            values: [account_id],
        });
        const accountInfo = result.rows[0];
        if (!accountInfo) {
            return res
                .status(404)
                .json({ status: "failed", message: "Invalid account information." });
        }
        if (accountInfo.account_balance <= 0 || accountInfo.account_balance < Number(amount)) {
            return res.status(403).json({
                status: "failed",
                message: "Transaction failed. Insufficient account balance.",
            });
        }

        try {
            await pool.query("BEGIN");
            await pool.query({
                text: "UPDATE tblaccount SET account_balance=account_balance-$1,updatedat=CURRENT_TIMESTAMP WHERE id=$2",
                values: [amount, account_id],
            });
            await pool.query({
                text: "INSERT INTO tbltransaction(user_id,account_id,description,type,status,amount,source) VALUES ($1,$2,$3,$4,$5,$6)",
                values: [userId, account_id,description, "expense", "Completed", amount, source],
            });
            await pool.query("COMMIT");
        }
        catch (err) {
            await pool.query("ROLLBACK"); // undo everything
            throw err; // or send error response
        }
        res.status(200).json({
            status: "success",
            message: "Transaction completed successfully.",
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ status: "failed", message: error.message });
    }
}

export const getDashboardInformation = async (req, res) => {
    try {
        const { userId } = req.user;
        let totalIncome = 0;
        let totalExpense = 0;
        const transaction = await pool.query({
            text: "SELECT type,SUM(amount) AS totalamount FROM tbltransaction WHERE user_id=$1 GROUP BY type",
            values: [userId]
        });
        transaction.rows.forEach((transaction) => {
            if (transaction.type === "income") totalIncome += Number(transaction.totalamount);
            else totalExpense += Number(transaction.totalamount);

        });
        const availableBalance = totalIncome - totalExpense;
        const year = new Date().getFullYear();
        const start_Date = new Date(year, 0, 1);
        const end_Date = new Date(year, 11, 31, 23, 59, 59);
        const monthlyResult = await pool.query({
            text: "SELECT EXTRACT(MONTH FROM createdat) AS MONTH,type,SUM(amount) AS totalamount FROM tbltransaction WHERE user_id=$1 AND  createdat BETWEEN $2 AND $3 GROUP BY EXTRACT(MONTH FROM createdat),type",
            values: [userId, start_Date, end_Date],
        });
        ///Dashboard representing monthly income vs expense 
        const chartData = new Array(12).fill().map((_, i) => {
            const monthData = monthlyResult.rows.filter(r => parseInt(r.month) === i + 1);
            return {
                label: getMonthName(i),
                income: monthData.find(r => r.type === "income")?.totalamount || 0,
                expense: monthData.find(r => r.type === "expense")?.totalamount || 0,
            }
        });
        ///fetch last transaction 
        const lastTransactionResult = await pool.query({
            text: "SELECT * FROM tbltransaction WHERE user_id =$1 ORDER BY id DESC LIMIT 5",
            values: [userId]
        });
        const lastTransaction = lastTransactionResult.rows;
        ///fetch last accounts
        const lastAccountResult = await pool.query({
            text: "SELECT * FROM tblaccount WHERE user_id =$1 ORDER BY id DESC LIMIT 5",
            values: [userId]
        });
        const lastAccount = lastAccountResult.rows;
        res.status(200).json({
            status: "success",
            availableBalance,
            totalIncome, totalExpense,
            chartData: chartData,
            lastTransaction,
            lastAccount,
        });

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ status: "failed", message: error.message });
    }
};


export const getTransactions = async (req, res) => {
    try {
        const today = new Date();
        const _sevenDaysAgo = new Date(today);
        _sevenDaysAgo.setDate(today.getDate() - 7);
        const sevenDaysAgo = _sevenDaysAgo.toISOString().split("T")[0];
        const { df, dt, s } = req.query;
        const { userId } = req.user;
        const startDate = new Date(df || sevenDaysAgo);
        const endDate = new Date(dt || new Date());
        const transaction = await pool.query({
            text: "SELECT * FROM tbltransaction WHERE user_id=$1  AND createdat BETWEEN $2 AND $3 AND (description ILIKE '%' || $4 || '%' OR status ILIKE '%' || $4 || '%' OR source ILIKE '%' || $4 || '%') ORDER BY id DESC",
            values: [userId, startDate, endDate, s],
        });
        res.status(200).json({
            status: "success",
            data: transaction.rows,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ status: "failed", message: error.message });
    }
};


export const transferMoneyToAccount = async (req, res) => {
    try {
        const { userId } = req.user;
        const { from_account, to_account, amount } = req.body;
        if (!(from_account || to_account || amount)) {
            return res.status(403).json({
                status: "failed",
                message: "Provide Required Fields!",
            });
        }
        const newAmount = Number(amount);
        if (newAmount <= 0)
            return res.status(403).json({
                status: "failed",
                message: "Amount should be grater than 0.",
            });
        ///chech account detail and balance for from account
        const fromAccountResult = await pool.query({
            text: "SELECT * FROM tblaccount WHERE id=$1",
            values: [from_account],
        });
        const fromAccount = fromAccountResult.rows[0];
        if (!from_account || !to_account || !amount) {
            return res.status(400).json({
                status: "failed",
                message: "from_account, to_account, and amount are required!",
            });
        }
        if (from_account === to_account) {
            return res.status(400).json({
                status: "failed",
                message: "Cannot transfer to the same account",
            });
        }
        if (newAmount > fromAccount.account_balance) {
            return res.status(403).json({
                status: "failed",
                message: "Transfer failed. Insufficient account balance.",
            });
        }
        const toAccountResult = await pool.query({
            text: "SELECT * FROM tblaccount WHERE id=$1",
            values: [to_account],
        });
        const toAccount = toAccountResult.rows[0];
        if (!toAccount) {
            return res.status(404).json({
                status: "failed",
                message: "Destination account information not found.",
            });
        }
        //Begin Transaction
        try {
            await pool.query("BEGIN");
            //tranfer from account 
            await pool.query({
                text: "UPDATE tblaccount SET account_balance=account_balance-$1,updatedat=CURRENT_TIMESTAMP WHERE id=$2",
                values: [amount, from_account],
            });
            //transfer to account 
            await pool.query({
                text: "UPDATE tblaccount SET account_balance=account_balance+$1,updatedat=CURRENT_TIMESTAMP WHERE id=$2",
                values: [amount, to_account],
            });
            //Insert transaction records 
            const description = `Transfer (${fromAccount.account_name}-(${toAccount.account_name}))`;
            await pool.query({
                text: "INSERT INTO tbltransaction(user_id,account_id,description,type,status,amount,source) VALUES($1, $2, $3, $4, $5, $6,$7)",
                values: [userId,fromAccount.id, description, "expense", "Completed", amount, fromAccount.account_name],
            });
            const description1 = `Received (${fromAccount.account_name}-(${toAccount.account_name}))`;
            await pool.query({
                text: `INSERT INTO tbltransaction(user_id,account_id, description, type, status, amount, source) VALUES($1, $2, $3, $4, $5, $6,$7)`,
                values: [userId,toAccount.id, description1, "income", "Completed", amount, toAccount.account_name],
            });
            await pool.query("COMMIT");
            res.status(201).json({
                status: "success",
                message: "Transfer completed successfully",
            });
        }
        catch (err) {
            await pool.query("ROLLBACK"); // undo everything
            throw err; // or send error response
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ status: "failed", message: error.message });
    }
}