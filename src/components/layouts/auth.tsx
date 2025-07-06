"use client";

import React from "react";

/////////// input filed

type InputProps = {
  label: string;
  id: string;
  name?: string;
  type: string;
  placeholder?: string;
  autoFocus?: boolean;
  required?: boolean;
  showToggleIcon?: boolean;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const InputField = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, type, placeholder, error, showToggleIcon, ...rest }, ref) => {
    return (
      <div className="mb-4 sm:mb-6 relative">
        <label
          htmlFor={id}
          className="block font-medium mb-2 text-gray-900 text-sm sm:text-base"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          type={type}
          className={`w-full px-3 sm:px-4 py-3 sm:py-4 border ${
            error ? "border-red-500" : "border-gray-200"
          } rounded-3xl font-sans text-sm sm:text-base transition-all focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20`}
          placeholder={placeholder}
          {...rest}
        />
        {showToggleIcon && (
          <i className="fas fa-eye absolute right-3 sm:right-4 top-10 sm:top-11 text-gray-500 cursor-pointer hover:text-gray-900 transition-colors" />
        )}
        {error && (
          <p className="text-xs sm:text-sm text-red-500 mt-2">{error}</p>
        )}
      </div>
    );
  }
);

//////// Error Message

interface ErrorMessageProps {
  id?: string;
  message: string;
  show?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  id,
  message,
  show = false,
}) => {
  return (
    <div
      id={id}
      className={`text-xs sm:text-sm text-red-500 mb-4 ${
        show ? "block" : "hidden"
      }`}
    >
      {message}
    </div>
  );
};

///////// components/PrimaryButton

interface PrimaryButtonProps {
  id?: string;
  type?: "button" | "submit" | "reset";
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  id,
  type = "button",
  label,
  disabled = false,
  onClick,
}) => {
  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="w-full py-3 sm:py-4 bg-primary text-white rounded-3xl font-semibold cursor-pointer transition-colors hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed mb-4 sm:mb-6"
    >
      {label}
    </button>
  );
};

////////// components/OAuthButton

interface OAuthButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?:boolean;
}

export const OAuthButton: React.FC<OAuthButtonProps> = ({
  label,
  icon,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 sm:gap-3 py-3 border border-gray-200 rounded-3xl bg-white hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
