"use client";
  
import SignUpForm from "./_forms/signupForm";
import useRedirectIfAuthenticated from "@/src/customHooks/useRedirectIfAuthenticated";

export default function Home() {
  // useRedirectIfAuthenticated();
  return (
    <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-[90%] sm:max-w-[450px] p-4 sm:p-6 animate-fadeIn relative">
        <h1 className="text-center text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 pr-6">
          Create your account
        </h1>
        <p className="text-center text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          Join DevHuddle and start collaborating with developers
        </p>

        <SignUpForm />
      </div>
    </main>
  );
}
