import React from "react";

interface SettingsTabProps {
  icon: string;
  text: string;
  isActive: boolean;
  onclick?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  icon,
  text,
  isActive,
  onclick,
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
