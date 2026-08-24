"use client";

import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "selected" | "stat";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", className = "", children, ...props }, ref) => {
    const baseStyles = "rounded-lg border relative overflow-hidden transition-all duration-300";

    const variants: Record<string, string> = {
      default: "bg-[#1A1A1A] border-[#2A2A2A]",
      interactive: [
        "bg-[#1A1A1A] border-[#2A2A2A] cursor-pointer",
        "hover:border-[#C9A87C]/20 hover:bg-[#1E1E1E]",
        "hover:shadow-[0_4px_20px_rgba(0,0,0,0.3),0_0_0_1px_rgba(201,168,124,0.05)]",
        "hover:-translate-y-0.5",
        "active:translate-y-0 active:shadow-none",
        "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
      ].join(" "),
      selected: "bg-[#C9A87C]/10 border-[#C9A87C]/30 shadow-[0_0_20px_rgba(201,168,124,0.08)]",
      stat: [
        "bg-[#1A1A1A] border-[#2A2A2A]",
        "hover:border-[#2A2A2A]/80",
        "transition-all duration-300",
      ].join(" "),
    };

    const paddings: Record<string, string> = {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
        {...props}
      >
        {/* Shimmer sweep for interactive cards */}
        {variant === "interactive" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
            <div className="absolute -top-full -left-full w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/[0.02] to-transparent rotate-12 opacity-0 hover:opacity-100 transition-opacity duration-500" />
          </div>
        )}
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
        className={`font-headline text-[16px] text-[#F5F0EB] ${className}`}
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
      <p ref={ref} className={`text-[13px] text-[#6B6560] ${className}`} {...props}>
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
        className={`mt-4 pt-4 border-t border-[#2A2A2A] ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";
