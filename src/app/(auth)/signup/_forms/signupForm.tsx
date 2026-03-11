"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/src/components/ui/input";
import { PasswordInput } from "@/src/components/ui/password-input";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator"; 
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/src/store/store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { register } from "@/src/store/actions/authActions";
import { signIn } from "next-auth/react";
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

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
    setIsGoogleLoading(true);
    try {
      await signIn("google");
    } catch (err: any) {
      const errorMessage =
        err?.message || err?.error || "Google authentication failed.";
      toast.error(errorMessage, { position: "top-center" });
    } finally {
      setIsGoogleLoading(false);
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
    <Card className="w-full max-w-[500px] shadow-lg animate-fadeIn border-0 sm:border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
        <CardDescription>
          Join DevHuddle and start collaborating with developers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="your_username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            </div>

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
              type="button"
              className="w-full"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading || form.formState.isSubmitting}
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
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/signIn"
            className="text-primary font-medium hover:text-primary-hover hover:underline"
          >
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
