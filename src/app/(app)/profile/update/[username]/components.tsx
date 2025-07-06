// components/NavLink.tsx
import React from "react";

// NavLink
interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
}

export const NavLink: React.FC<NavLinkProps> = ({ href, label, isActive }) => (
  <a
    href={href}
    className={`no-underline text-gray-800 font-medium text-sm relative hover:text-indigo-600 ${
      isActive ? "text-indigo-600 after:visible" : ""
    } after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-gradient-to-r after:from-indigo-600 after:to-cyan-500 after:rounded after:invisible`}
    data-active={isActive}
  >
    {label}
  </a>
);

// SettingsTab
interface SettingsTabProps {
  icon: string;
  text: string;
  isActive: boolean;
  onclick?:()=>void
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  icon,
  text,
  isActive,
  onclick
}) => (
  <div 
    onClick={onclick}
    className={`settings-tab flex items-center gap-3 p-4 cursor-pointer transition-colors border-l-4 ${
      isActive
        ? "bg-gray-100 border-l-indigo-600 text-indigo-600"
        : "border-transparent hover:bg-gray-100"
    }`}
    data-active={isActive}
  >
    <i className={`${icon} text-lg w-6 text-center`}></i>
    <span className="settings-tab-text font-medium">{text}</span>
  </div>
);

// TechBadge
interface TechBadgeProps {
  skill: string;
}

export const TechBadge: React.FC<TechBadgeProps> = ({ skill }) => (
  <div
    className="tech-badge inline-flex items-center bg-gray-100 rounded-full px-3 py-1.5 text-sm cursor-pointer transition-colors hover:bg-indigo-600/10 data-[selected=true]:bg-indigo-600 data-[selected=true]:text-white"
    data-selected={true}
  >
    {skill}
    <i className="fas fa-times ml-2 text-xs"></i>
  </div>
);

// components/FormInput.tsx

interface FormInputProps {
  id: string;
  label: string;
  type: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  helpText?: string;
  error?: string;
  disabled?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  helpText,
  error,
  disabled = false,
  ...rest // allow passing from react-hook-form
}) => (
  <div className="form-group mb-6">
    <label
      htmlFor={id}
      className="form-label block mb-2 font-medium text-gray-800 text-[0.95rem]"
    >
      {label}
    </label>
    <input
      type={type}
      id={id}
      disabled={disabled}
      className={`form-input w-full px-4 py-3 border ${
        error ? "border-red-500" : "border-gray-200"
      } rounded-lg font-['Inter'] text-sm text-gray-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-colors`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...rest}
    />
    {helpText && (
      <div className="form-help mt-2 text-sm text-gray-500">{helpText}</div>
    )}
    {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
  </div>
);

// components/FormTextarea.tsx

interface FormTextareaProps {
  id: string;
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  helpText?: string;
  error?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  id,
  label,
  value,
  onChange,
  helpText,
  error,
  ...rest
}) => (
  <div className="form-group mb-6">
    <label
      htmlFor={id}
      className="form-label block mb-2 font-medium text-gray-800 text-[0.95rem]"
    >
      {label}
    </label>
    <textarea
      id={id}
      className={`form-textarea w-full px-4 py-3 border ${
        error ? "border-red-500" : "border-gray-200"
      } rounded-lg font-['Inter'] text-sm text-gray-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-colors min-h-[120px] resize-y`}
      value={value}
      onChange={onChange}
      {...rest}
    />
    {helpText && (
      <div className="form-help mt-2 text-sm text-gray-500">{helpText}</div>
    )}
    {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
  </div>
);

// components/Button.tsx

// Button
interface ButtonProps {
  text: string;
  variant: "primary" | "secondary" | "danger";
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
  text,
  variant,
  icon,
  onClick,
  disabled,
  type = "submit",
}) => {
  const variantStyles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary:
      "bg-white text-gray-800 border border-gray-200 hover:bg-gray-100",
    danger: "bg-red-600/10 text-red-600 hover:bg-red-600/20",
  };
  return (
    <button
      type={type}
      className={`btn inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${variantStyles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <i className={icon}></i>}
      {text}
    </button>
  );
};

// components/SocialLink.tsx

// SocialLink
interface SocialLinkProps {
  icon: string;
  href: string;
}

export const SocialLink: React.FC<SocialLinkProps> = ({ icon, href }) => (
  <a
    href={href}
    className="social-link w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-xl transition-all hover:bg-indigo-600 hover:-translate-y-0.5"
  >
    <i className={`fab fa-${icon}`}></i>
  </a>
);

// components/FooterLink.tsx

// FooterLink
interface FooterLinkProps {
  href: string;
  label: string;
}

export const FooterLink: React.FC<FooterLinkProps> = ({ href, label }) => (
  <li className="mb-3">
    <a
      href={href}
      className="text-gray-400 text-sm no-underline hover:text-white transition-colors"
    >
      {label}
    </a>
  </li>
);

// components/Card.tsx

// Card
interface CardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, icon, children }) => (
  <div className="card bg-white rounded-xl shadow-md p-6 mb-8">
    <h2 className="card-title text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
      <i className={`${icon} text-indigo-600`}></i> {title}
    </h2>
    {children}
  </div>
);
