"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[11px] uppercase tracking-[0.1em] text-[#6B6560] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6560]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full h-10 px-3 bg-[#1A1A1A] border ${
              error
                ? "border-[#E06C75]"
                : "border-[#2A2A2A] focus:border-[#C9A87C]/40"
            } rounded text-[14px] text-[#F5F0EB] placeholder-[#6B6560] outline-none transition-all duration-150 ${
              icon ? "pl-10" : ""
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-[12px] text-[#E06C75]">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-[12px] text-[#6B6560]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[11px] uppercase tracking-[0.1em] text-[#6B6560] mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full min-h-[100px] px-3 py-3 bg-[#1A1A1A] border ${
            error
              ? "border-[#E06C75]"
              : "border-[#2A2A2A] focus:border-[#C9A87C]/40"
          } rounded text-[14px] text-[#F5F0EB] placeholder-[#6B6560] outline-none transition-all duration-150 resize-none ${
            className
          }`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-[12px] text-[#E06C75]">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-[12px] text-[#6B6560]">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
