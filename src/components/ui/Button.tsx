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
      "relative inline-flex items-center justify-center font-medium overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-copper)] disabled:opacity-40 disabled:cursor-not-allowed select-none";

    // Emil: specific transition properties, never `transition: all`
    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: "linear-gradient(135deg, var(--accent-copper), var(--primary-dark))",
        color: "#0a0a0f",
        border: "1px solid rgba(201, 168, 124, 0.3)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
        transition: "transform 0.15s var(--ease-spring-critical), box-shadow 0.25s var(--ease-out), background 0.25s var(--ease-out)",
      },
      secondary: {
        background: "var(--lg-bg)",
        color: "var(--foreground)",
        border: "1px solid var(--lg-border)",
        transition: "transform 0.15s var(--ease-spring-critical), background 0.25s var(--ease-out), border-color 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out)",
      },
      ghost: {
        background: "transparent",
        color: "var(--muted)",
        border: "1px solid transparent",
        transition: "transform 0.15s var(--ease-spring-critical), color 0.2s var(--ease-out), background 0.2s var(--ease-out)",
      },
      danger: {
        background: "rgba(201, 124, 124, 0.1)",
        color: "var(--danger)",
        border: "1px solid rgba(201, 124, 124, 0.2)",
        transition: "transform 0.15s var(--ease-spring-critical), background 0.25s var(--ease-out), border-color 0.25s var(--ease-out)",
      },
    };

    // Emil: subtle hover effects, scale(0.97) on press
    const variantClasses: Record<string, string> = {
      primary: "hover:shadow-[0_4px_16px_rgba(201,168,124,0.3)]",
      secondary: "hover:bg-[var(--lg-bg-strong)] hover:border-[var(--lg-border-strong)]",
      ghost: "hover:text-[var(--foreground)] hover:bg-[var(--lg-bg)]",
      danger: "hover:bg-[rgba(201,124,124,0.2)] hover:border-[rgba(201,124,124,0.3)]",
    };

    const sizes: Record<string, string> = {
      sm: "h-8 px-3 text-[11px] tracking-wide uppercase rounded-md gap-1.5",
      md: "h-10 px-4 text-[13px] tracking-wide uppercase rounded-lg gap-2",
      lg: "h-12 px-6 text-[13px] tracking-wide uppercase rounded-lg gap-2",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantClasses[variant]} ${sizes[size]} ${className}`}
        style={variantStyles[variant]}
        disabled={disabled || loading}
        // Emil: respond on pointer-down, not release — instant scale feedback
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(0.97)";
        }}
        onPointerUp={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "";
        }}
        onPointerLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "";
        }}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : icon && iconPosition === "left" ? (
          <span className="relative">{icon}</span>
        ) : null}

        <span className="relative">{children}</span>

        {icon && iconPosition === "right" && !loading ? (
          <span className="relative">{icon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
