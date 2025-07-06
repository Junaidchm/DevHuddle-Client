"use client";

import { HTMLAttributes } from "../../types";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  ...props
}: CardProps) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
