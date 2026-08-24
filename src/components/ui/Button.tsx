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
      // Create ripple
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
      "relative inline-flex items-center justify-center font-medium overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A87C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F0F] disabled:opacity-40 disabled:cursor-not-allowed select-none";

    const variants: Record<string, string> = {
      primary: [
        "bg-gradient-to-br from-[#C9A87C] to-[#B8935F] text-[#0F0F0F] font-semibold",
        "border border-[#C9A87C]/30",
        "shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]",
        "hover:shadow-[0_4px_16px_rgba(201,168,124,0.3),0_0_0_1px_rgba(201,168,124,0.1)]",
        "hover:from-[#dcc4a0] hover:to-[#c9a87c]",
        "hover:border-[#C9A87C]/50",
        "active:scale-[0.98] active:shadow-[0_1px_4px_rgba(201,168,124,0.2)]",
        "transition-all duration-150 ease-out",
      ].join(" "),
      secondary: [
        "bg-[rgba(255,255,255,0.04)] text-[#F5F0EB]",
        "border border-[#2A2A2A]",
        "hover:bg-[rgba(255,255,255,0.08)] hover:border-[#3A3A3A]",
        "hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)]",
        "active:scale-[0.98] active:bg-[rgba(255,255,255,0.06)]",
        "transition-all duration-150 ease-out",
      ].join(" "),
      ghost: [
        "bg-transparent text-[#9A9590]",
        "border border-transparent",
        "hover:text-[#F5F0EB] hover:bg-[rgba(255,255,255,0.04)]",
        "active:scale-[0.98]",
        "transition-all duration-150 ease-out",
      ].join(" "),
      danger: [
        "bg-[#E06C75]/10 text-[#E06C75]",
        "border border-[#E06C75]/20",
        "hover:bg-[#E06C75]/20 hover:border-[#E06C75]/30",
        "hover:shadow-[0_4px_12px_rgba(224,108,117,0.15)]",
        "active:scale-[0.98]",
        "transition-all duration-150 ease-out",
      ].join(" "),
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
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
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
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
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
