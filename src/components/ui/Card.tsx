"use client";

import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "selected" | "stat";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", className = "", children, ...props }, ref) => {
    const baseStyles = "rounded-lg border relative overflow-hidden transition-all duration-300";

    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        background: "var(--lg-bg)",
        borderColor: "var(--lg-border)",
      },
      interactive: {
        background: "var(--lg-bg)",
        borderColor: "var(--lg-border)",
        cursor: "pointer",
      },
      selected: {
        background: "rgba(201, 168, 124, 0.1)",
        borderColor: "rgba(201, 168, 124, 0.3)",
        boxShadow: "0 0 20px rgba(201, 168, 124, 0.08)",
      },
      stat: {
        background: "var(--lg-bg)",
        borderColor: "var(--lg-border)",
      },
    };

    const paddings: Record<string, string> = {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };

    const hoverClass = variant === "interactive"
      ? "hover:border-[var(--lg-border-strong)] hover:-translate-y-0.5 active:translate-y-0"
      : variant === "stat"
      ? "hover:border-[var(--lg-border-strong)]"
      : "";

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${paddings[padding]} ${hoverClass} ${className}`}
        style={variantStyles[variant]}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div ref={ref} className={`mb-4 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={`font-headline text-[16px] ${className}`}
        style={{ color: "var(--foreground)" }}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <p ref={ref} className={`text-[13px] ${className}`} style={{ color: "var(--muted)" }} {...props}>
        {children}
      </p>
    );
  }
);

CardDescription.displayName = "CardDescription";

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`mt-4 pt-4 ${className}`}
        style={{ borderTop: "1px solid var(--lg-border)" }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";
