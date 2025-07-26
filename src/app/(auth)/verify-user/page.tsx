"use client";

import { useEffect, useState } from "react";
import VerifyForm from "./_forms/VerifyForm";
import { resetOTP } from "@/src/services/api/auth.service";
import Link from "next/link";
import toast from "react-hot-toast";

export default function VerifyOtp() {
  const [countdown, setCountdown] = useState<number>(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((pre) => pre - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = () => {
    const email = localStorage.getItem("signupEmail") as string;
    resetOTP(email);
    toast.success('Otp resend succ')
    setCountdown(60);
  };

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-[450px] p-8 animate-fadeIn">
        <h1 className="text-center text-2xl font-bold mb-3 text-gray-900">
          Verify Your Account
        </h1>
        <p className="text-center text-gray-600 mb-6">
          We've sent a verification code to your email
        </p>

        {/* <div className="text-center font-medium mb-6 bg-gray-50 py-3 px-4 rounded-lg">
          j***@example.com
        </div> */}

        <VerifyForm />

        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">
            Didn't receive the code?{" "}
            <button
              id="resend-link"
              onClick={handleResend}
              disabled={countdown > 0}
              className="text-primary font-medium hover:text-primary-hover hover:underline transition-colors"
            >
              Resend Code
            </button>
          </p>
          <p id="resend-timer" className="text-sm text-gray-500 mt-2">
            Resend available in <span id="countdown">{countdown}</span>s
          </p>
        </div>

        <div className="text-center">
              <Link
              href="/signIn"
              className="text-xs sm:text-sm text-primary hover:text-primary-hover hover:underline transition-colors"
            >
              Back to signIn
            </Link>
        </div>
      </div>
    </main>
  );
}
