"use client";

import { ButtonHTMLAttributes, forwardRef, useRef, useState } from "react";

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
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const button = buttonRef.current;
      if (button) {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setRipples((prev) => [...prev, { x, y, id }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      }
      onClick?.(e);
    };

    const baseStyles =
      "relative inline-flex items-center justify-center font-medium overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-copper)] disabled:opacity-40 disabled:cursor-not-allowed select-none";

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: "linear-gradient(135deg, var(--accent-copper), var(--primary-dark))",
        color: "#0a0a0f",
        border: "1px solid rgba(201, 168, 124, 0.3)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
      },
      secondary: {
        background: "var(--lg-bg)",
        color: "var(--foreground)",
        border: "1px solid var(--lg-border)",
      },
      ghost: {
        background: "transparent",
        color: "var(--muted)",
        border: "1px solid transparent",
      },
      danger: {
        background: "rgba(224, 108, 117, 0.1)",
        color: "var(--danger)",
        border: "1px solid rgba(224, 108, 117, 0.2)",
      },
    };

    const variantClasses: Record<string, string> = {
      primary: "hover:shadow-[0_4px_16px_rgba(201,168,124,0.3)] active:scale-[0.98]",
      secondary: "hover:bg-[var(--lg-bg-strong)] hover:border-[var(--lg-border-strong)] active:scale-[0.98]",
      ghost: "hover:text-[var(--foreground)] hover:bg-[var(--lg-bg)] active:scale-[0.98]",
      danger: "hover:bg-[rgba(224,108,117,0.2)] hover:border-[rgba(224,108,117,0.3)] active:scale-[0.98]",
    };

    const sizes: Record<string, string> = {
      sm: "h-8 px-3 text-[11px] tracking-wide uppercase rounded-md gap-1.5",
      md: "h-10 px-4 text-[13px] tracking-wide uppercase rounded-lg gap-2",
      lg: "h-12 px-6 text-[13px] tracking-wide uppercase rounded-lg gap-2",
    };

    return (
      <button
        ref={(node) => {
          (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={`${baseStyles} ${variantClasses[variant]} ${sizes[size]} ${className}`}
        style={variantStyles[variant]}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effect */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/20 pointer-events-none animate-[ripple_0.6s_ease-out_forwards]"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

        {/* Shine sweep overlay */}
        <span className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
          <span className="absolute inset-0 -translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </span>

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
