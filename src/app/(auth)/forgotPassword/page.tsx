"use client";

import { InputField, PrimaryButton } from "@/src/components/layouts/auth";
import { passwordResetRequest } from "@/src/services/api/auth.service";
import { AppDispatch } from "@/src/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { z } from "zod";

const forgotScehma = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type ForgotSchema = z.infer<typeof forgotScehma>;

export default function ForgotPassword() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ForgotSchema>({
    resolver: zodResolver(forgotScehma),
    mode: "onChange",
  });

  const onSubmit = async (data: ForgotSchema) => {
    try {
      await passwordResetRequest(data)
      toast.success("Reset mail send you your mail", {
        position: "bottom-center",
      });
    } catch (error: any) {
      const errorMessage =
      error.response?.data?.message || error || "Something went wrong during password reset";
      toast.error(errorMessage, { position: "bottom-center" });
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-[90%] sm:max-w-[450px] p-6 sm:p-8 animate-fadeIn">
        <h1 className="text-center text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">
          Forgot Password?
        </h1>
        <p className="text-center text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
          Enter your email address and we'll send you a link to reset your
          password
        </p>

        <form id="forgot-password-form" onSubmit={handleSubmit(onSubmit)}>
          <InputField
            label="Email"
            id="email"
            type="email"
            autoFocus
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <PrimaryButton
            disabled={isSubmitting}
            id="reset-button"
            type="submit"
            label={!isSubmitting ? "Send Reset Link" : "sending ..."}
          />

          <div className="text-center mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-gray-600">
              Remember your password?{" "}
              <Link
              href="/signup"
              className="text-xs sm:text-sm text-primary hover:text-primary-hover hover:underline transition-colors"
            >
              {" "}
              signup
            </Link>
            </p>
          </div>

          <div className="text-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-900 font-medium hover:text-primary transition-colors"
            >
              <i className="fas fa-headset"></i>
              <span className="hidden sm:inline">Need help? Contact Support</span>
              <span className="sm:hidden">Contact Support</span>
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
