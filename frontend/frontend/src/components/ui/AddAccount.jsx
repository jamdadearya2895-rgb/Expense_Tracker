import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BiErrorCircle, BiLoaderAlt } from "react-icons/bi";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";
import api, { setAuthToken } from "../../libs/api.jsx";
import useStore from "../../store/index.js";
import { Button } from "./button.jsx";
import Input from "./input.jsx";
import DialogWrapper from "./wrapper/dialogue-wrapper.jsx";

const accountTypes = ["Cash", "Crypto", "PayPal", "Debit Card"];

const FormSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)), {
    message: "Initial balance must be a number.",
  }),
  accountNumber: z.string().optional(),
});

const AddAccount = ({ isOpen, setIsOpen, refetch }) => {
  const { user } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState("");

  const form = useForm({
    resolver: zodResolver(FormSchema),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  // Generate account number once
  useEffect(() => {
    const newAccountNumber = uuidv4().replace(/-/g, "").substring(0, 12);
    setValue("accountNumber", newAccountNumber);
  }, [setValue]);

  // Set auth token for API
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) {
      setAuthToken(user.token);
    }
  }, []);

  const userAccounts = Array.isArray(user?.accounts) ? user.accounts : [];

  const submitHandler = async (data) => {
    // 🔹 Guard: ensure an account type is selected
    if (!selected || !selected.trim()) {
      toast.error("Please select a valid account type.");
      return;
    }

    // 🔹 Guard: check if account already exists
    if (userAccounts.includes(selected)) {
      toast.error("This account already exists.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        account_name: selected,
        account_balance: parseFloat(data.amount),
        account_number: data.accountNumber,
      };

      console.log("Payload being sent:", payload);

      const res = await api.post("/account/create", payload);

      if (res.data.status === "success") {
        toast.success(res.data.message);
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

  const closeModal = () => setIsOpen(false);

  return (
    <DialogWrapper isOpen={isOpen} closeModal={closeModal}>
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">
          Add New Account
        </h3>
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Select Account</label>
            <select
              onChange={(e) => setSelected(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-slate-900"
              value={selected}
            >
              <option value="">-- Select Account Type --</option>
              {accountTypes.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
          </div>

          {userAccounts.includes(selected) && selected && (
            <div className="flex items-center gap-2 text-red-600">
              <BiErrorCircle />
              <p>This account already exists.</p>
            </div>
          )}

          {!userAccounts.includes(selected) && selected && (
            <>
              <Input
                {...register("accountNumber")}
                label="Account Number"
                error={errors.accountNumber?.message}
              />
              <Input
                {...register("amount")}
                label="Initial Balance"
                type="number"
                placeholder="0.00"
                error={errors.amount?.message}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading || !selected || userAccounts.includes(selected)}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <BiLoaderAlt className="animate-spin" /> Creating...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </DialogWrapper>
  );
};

export default AddAccount;
