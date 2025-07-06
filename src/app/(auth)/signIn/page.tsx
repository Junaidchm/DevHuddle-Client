"use client";

import {
  ErrorMessage,
  InputField,
  OAuthButton,
  PrimaryButton,
} from "@/src/components/layouts/auth";
import useRedirectIfAuthenticated from "@/src/customHooks/useRedirectIfAuthenticated";
import { googleAuth, loginUser } from "@/src/store/actions/authActions";
import { AppDispatch, RootState } from "@/src/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { BsGithub } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type SignInSchema = z.infer<typeof signInSchema>;

export default function SignIn() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user);
  const { loading, error, success } = useSelector(
    (state: RootState) => state.user
  );

  useRedirectIfAuthenticated();

  const handleGoogleAuth = async () => {
    try {
      await dispatch(googleAuth()).unwrap();
    } catch (err: any) {
      const errorMessage =
        err?.message || err?.error || "Google authentication failed.";
      toast.error(errorMessage, { position: "top-center" });
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: SignInSchema) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      toast.success("Login successful", { position: "bottom-center" });
      await new Promise((res, rej) => setTimeout(res, 2000));
      router.push("/");
    } catch (error: any) {
      const errorMessage =
        error?.message || error || "Something went wrong during login";
      toast.error(errorMessage, { position: "bottom-center" });
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-[90%] sm:max-w-[450px] p-6 sm:p-8 animate-fadeIn">
        <h1 className="text-center text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">
          Welcome back
        </h1>
        <p className="text-center text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
          Log in to your DevHuddle account
        </p>

        <form id="login-form" onSubmit={handleSubmit(onSubmit)}>
          <InputField
            label="Email"
            id="email"
            type="email"
            autoFocus
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <InputField
            label="Password"
            type="password"
            id="password"
            placeholder="••••••••"
            showToggleIcon
            error={errors.password?.message}
            {...register("password")}
          />

          <ErrorMessage
            id="credentials-error"
            message="Incorrect email or password. Please try again."
          />

          <PrimaryButton
            id="login-button"
            type="submit"
            disabled={isSubmitting || !isValid}
            label={isSubmitting ? "Logging in..." : "Log In"}
          />

          <div className="text-center mb-4 sm:mb-6">
            <Link
              href="/forgotPassword"
              className="text-xs sm:text-sm text-primary hover:text-primary-hover hover:underline transition-colors"
            >
              {" "}
              Forgot password?
            </Link>
          </div>
        </form>

        <div className="flex items-center my-4 sm:my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="px-4 text-xs sm:text-sm text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
          {/* <OAuthButton label="Continue with GitHub" icon={<BsGithub />} /> */}
          <OAuthButton
            disabled={loading}
            onClick={handleGoogleAuth}
            label="Continue with Google"
            icon={<FcGoogle />}
          />
        </div>

        <div className="text-center">
          <p className="text-xs sm:text-sm">
            Don't have an account?{" "}
            <Link
              href="signup"
              className="text-primary font-medium hover:text-primary-hover hover:underline transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
