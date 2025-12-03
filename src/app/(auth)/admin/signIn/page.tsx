"use client";

import {
  ErrorMessage,
  InputField,
  PrimaryButton,
} from "@/src/components/layouts/auth";
import useAdminRedirectIfAuthenticated from "@/src/customHooks/useAdminAuthenticated";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { signIn, signOut, getSession } from "next-auth/react";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type SignInSchema = z.infer<typeof signInSchema>;

export default function AdminSignIn() {
  const router = useRouter();

  useAdminRedirectIfAuthenticated('/admin/dashboard')

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
      // Use NextAuth signIn for admin authentication
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl: "/admin/dashboard",
      }) as { error?: string; ok?: boolean; url?: string | null };

      if (result?.error) {
        // Error message from NextAuth authorize callback
        toast.error(result.error || "Login failed", { position: "bottom-center" });
        return;
      }

      if (!result?.ok) {
        toast.error("Login failed. Please try again.", { position: "bottom-center" });
        return;
      }

      // ✅ FIXED: Properly wait for session to be available
      // Poll for session with timeout instead of arbitrary setTimeout
      let session = null;
      const maxAttempts = 10;
      const pollInterval = 100;
      
      for (let i = 0; i < maxAttempts; i++) {
        session = await getSession();
        if (session?.user?.accessToken) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }

      if (!session?.user) {
        toast.error("Session not available. Please try again.", {
          position: "bottom-center",
        });
        return;
      }

      if (session.user.role !== "superAdmin") {
        // User doesn't have admin privileges, sign them out
        await signOut({ redirect: false });
        toast.error("You don't have admin privileges. Access denied.", {
          position: "bottom-center",
        });
        return;
      }

      // ✅ FIXED: Clear React Query cache before redirect to prevent stale data
      // Use window.location for hard reload to ensure fresh SSR state
      toast.success("Login successful", { position: "top-center" });
      
      // Small delay to ensure toast is visible, then redirect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use hard reload to ensure session is available on page load
      window.location.href = "/admin/dashboard";
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
            disabled={isSubmitting}
            label={isSubmitting ? "Logging in..." : "Log In"}
          />
        </form>
      </div>
    </main>
  );
}
