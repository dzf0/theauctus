"use client";

import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "selected" | "stat";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", className = "", children, ...props }, ref) => {
    const baseStyles = "rounded-lg border relative overflow-hidden";

    // Emil: specific transitions, never `transition: all`
    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        background: "var(--lg-bg)",
        borderColor: "var(--lg-border)",
        transition: "border-color 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out)",
      },
      interactive: {
        background: "var(--lg-bg)",
        borderColor: "var(--lg-border)",
        cursor: "pointer",
        transition: "transform 0.3s var(--ease-spring-critical), border-color 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out)",
      },
      selected: {
        background: "rgba(201, 168, 124, 0.1)",
        borderColor: "rgba(201, 168, 124, 0.3)",
        boxShadow: "0 0 20px rgba(201, 168, 124, 0.08)",
        transition: "border-color 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out)",
      },
      stat: {
        background: "var(--lg-bg)",
        borderColor: "var(--lg-border)",
        transition: "border-color 0.3s var(--ease-out)",
      },
    };

    const paddings: Record<string, string> = {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };

    // Emil: interactive cards lift on hover, press snaps back
    const hoverHandlers =
      variant === "interactive"
        ? {
            onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = "var(--lg-border-strong)";
              e.currentTarget.style.boxShadow = "var(--lg-shadow)";
            },
            onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            },
            onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
              e.currentTarget.style.transform = "translateY(0) scale(0.99)";
            },
            onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
              e.currentTarget.style.transform = "translateY(-2px)";
            },
          }
        : variant === "stat"
        ? {
            onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.borderColor = "var(--lg-border-strong)";
            },
            onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.borderColor = "";
            },
          }
        : {};

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${paddings[padding]} ${className}`}
        style={variantStyles[variant]}
        {...hoverHandlers}
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
