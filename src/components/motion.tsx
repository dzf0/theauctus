"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type CSSProperties,
  type ElementType,
} from "react";

/* ────────────────────────────────────────────────────────────────
   Scroll progress — thin copper bar pinned to the top of the page
   ──────────────────────────────────────────────────────────────── */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      el.style.transform = `scaleX(${p})`;
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="scroll-progress w-full" style={{ transform: "scaleX(0)" }} />;
}

/* ────────────────────────────────────────────────────────────────
   Reveal — generic in-view reveal. variants: up | zoom | left | right
   ──────────────────────────────────────────────────────────────── */
type RevealVariant = "up" | "zoom" | "left" | "right" | "stagger";

const variantClass: Record<RevealVariant, string> = {
  up: "reveal",
  zoom: "reveal-zoom",
  left: "reveal-left",
  right: "reveal-right",
  stagger: "stagger",
};

export function Reveal({
  children,
  variant = "up",
  delay = 0,
  threshold = 0.12,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  threshold?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      className={`${variantClass[variant]} ${visible ? "visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </Tag>
  );
}

/* ────────────────────────────────────────────────────────────────
   WordReveal — headline that sharpens word by word (blur → focus)
   ──────────────────────────────────────────────────────────────── */
export function WordReveal({
  text,
  className = "",
  baseDelay = 0.15,
  stagger = 0.07,
  as: Tag = "h1",
}: {
  text: string;
  className?: string;
  baseDelay?: number;
  stagger?: number;
  as?: ElementType;
}) {
  const words = text.split(" ");
  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="word-reveal"
          style={{ "--word-delay": `${baseDelay + i * stagger}s` } as CSSProperties}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}

/* ────────────────────────────────────────────────────────────────
   CountUp — eased number count when scrolled into view
   ──────────────────────────────────────────────────────────────── */
export function CountUp({
  target,
  suffix = "",
  prefix = "",
  duration = 1800,
  className = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const startTime = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - startTime) / duration, 1);
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p); // ease-out-expo
          setValue(Math.round(eased * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────
   Magnetic — element gently follows the cursor while hovered
   ──────────────────────────────────────────────────────────────── */
export function useMagnetic(strength = 6) {
  const ref = useRef<HTMLElement>(null);

  const updatePull = useCallback((clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    el.style.setProperty("--pull-x", `${(dx / rect.width) * strength * 2}px`);
    el.style.setProperty("--pull-y", `${(dy / rect.height) * strength * 2}px`);
  }, [strength]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      updatePull(e.clientX, e.clientY);
    },
    [updatePull]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length > 0) {
        updatePull(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [updatePull]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--pull-x", "0px");
    el.style.setProperty("--pull-y", "0px");
  }, []);

  return { ref, onMouseMove, onTouchMove, onMouseLeave: onLeave, onTouchEnd: onLeave };
}

export function Magnetic({
  children,
  strength = 6,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
  as?: ElementType;
}) {
  const { ref, onMouseMove, onMouseLeave, onTouchMove, onTouchEnd } = useMagnetic(strength);
  return (
    <Tag ref={ref} className={`magnetic-btn ${className}`} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {children}
    </Tag>
  );
}

/* ────────────────────────────────────────────────────────────────
   TiltCard — 3D perspective tilt + glare tracking on hover
   ──────────────────────────────────────────────────────────────── */
export function TiltCard({
  children,
  className = "",
  maxTilt = 5,
  glare = true,
  style,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height;
      const ry = (px - 0.5) * 2 * maxTilt; // rotateY
      const rx = -(py - 0.5) * 2 * maxTilt; // rotateX
      el.style.setProperty("--tilt-x", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${ry.toFixed(2)}deg`);
      el.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
    },
    [maxTilt]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const el = ref.current;
      if (!el || e.touches.length === 0) return;
      const rect = el.getBoundingClientRect();
      const px = (e.touches[0].clientX - rect.left) / rect.width;
      const py = (e.touches[0].clientY - rect.top) / rect.height;
      const ry = (px - 0.5) * 2 * maxTilt;
      const rx = -(py - 0.5) * 2 * maxTilt;
      el.style.setProperty("--tilt-x", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${ry.toFixed(2)}deg`);
      el.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
    },
    [maxTilt]
  );

  const onTouchEnd = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  }, []);

  return (
    <div ref={ref} className={`tilt-card ${className}`} style={style} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {children}
      {glare && <div className="tilt-card-glare" />}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   MeshBackdrop — drifting gradient orbs that lean toward cursor
   ──────────────────────────────────────────────────────────────── */
export function MeshBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return;
      const x = (clientX / window.innerWidth - 0.5) * 40;
      const y = (clientY / window.innerHeight - 0.5) * 30;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden transition-transform duration-700 ease-out">
      <div
        className="mesh-blob mesh-drift-a"
        style={{
          top: "-15%",
          right: "-8%",
          width: "min(60vw, 720px)",
          height: "min(60vw, 720px)",
          background: "radial-gradient(circle, rgba(201,168,124,0.14) 0%, transparent 65%)",
        }}
      />
      <div
        className="mesh-blob mesh-drift-b"
        style={{
          bottom: "-20%",
          left: "-10%",
          width: "min(50vw, 600px)",
          height: "min(50vw, 600px)",
          background: "radial-gradient(circle, rgba(124,158,201,0.08) 0%, transparent 65%)",
        }}
      />
      <div
        className="mesh-blob"
        style={{
          top: "35%",
          left: "35%",
          width: "min(30vw, 380px)",
          height: "min(30vw, 380px)",
          background: "radial-gradient(circle, rgba(201,168,124,0.06) 0%, transparent 65%)",
          animation: "mesh-drift-a 24s ease-in-out infinite reverse",
        }}
      />
    </div>
  );
}
