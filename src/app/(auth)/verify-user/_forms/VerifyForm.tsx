import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/src/store/store";
import { verifyOtp } from "@/src/store/actions/authActions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { verifyOTP } from "@/src/services/api/auth.service";

const otpSchema = z.object({
  otp: z
    .array(z.string().regex(/^[0-9]$/, "Must be a single digit"))
    .length(6, "OTP must be 6 digits")
    .refine((data) => data.every((digit) => digit !== ""), {
      message: "All fields are required",
    }),
});

type OtpFormData = z.infer<typeof otpSchema>;

export default function VerifyForm() {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [email, setEmail] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("signupEmail");
    if (!storedEmail) {
      router.push("/signup");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ["", "", "", "", "", ""],
    },
  });

  const dispatch = useDispatch<AppDispatch>();

  const otp = watch("otp");

  const handleInputChange = (index: number, value: string) => {
    if (/^[0-9]?$/.test(value)) {
      setValue(`otp.${index}`, value, { shouldValidate: true });

      // Move to next input if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (data: OtpFormData) => {
    try {
      const otp = data.otp.join(""); // Combine OTP array into a single string
      await verifyOTP({email, otp});

      // 2. Programmatically sign in with NextAuth
      const password = localStorage.getItem("signupPassword");
      if (!password) {
        toast.error("Session expired. Please sign in manually.");
        router.push("/signIn");
        return;
      }

      const result = await signIn("credentials", {
        redirect: false, // Prevent NextAuth from redirecting
        email: email,
        password: password,
      });
      
      localStorage.removeItem("signupEmail"); // Clean up stored email
      localStorage.removeItem("signupPassword"); // Clean up stored password

      if (result?.error) throw new Error(result.error);

      window.location.href = "/";
    } catch (error: any) {
      const errorMessage =
        error?.message || error || "Something went wrong during verification";
      toast.error(errorMessage, {
        position: "bottom-center",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="otp-form" className="mb-6">
      <div className="flex justify-between gap-2 mb-6">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              {...register(`otp.${index}`)}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              className={`w-12 h-14 text-center text-2xl font-semibold border rounded-xl bg-white transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                errors.otp?.[index] ? "border-red-500" : "border-gray-200"
              }`}
              required
            />
          ))}
      </div>

      {errors.otp && (
        <div
          id="error-message"
          className="text-sm text-red-500 text-center mb-4 animate-shake"
        >
          {errors.otp.message || "Invalid verification code. Please try again."}
        </div>
      )}

      <button
        type="submit"
        className="w-full py-4 bg-primary text-white rounded-3xl font-semibold cursor-pointer transition-colors hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed mb-6"
        id="verify-button"
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting ? "Verifying..." : "Verify Account"}
      </button>
    </form>
  );
}
