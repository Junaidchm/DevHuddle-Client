"use client";

import {
  ErrorMessage,
  InputField,
  PrimaryButton,
} from "@/src/components/layouts/auth";
import useAdminRedirectIfAuthenticated from "@/src/customHooks/useAdminAuthenticated";
import useRedirectIfAuthenticated from "@/src/customHooks/useRedirectIfAuthenticated";
import { loginUser } from "@/src/store/actions/authActions";
import { AppDispatch, RootState } from "@/src/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
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

export default function AdminSignIn() {

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);
  const { loading, error, success } = useSelector(
    (state: RootState) => state.user
  );


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
      const loggedInUser = await dispatch(loginUser(data)).unwrap(); // <- payload here

      console.log(
        "user : data",
        loggedInUser?.role,
        loggedInUser?.role === "superAdmin"
      );

      if (loggedInUser.role === "superAdmin") {
        toast.success("Login successful", { position: "bottom-center" });
        router.push("/admin/dashboard");
      } else {
        toast.error("You don’t have admin privileges", {
          position: "bottom-center",
        });
      }
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
