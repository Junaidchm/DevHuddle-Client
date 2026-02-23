
"use client";

import { signIn } from "next-auth/react";
import useRedirectIfAuthenticated from "@/src/customHooks/useRedirectIfAuthenticated";
import { googleAuth } from "@/src/store/actions/authActions";
import { AppDispatch } from "@/src/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { z } from "zod";
import { useEffect, useState } from "react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { PasswordInput } from "@/src/components/ui/password-input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
// import { Separator } from "@/src/components/ui/separator"; // Need to create separator too maybe, or just use di

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
  const searchParams = useSearchParams();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useRedirectIfAuthenticated();

  // Check for blocked user error from query params
  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");
    
    if (error === "blocked" && message) {
      toast.error(decodeURIComponent(message), {
        duration: 6000,
        position: "top-center",
      });
      // Clean up URL
      router.replace("/signIn");
    }
  }, [searchParams, router]);

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      await dispatch(googleAuth()).unwrap();
    } catch (err: any) {
      const errorMessage =
        err?.message || err?.error || "Google authentication failed.";
      toast.error(errorMessage, { position: "top-center" });
    } finally {
      setIsGoogleLoading(false);
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

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "user_not_found":
        return "User not found. Please check your email or sign up.";
      case "invalid_credentials":
        return "Invalid email or password. Please try again.";
      case "user_blocked":
        return "Your account has been blocked. Please contact support.";
      case "google_account_only":
        return "This account uses Google login. Please click 'Continue with Google'.";
      case "email_not_verified":
        return "Please verify your email before logging in.";
      case "CredentialsSignin":
        return "Invalid email or password.";
      case "something_went_wrong":
      case "server_error":
        return "A server error occurred. Please try again later.";
      default:
        return "Login failed. Please check your credentials.";
    }
  };

  const onSubmit = async (data: SignInSchema) => {
    try {
      // Use NextAuth signIn
      const result = (await signIn("credentials", {
        redirect: false, 
        email: data.email,
        password: data.password,
      })) as { error?: string };

      if (result?.error) {
        toast.error(getErrorMessage(result.error), { position: "bottom-center" });
      } else {
        
        toast.success("Login successful", { position: "bottom-center" });
        // router.push("/"); // Redirect after successful login
        window.location.href = "/"
      
      }
    } catch (error: any) {
      toast.error("Something went wrong during login", { position: "bottom-center" });
    }
  };

  return (
    <Card className="w-full max-w-[400px] shadow-lg animate-fadeIn border-0 sm:border">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Log in to your DevHuddle account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoFocus
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgotPassword"
                className="text-xs text-primary hover:text-primary-hover hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button 
            className="w-full" 
            type="submit" 
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleAuth}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            "Connecting..."
          ) : (
            <>
              <FcGoogle className="mr-2 h-4 w-4" />
              Continue with Google
            </>
          )}
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center flex-col space-y-2">
        <div className="text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:text-primary-hover font-medium hover:underline"
          >
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
