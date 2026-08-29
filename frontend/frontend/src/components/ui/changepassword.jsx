import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BiLoaderAlt } from "react-icons/bi";
import { toast } from "sonner";
import * as z from "zod";
import api from "../../libs/api.jsx";
import { Button } from "./button.jsx";
import Input from "./input.jsx";

// Zod schema for validation
const PasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required."),
    newPassword: z.string().min(6, "New password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  });

const ChangePassword = () => {
  // Destructuring from react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Added reset for clearing the form
  } = useForm({
    resolver: zodResolver(PasswordSchema),
  });

  const [isLoading, setIsLoading] = useState(false);

  // The submit handler function as seen in your screenshot
  const submitPasswordHandler = async (data) => {
    setIsLoading(true);
    try {
      // Only send currentPassword and newPassword to backend
      const payload = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };

      const { data: res } = await api.put("/user/change-password", payload);

      if (res?.status === "success") {
        toast.success(res?.message);
        reset();
      }
    } catch (error) {
      console.error("Something went wrong:", error);
      toast.error(error?.response?.data?.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='mt-12 border-t border-gray-200 dark:border-gray-800 pt-8'>
      <p className='text-lg font-bold text-black dark:text-white mb-6'>
        Change Password
      </p>
      <form onSubmit={handleSubmit(submitPasswordHandler)} className='space-y-6'>
        <Input
          {...register("currentPassword")}
          label='Current Password'
          type='password'
          error={errors.currentPassword?.message}
        />
        <Input
          {...register("newPassword")}
          label='New Password'
          type='password'
          error={errors.newPassword?.message}
        />
        <Input
          {...register("confirmPassword")}
          label='Confirm New Password'
          type='password'
          error={errors.confirmPassword?.message}
        />
        <div className='flex justify-end'>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? (
              <span className='flex items-center gap-2'>
                <BiLoaderAlt className='animate-spin' /> Saving...
              </span>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;