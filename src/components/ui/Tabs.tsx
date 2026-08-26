"use client";

import { createContext, useContext, useState, useRef, useEffect, useMemo, useCallback, HTMLAttributes, ReactNode } from "react";

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  registerTab: (value: string, el: HTMLButtonElement | null) => void;
  tabRects: Record<string, DOMRect>;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  children: ReactNode;
}

export function Tabs({ defaultValue, children, className = "" }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const [tabRects, setTabRects] = useState<Record<string, DOMRect>>({});
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const registerTab = useCallback((value: string, el: HTMLButtonElement | null) => {
    tabRefs.current[value] = el;
    if (el) {
      setTabRects((prev) => ({ ...prev, [value]: el.getBoundingClientRect() }));
    }
  }, []);

  // Recalculate rects on resize
  useEffect(() => {
    const update = () => {
      const newRects: Record<string, DOMRect> = {};
      Object.entries(tabRefs.current).forEach(([value, el]) => {
        if (el) newRects[value] = el.getBoundingClientRect();
      });
      setTabRects(newRects);
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const contextValue = useMemo(
    () => ({ activeTab, setActiveTab, registerTab, tabRects }),
    [activeTab, registerTab, tabRects]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}

export function TabsList({ children, className = "" }: TabsListProps) {
  const context = useContext(TabsContext);
  const listRef = useRef<HTMLDivElement>(null);

  // Get the list container rect for positioning the indicator
  const [listRect, setListRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (listRef.current) {
      setListRect(listRef.current.getBoundingClientRect());
    }
  }, []);

  // Emil: calculate indicator position from the active tab's rect
  const activeRect = context?.tabRects[context.activeTab];
  const indicatorStyle =
    activeRect && listRect
      ? {
          left: activeRect.left - listRect.left,
          width: activeRect.width,
        }
      : { left: 0, width: 0 };

  return (
    <div
      ref={listRef}
      className={`relative flex gap-1 p-1 rounded-lg ${className}`}
      style={{
        background: "var(--lg-bg)",
        border: "1px solid var(--lg-border)",
      }}
      role="tablist"
    >
      {/* Animated indicator — clip-path based, not color transition */}
      <div
        className="absolute top-1 bottom-1 rounded-[var(--lg-radius-xs)] z-0"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          background: "var(--lg-bg-strong)",
          border: "1px solid var(--lg-border)",
          boxShadow: "var(--lg-inset)",
          // Emil: CSS transition for smooth tab switching — spring for natural feel
          transition: "left 0.25s var(--ease-spring-critical), width 0.25s var(--ease-spring-critical)",
        }}
      />
      {children}
    </div>
  );
}

export interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, children, className = "", ...props }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.activeTab === value;
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    context.registerTab(value, ref.current);
  // ponytail: omit context from deps — registerTab is stable via useCallback
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={isActive}
      className={`relative z-10 flex-1 px-4 py-2 text-[12px] uppercase tracking-wider font-medium rounded-[var(--lg-radius-xs)] ${className}`}
      style={{
        color: isActive ? "var(--accent-copper)" : "var(--muted)",
        background: "transparent",
        border: "1px solid transparent",
        transition: "color 0.2s var(--ease-out)",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.color = "var(--foreground)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.color = "var(--muted)";
      }}
      onClick={() => context.setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ value, children, className = "" }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.activeTab !== value) return null;

  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  );
}
