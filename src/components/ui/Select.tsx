"use client";

import { SelectHTMLAttributes, forwardRef } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[11px] uppercase tracking-[0.1em] text-[#6B6560] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`w-full h-10 px-3 pr-10 bg-[#1A1A1A] border ${
              error
                ? "border-[#E06C75]"
                : "border-[#2A2A2A] focus:border-[#C9A87C]/40"
            } rounded text-[14px] text-[#F5F0EB] outline-none transition-all duration-150 appearance-none cursor-pointer ${
              className
            }`}
            {...props}
          >
            {placeholder && (
              <option value="" className="text-[#6B6560]">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-[#6B6560]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
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

Select.displayName = "Select";

export default Select;
