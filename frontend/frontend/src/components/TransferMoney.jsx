import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BiLoaderAlt } from "react-icons/bi";
import { toast } from "sonner";
import * as z from "zod";
import { formatCurrency } from "../libs";
import api from "../libs/api";
import { Button } from "./ui/button";
import Input from "./ui/input";
import DialogWrapper from "./ui/wrapper/dialogue-wrapper.jsx";

// ✅ Zod schema with coercion so amount is always a number
const FormSchema = z.object({
    to: z.string().min(1, "Please select a destination account."),
    amount: z.coerce.number().positive("Amount must be greater than zero."),
});

const TransferMoney = ({ isOpen, setIsOpen, refetch, accounts, fromAccount }) => {
    const [isLoading, setIsLoading] = useState(false);

    const {
        watch,
        handleSubmit,
        register,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: { to: "", amount: 0 },
    });

    const amount = watch("amount", 0);

    const onSubmit = async (data) => {
        if (data.amount > (fromAccount?.account_balance ?? 0)) {
            toast.error("Insufficient funds for this transfer.");
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                from_account: fromAccount?.id,
                to_account: data.to,
                amount: data.amount,
            };

            const res = await api.post("/transactions/transfer-money", payload);

            if (res.data.status === "success") {
                toast.success(res.data.message || "Transfer completed successfully.");
                refetch?.();
                setIsOpen(false);
                reset();
            }
        } catch (error) {
            console.error("Transfer error:", error);
            toast.error(error.response?.data?.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    const destinationAccounts = accounts.filter((acc) => acc.id !== fromAccount?.id);

    return (
        <DialogWrapper isOpen={isOpen} closeModal={() => setIsOpen(false)}>
            <div className="w-full max-w-md bg-white dark:bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2 text-black dark:text-white">
                    Transfer from {fromAccount?.account_name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    Available Balance: {formatCurrency(fromAccount?.account_balance || 0)}
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Transfer To</label>
                        <select
                            {...register("to")}
                            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-slate-900"
                        >
                            <option value="">-- Select Destination --</option>
                            {destinationAccounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.account_name} ({formatCurrency(acc.account_balance)})
                                </option>
                            ))}
                        </select>
                        {errors.to && <p className="text-red-500 text-xs mt-1">{errors.to.message}</p>}
                    </div>

                    <Input
                        {...register("amount")}
                        label="Amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        error={errors.amount?.message}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <BiLoaderAlt className="animate-spin" /> Processing...
                            </span>
                        ) : (
                            `Transfer ${formatCurrency(amount || 0)}`
                        )}
                    </Button>
                </form>
            </div>
        </DialogWrapper>
    );
};

export default TransferMoney;
