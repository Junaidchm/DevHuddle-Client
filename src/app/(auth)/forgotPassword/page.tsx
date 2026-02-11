"use client";

import { passwordResetRequest } from "@/src/services/api/auth.service";
import { AppDispatch } from "@/src/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { z } from "zod";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";

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
    formState: { errors, isSubmitting },
  } = useForm<ForgotSchema>({
    resolver: zodResolver(forgotScehma),
    mode: "onChange",
  });

  const onSubmit = async (data: ForgotSchema) => {
    try {
      await passwordResetRequest(data)
      toast.success("Reset mail sent to your email", {
        position: "bottom-center",
      });
    } catch (error: any) {
      const errorMessage =
      error.response?.data?.message || error || "Something went wrong during password reset";
      toast.error(errorMessage, { position: "bottom-center" });
    }
  };

  return (
    <Card className="w-full max-w-[400px] shadow-lg animate-fadeIn border-0 sm:border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
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

          <Button 
            className="w-full" 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-center">
        <div className="text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/signIn"
            className="text-primary hover:text-primary-hover font-medium hover:underline"
          >
            Log in
          </Link>
        </div>
        
        <div className="pt-2">
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <span className="hidden sm:inline">Need help? Contact Support</span>
              <span className="sm:hidden">Contact Support</span>
            </a>
        </div>
      </CardFooter>
    </Card>
  );
}
