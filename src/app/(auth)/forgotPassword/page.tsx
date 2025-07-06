"use client";

import { InputField, PrimaryButton } from "@/src/components/layouts/auth";
import { PsswordRestRequest } from "@/src/services/api/auth.service";
import { AppDispatch } from "@/src/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
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
    mode: "onTouched",
  });

  const onSubmit = async (data: ForgotSchema) => {
    try {
      await PsswordRestRequest(data)
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
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-[450px] p-8 animate-fadeIn">
        <h1 className="text-center text-2xl font-bold mb-3 text-gray-900">
          Forgot Password?
        </h1>
        <p className="text-center text-gray-600 mb-8">
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

          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <a
                href="login.html"
                className="text-primary font-medium hover:text-primary-hover hover:underline transition-colors"
              >
                Log in
              </a>
            </p>
          </div>

          <div className="text-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 text-gray-900 font-medium hover:text-primary transition-colors"
            >
              <i className="fas fa-headset"></i>
              <span>Need help? Contact Support</span>
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
