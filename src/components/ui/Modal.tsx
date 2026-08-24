"use client";

import { useEffect, useRef, useState } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => setIsAnimating(true));
    } else if (isVisible) {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  const sizes: Record<string, string> = {
    sm: "max-w-[400px]",
    md: "max-w-[480px]",
    lg: "max-w-[640px]",
    xl: "max-w-[800px]",
    full: "max-w-[95vw] max-h-[90vh]",
  };

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isAnimating
          ? "bg-black/70 backdrop-blur-sm"
          : "bg-black/0 backdrop-blur-0"
      }`}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={`w-full ${sizes[size]} bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-2xl transition-all duration-300 ${
          isAnimating
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2"
        }`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-6 pb-0">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="font-headline text-[20px] text-[#F5F0EB]"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-1 text-[13px] text-[#6B6560]"
                >
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 -mt-1 -mr-1 text-[#6B6560] hover:text-[#F5F0EB] hover:bg-[rgba(255,255,255,0.06)] transition-all duration-150 rounded-lg"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
