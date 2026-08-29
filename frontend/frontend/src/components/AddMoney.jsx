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

const FormSchema = z.object({
    amount: z.string().refine((val) => parseFloat(val) > 0, {
        message: "Amount must be greater than zero.",
    }),
});

const AddMoney = ({ isOpen, setIsOpen, refetch, account }) => {
    const [isLoading, setIsLoading] = useState(false);
    const {
        watch,
        handleSubmit,
        register,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(FormSchema),
    });

    const amount = watch("amount", 0);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const payload = { amount: parseFloat(data.amount) };
            const res = await api.put(`/account/add-money/${account?.id}`, payload);
            if (res.data.status === "success") {
                toast.success(res.data.message || "Funds added successfully.");
                refetch();
                setIsOpen(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DialogWrapper isOpen={isOpen} closeModal={() => setIsOpen(false)}>
            <div className='w-full max-w-md bg-white dark:bg-slate-800 p-6 rounded-lg'>
                <h3 className='text-xl font-bold mb-4 text-black dark:text-white'>
                    Add Money to {account?.account_name}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    <Input
                        {...register("amount")}
                        label='Amount'
                        type='number'
                        placeholder='0.00'
                        error={errors.amount?.message}
                    />
                    <Button type='submit' className='w-full' disabled={isLoading}>
                        {isLoading ? (
                            <BiLoaderAlt className='animate-spin' />
                        ) : `Submit ${formatCurrency(amount || 0)}`}
                    </Button>
                </form>
            </div>
        </DialogWrapper>
    );
};

export default AddMoney;