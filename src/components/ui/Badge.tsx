"use client";

import { HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error";
  size?: "sm" | "md";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", size = "sm", className = "", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center font-medium rounded-full";

    const variants = {
      default: "bg-[#252525] text-[#9A9590] border border-[#2A2A2A]",
      primary: "bg-[#C9A87C]/10 text-[#C9A87C] border border-[#C9A87C]/20",
      success: "bg-[#7CB87C]/10 text-[#7CB87C] border border-[#7CB87C]/20",
      warning: "bg-[#E5C07B]/10 text-[#E5C07B] border border-[#E5C07B]/20",
      error: "bg-[#E06C75]/10 text-[#E06C75] border border-[#E06C75]/20",
    };

    const sizes = {
      sm: "h-5 px-2 text-[10px] tracking-wider uppercase",
      md: "h-6 px-2.5 text-[11px] tracking-wider uppercase",
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
