"use client";

import { InputHTMLAttributes, forwardRef } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = "", ...props }, ref) => {
    return (
      <label className={`flex items-start gap-3 cursor-pointer ${className}`}>
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            className="peer sr-only"
            {...props}
          />
          <div className="w-5 h-5 border border-[#2A2A2A] rounded bg-[#1A1A1A] peer-checked:bg-[#C9A87C] peer-checked:border-[#C9A87C] transition-all duration-150 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-[#0F0F0F] opacity-0 peer-checked:opacity-100 transition-opacity"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <span className="text-[14px] text-[#F5F0EB]">{label}</span>
            )}
            {description && (
              <p className="text-[12px] text-[#6B6560] mt-0.5">{description}</p>
            )}
          </div>
        )}
        {error && (
          <p className="text-[12px] text-[#E06C75]">{error}</p>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
