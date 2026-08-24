"use client";

import { HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error";
  size?: "sm" | "md";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", size = "sm", className = "", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center font-medium rounded-full";

    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        background: "var(--lg-bg)",
        color: "var(--muted)",
        border: "1px solid var(--lg-border)",
      },
      primary: {
        background: "rgba(201, 168, 124, 0.1)",
        color: "var(--accent-copper)",
        border: "1px solid rgba(201, 168, 124, 0.2)",
      },
      success: {
        background: "rgba(124, 184, 124, 0.1)",
        color: "var(--success)",
        border: "1px solid rgba(124, 184, 124, 0.2)",
      },
      warning: {
        background: "rgba(229, 192, 123, 0.1)",
        color: "var(--accent-copper)",
        border: "1px solid rgba(229, 192, 123, 0.2)",
      },
      error: {
        background: "rgba(224, 108, 117, 0.1)",
        color: "var(--danger)",
        border: "1px solid rgba(224, 108, 117, 0.2)",
      },
    };

    const sizes = {
      sm: "h-5 px-2 text-[10px] tracking-wider uppercase",
      md: "h-6 px-2.5 text-[11px] tracking-wider uppercase",
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${sizes[size]} ${className}`}
        style={variantStyles[variant]}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
