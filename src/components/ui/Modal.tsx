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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: isAnimating ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0)",
        backdropFilter: isAnimating ? "blur(4px)" : "blur(0px)",
        transition: "background-color 0.25s var(--ease-out), backdrop-filter 0.25s var(--ease-out)",
      }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={`w-full ${sizes[size]} rounded-xl relative overflow-hidden`}
        style={{
          background: "var(--lg-bg-strong)",
          backdropFilter: "blur(var(--lg-blur)) saturate(var(--lg-saturate))",
          border: "1px solid var(--lg-border)",
          boxShadow: "var(--lg-shadow-lg), var(--lg-inset)",
          opacity: isAnimating ? 1 : 0,
          transform: isAnimating ? "scale(1) translateY(0)" : "scale(0.96) translateY(8px)",
          // Emil: modal is exempt from origin-aware — stays centered
          // Spring: critically damped, no overshoot for modal (damping 1.0, response ~0.3s)
          transition: "opacity 0.3s var(--ease-spring-critical), transform 0.3s var(--ease-spring-critical)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
      >
        {/* Specular highlight — the liquid shine */}
        <div
          className="absolute top-0 left-0 right-0 h-[40%] pointer-events-none z-[1]"
          style={{
            background: "linear-gradient(180deg, var(--lg-highlight) 0%, transparent 100%)",
            borderRadius: "var(--lg-radius-sm) var(--lg-radius-sm) 0 0",
            opacity: 0.4,
          }}
        />

        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-6 pb-0 relative z-10">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="font-headline text-[20px]"
                  style={{ color: "var(--foreground)" }}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-1 text-[13px]"
                  style={{ color: "var(--muted)" }}
                >
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 -mt-1 -mr-1 rounded-lg"
              style={{
                color: "var(--muted)",
                transition: "color 0.15s var(--ease-out), background-color 0.15s var(--ease-out)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--foreground)";
                e.currentTarget.style.backgroundColor = "var(--lg-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--muted)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 relative z-10">{children}</div>
      </div>
    </div>
  );
}
