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
import api, { setAuthToken } from "../../libs/api.jsx";
import useStore from "../../store";

const LoginSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid email address"),
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

const SignIn = () => {
  const setCredentials = useStore((state) => state.setCredentials);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data) => {
  console.log("Form submitted with data:", data);
  try {
    setLoading(true);
    const { data: res } = await api.post("/auth/sign-in", data);

    if (res?.user) {
      toast.success(res?.message || "Sign-in successful");

      const userInfo = { ...res.user, token: res.token };
      localStorage.setItem("user", JSON.stringify(userInfo));

      // ✅ Add the log here
      console.log("User info stored in localStorage:", localStorage.getItem("user"));

      setCredentials(userInfo);
      setAuthToken(userInfo.token);
      console.log("Stored token:", userInfo.token);
      console.log("Axios header now:", api.defaults.headers.common["Authorization"]);

      setTimeout(() => navigate("/overview"), 1000);
    }
  } catch (error) {
    console.error("Sign-in failed:", error);
    toast.error(error?.response?.data?.message || "Sign-in failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex items-center justify-center w-full min-h-screen py-10">
      <Card className="w-[400px] bg-white dark:bg-black/20 shadow-md overflow-hidden">
        <div className="p-6 md:p-8">
          <CardHeader className="py-0">
            <CardTitle className="mb-8 text-center dark:text-white">Sign In</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="mb-8 space-y-6">
                <SocialAuth isLoading={loading} setIsLoading={setLoading} />
                <Input
                  disabled={loading}
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="your@gmail.com"
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
                {loading ? <BiLoader className="text-2xl text-white animate-spin" /> : "Sign In"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center gap-2">
            <p className="text-sm text-gray-600">Don't have an account?</p>
            <Link to="/sign-up" className="text-sm font-semibold text-violet-600 hover:underline">
              Sign Up
            </Link>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
};

export default SignIn;
