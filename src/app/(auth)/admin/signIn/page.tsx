"use client";

import {
  ErrorMessage,
} from "@/src/components/layouts/auth";
import useAdminRedirectIfAuthenticated from "@/src/customHooks/useAdminAuthenticated";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { signIn, signOut, getSession } from "next-auth/react";
import { z } from "zod";
import { useState } from "react";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type SignInSchema = z.infer<typeof signInSchema>;

export default function AdminSignIn() {
  const [showPassword, setShowPassword] = useState(false);

  useAdminRedirectIfAuthenticated('/admin/dashboard')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: SignInSchema) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl: "/admin/dashboard",
      }) as { error?: string; ok?: boolean; url?: string | null };

      if (result?.error) {
        toast.error(result.error || "Login failed", { position: "bottom-center" });
        return;
      }

      if (!result?.ok) {
        toast.error("Login failed. Please try again.", { position: "bottom-center" });
        return;
      }

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
        // Use centralized logout to clear all cookies and session
        await fetch("/api/auth/logout", { method: "POST" });
        await signOut({ redirect: false });
        
        toast.error("You don't have admin privileges. Access denied.", {
          position: "bottom-center",
        });
        return;
      }

      toast.success("Login successful", { position: "top-center" });
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = "/admin/dashboard";
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong during login";
      toast.error(errorMessage, { position: "bottom-center" });
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gray-100 font-['Inter'] animate-fadeIn">
      <div className="w-full max-w-[1000px] flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden mx-4 my-8 min-h-[600px]">
        {/* Left Branding Side - Matches Admin Dashboard Sidebar */}
        <div className="w-full md:w-5/12 bg-gray-900 p-8 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <i className="fas fa-code text-white text-lg"></i>
              </div>
              <span className="font-bold text-xl tracking-tight">DevHuddle</span>
              <span className="text-[10px] bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded font-semibold uppercase tracking-wider border border-indigo-500/30">
                Admin
              </span>
            </div>
            
            <h1 className="text-3xl font-extrabold mb-4 leading-tight">
              Manage Your <br />
              <span className="text-indigo-400">Developer Ecosystem</span>
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-[280px]">
              Access the administrative console to oversee users, moderate content, and monitor system performance.
            </p>
          </div>

          <div className="relative z-10 mt-auto pt-12">
            <div className="flex items-center gap-4 text-xs text-gray-500 font-medium tracking-wide">
              <span>SECURE ACCESS</span>
              <div className="h-px flex-1 bg-gray-800"></div>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-[400px] mx-auto w-full">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-500 text-sm">Please enter your credentials to access the admin portal.</p>
            </div>

            <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <input
                    {...register("email")}
                    id="email"
                    type="email"
                    autoFocus
                    placeholder="admin@devhuddle.com"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 placeholder:text-gray-400`}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5"><i className="fas fa-exclamation-circle"></i> {errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <i className="fas fa-lock"></i>
                  </div>
                  <input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-3 bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 placeholder:text-gray-400`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1.5"><i className="fas fa-exclamation-circle"></i> {errors.password.message}</p>}
              </div>

              <div className="pt-2">
                <button
                  id="login-button"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg shadow-gray-900/10 hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <i className="fas fa-arrow-right text-xs"></i>
                    </>
                  )}
                </button>
              </div>

              <ErrorMessage
                id="credentials-error"
                message="Authentication failed. Please check your admin credentials."
                show={false} // Hidden by default, toast handles it mostly but kept for structure
              />
            </form>

            <div className="mt-12 text-center">
              <p className="text-xs text-gray-400">
                Unauthorized access is strictly prohibited. <br />
                System events and login attempts are logged.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

