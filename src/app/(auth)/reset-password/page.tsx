"use client";

import { InputField, PrimaryButton } from "@/src/components/layouts/auth";
import { resetPassword } from "@/src/store/actions/authActions";
import { AppDispatch } from "@/src/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { z } from "zod";

const resetSchema = z
  .object({
    newpassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmpassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.newpassword === data.confirmpassword, {
    message: "Passwords do not match",
    path: ["confirmpassword"],
  });

type ResetSchema = z.infer<typeof resetSchema>;

export default function ForgotPassword() {

  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams()
  const token = searchParams.get('token') as string

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetSchema>({
    resolver: zodResolver(resetSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ResetSchema) => {
    try {
        console.log('........... this is the pssword and token ',token,data.confirmpassword )
      await dispatch(resetPassword({newPassword:data.newpassword,token})).unwrap()
      toast.success("password reset successfully", {
        position: "bottom-center",
      });
    } catch (error: any) {
      const errorMessage =
        error?.message || error || "Something went wrong during password reset";
      toast.error(errorMessage, { position: "bottom-center" });
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-[90%] sm:max-w-[450px] p-6 sm:p-8 animate-fadeIn">
        <h1 className="text-center text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">
          Reset Password
        </h1>

        <form id="forgot-password-form" onSubmit={handleSubmit(onSubmit)}>
          <InputField
            label="New Password"
            id="new-password"
            type="text"
            autoFocus
            placeholder="......"
            // showToggleIcon
            error={errors.newpassword?.message}
            {...register("newpassword")}
          />

          <InputField
            label="Confirm Password"
            id="confirm-password"
            type="text"
            placeholder="......"
            error={errors.confirmpassword?.message}
            {...register("confirmpassword")}
          />

          <PrimaryButton
            disabled={isSubmitting}
            id="reset-button"
            type="submit"
            label={!isSubmitting ? "Change password" : "Changing ..."}
          />

          <div className="text-center mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-gray-600">
              Return to login {" "}
              <Link
                href="/signIn"
                className="text-xs sm:text-sm text-primary hover:text-primary-hover hover:underline transition-colors"
              >
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
