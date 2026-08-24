"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#C9A87C] focus:ring-offset-2 focus:ring-offset-[#0F0F0F] disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-[#C9A87C] text-[#0F0F0F] border border-[#C9A87C]/30 hover:bg-[#B8956A] hover:border-[#C9A87C]/50",
      secondary:
        "bg-transparent text-[#F5F0EB] border border-[#2A2A2A] hover:bg-[#252525] hover:border-[#3A3A3A]",
      ghost:
        "bg-transparent text-[#9A9590] border border-transparent hover:text-[#F5F0EB] hover:bg-[#252525]",
      danger:
        "bg-[#E06C75]/10 text-[#E06C75] border border-[#E06C75]/20 hover:bg-[#E06C75]/20",
    };

    const sizes = {
      sm: "h-8 px-3 text-[11px] tracking-wide uppercase",
      md: "h-10 px-4 text-[13px] tracking-wide uppercase",
      lg: "h-12 px-6 text-[13px] tracking-wide uppercase",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : icon && iconPosition === "left" ? (
          <span className="mr-2">{icon}</span>
        ) : null}
        {children}
        {icon && iconPosition === "right" && !loading ? (
          <span className="ml-2">{icon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
