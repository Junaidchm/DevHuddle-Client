"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FaEyeSlash } from "react-icons/fa";
import { z } from "zod";

import {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from "@/src/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/src/components/ui/input";
import { FaEye } from "react-icons/fa";
import { BsGithub } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/src/store/store";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { googleAuth, register } from "@/src/store/actions/authActions";
import { OAuthButton } from "@/src/components/layouts/auth";
import useRedirectIfAuthenticated from "@/src/customHooks/useRedirectIfAuthenticated";

const formSchema = z
  .object({
    name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name must be at most 50 characters")
      .regex(/^[a-zA-Z\s'-]+$/, {
        message:
          "Full name can only contain letters, spaces, apostrophes, and hyphens",
      })
      .regex(/^\S.*\S$/, {
        message: "Full name cannot start or end with whitespace",
      }),
    username: z
      .string()
      .min(2, "Username must be at least 2 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/, {
        message:
          "Username must be alphanumeric, may include underscores or hyphens, and cannot start or end with special characters",
      })
      .regex(/^\S*$/, {
        message: "Username cannot contain whitespace",
      }),
    email: z.string().email(),
    password: z
      .string()
      .min(7, "Password should be at least 7 characters")
      .refine((s) => /[a-zA-Z]/.test(s), {
        message: "Password must contain letters.",
      })
      .refine((s) => /\d/.test(s), {
        message: "Password must contain numbers.",
      })
      .refine((s) => /[!@#$%^&*(),.?":{}|<>]/.test(s), {
        message: "Password must contain special characters.",
      }),
    confirmPassword: z
      .string()
      .min(7, "Password should be at least 7 characters"),
    acceptTerms: z.boolean().refine((data) => data === true, {
      message: "You must accept terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SignUpForm() {

  useRedirectIfAuthenticated()

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const { loading } = useSelector((state: RootState) => state.user);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: true,
    },
    mode: "onTouched",
  });

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleGoogleAuth = async () => {
    try {
      await dispatch(googleAuth()).unwrap();
    } catch (err: any) {
      const errorMessage =
        err?.message || err?.error || "Google authentication failed.";
      toast.error(errorMessage, { position: "top-center" });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await dispatch(register(values)).unwrap();
      // Temporarily store password for auto-login after verification
      localStorage.setItem("signupPassword", values.password);
      localStorage.setItem("signupEmail", values.email);

      toast.success("Registration successful! Please verify your email.", {
        position: "bottom-center",
      });
      router.push("/verify-user");
    } catch (error: any) {
      console.log('the error is happening .................')
      // Handle error returned from createAsyncThunk rejectWithValue
      const errorMessage =
        error?.message || error || "Something went wrong during registration";
      toast.error(errorMessage, { position: "bottom-center" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="mb-3 sm:mb-4 relative">
              <FormLabel className="block font-medium mb-2 text-gray-900 text-sm sm:text-base">
                Full Name
              </FormLabel>
              <FormControl>
                <input
                  {...field}
                  required
                  placeholder="John Doe"
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-3xl font-sans text-sm sm:text-base transition-all focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                />
              </FormControl>
              <FormMessage className="text-xs sm:text-sm text-red-500 mt-2" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="mb-3 sm:mb-4 relative">
              <FormLabel
                htmlFor="username"
                className="block font-medium mb-2 text-gray-900 text-sm sm:text-base"
              >
                Username
              </FormLabel>
              <FormControl>
                <input
                  {...field}
                  id="username"
                  type="text"
                  placeholder="your_username"
                  required
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-3xl font-sans text-sm sm:text-base transition-all focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                />
              </FormControl>
              <FormMessage className="text-xs sm:text-sm text-red-500 mt-2" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="mb-3 sm:mb-4 relative">
              <FormLabel
                htmlFor="email"
                className="block font-medium mb-2 text-gray-900 text-sm sm:text-base"
              >
                Email
              </FormLabel>
              <FormControl>
                <input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-3xl font-sans text-sm sm:text-base transition-all focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                />
              </FormControl>
              <FormMessage className="text-xs sm:text-sm text-red-500 mt-2" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="mb-3 sm:mb-4 relative">
              <FormLabel
                htmlFor="password"
                className="block font-medium mb-2 text-gray-900 text-sm sm:text-base"
              >
                Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    required
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-3xl font-sans text-sm sm:text-base transition-all focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                  />
                  {!showPassword ? (
                    <FaEye
                      onClick={() => {
                        setShowPassword(true);
                      }}
                      className="absolute right-3 sm:right-4 top-7 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-900 transition-colors"
                    />
                  ) : (
                    <FaEyeSlash
                      onClick={() => {
                        setShowPassword(false);
                      }}
                      className="absolute right-3 sm:right-4 top-7 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-900 transition-colors"
                    />
                  )}
                </div>
              </FormControl>
              <FormMessage className="text-xs sm:text-sm text-red-500 mt-2" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="mb-3 sm:mb-4 relative">
              <FormLabel
                htmlFor="confirmPassword"
                className="block font-medium mb-2 text-gray-900 text-sm sm:text-base"
              >
                Confirm Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <input
                    {...field}
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="••••••••"
                    required
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-3xl font-sans text-sm sm:text-base transition-all focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                  />
                  {!showConfirmPassword ? (
                    <FaEye
                      onClick={() => {
                        setShowConfirmPassword(true);
                      }}
                      className="absolute right-3 sm:right-4 top-7 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-900 transition-colors"
                    />
                  ) : (
                    <FaEyeSlash
                      onClick={() => {
                        setShowConfirmPassword(false);
                      }}
                      className="absolute right-3 sm:right-4 top-7 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-900 transition-colors"
                    />
                  )}
                </div>
              </FormControl>
              <FormMessage className="text-xs sm:text-sm text-red-500 mt-2" />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-2 mb-4 sm:mb-6">
          <button
            type="submit"
            className="w-full py-3 sm:py-4 bg-primary text-white rounded-3xl font-semibold cursor-pointer transition-colors hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed mb-3 sm:mb-4"
            id="signup-button"
            disabled={form.formState.isSubmitting}
          >
            {!form.formState.isSubmitting ? "Create User" : "User creating ....."}
          </button>

          <OAuthButton
            disabled={loading}
            onClick={handleGoogleAuth}
            label="Continue with Google"
            icon={<FcGoogle />}
          />
        </div>

        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/signIn"
              className="text-primary font-medium hover:text-primary-hover hover:underline transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
}
