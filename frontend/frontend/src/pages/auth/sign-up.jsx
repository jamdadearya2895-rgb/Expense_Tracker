import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BiLoader } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "../../components/ui/button.jsx";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import Input from "../../components/ui/input.jsx";
import SocialAuth from "../../components/ui/socialauth.jsx";
import api from "../../libs/api.jsx";
import useStore from "../../store/index.js";

const RegisterSchema = z.object({
  firstName: z.string({ required_error: "Name is required" }).min(3, "Name is required"),
  email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
  password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
});

const SignUp = () => {
  const user = useStore((state) => state.user);
  const setCredentials = useStore((state) => state.setCredentials);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(RegisterSchema),
  });

  // useEffect(() => {
  //   if (user) navigate("/overview");
  // }, [user]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const { data: res } = await api.post("/auth/sign-up", data);

      if (res?.user) {
        toast.success(res?.message || "Account created successfully");

        const userInfo = { ...res.user, token: res.token };
        localStorage.setItem("user", JSON.stringify(userInfo));
        setCredentials(userInfo);

        setTimeout(() => navigate("/overview"), 1000);
      }
    } catch (error) {
      console.error("Sign-up failed:", error);
      toast.error(error?.response?.data?.message || "Sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen py-10">
      <Card className="w-[400px] bg-white dark:bg-black/20 shadow-md overflow-hidden">
        <div className="p-6 md:p-8">
          <CardHeader className="py-0">
            <CardTitle className="mb-8 text-center dark:text-white">Create Account</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="mb-8 space-y-6">
                <SocialAuth isLoading={loading} setIsLoading={setLoading} />

                <Input
                  disabled={loading}
                  id="firstName"
                  label="Name"
                  type="text"
                  placeholder="Your Name"
                  error={errors.firstName?.message}
                  {...register("firstName")}
                />

                <Input
                  disabled={loading}
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Input
                  disabled={loading}
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="Your password"
                  error={errors.password?.message}
                  {...register("password")}
                />
              </div>

              <Button type="submit" className="w-full bg-violet-800" disabled={loading}>
                {loading ? <BiLoader className="text-2xl text-white animate-spin" /> : "Create an account"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center gap-2">
            <p className="text-sm text-gray-600">Already have an account?</p>
            <Link to="/sign-in" className="text-sm font-semibold text-violet-600 hover:underline">
              Sign In
            </Link>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
};

export default SignUp;
