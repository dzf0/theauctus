"use client";

import { useState, useEffect, useCallback, Component, ReactNode } from "react";
import { useTheme } from "@/components/theme-provider";
import PixelSnow from "@/components/PixelSnow";

// ── Error Boundary — catches WebGL/animation crashes ──────────
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.warn("[SnowBackground] Component crashed, skipping:", error.message);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// ── Seeded pseudo-random (deterministic for SSR hydration) ──
function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ── Floating Parallax Particles ──────────────────────────────
function ParallaxField({ isDark }: { isDark: boolean }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 7 + 1) * 100,
      y: seededRandom(i * 13 + 2) * 100,
      size: 0.5 + seededRandom(i * 19 + 3) * 2.5,
      depth: 0.2 + seededRandom(i * 23 + 4) * 0.8,
      opacity: 0.1 + seededRandom(i * 29 + 5) * 0.5,
      duration: 4 + seededRandom(i * 31 + 6) * 8,
      delay: seededRandom(i * 37 + 7) * 4,
    }))
  );

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMouse({ x, y });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      const x = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
      const y = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
      setMouse({ x, y });
    }
  }, []);

  const handleDeviceOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (e.gamma !== null && e.beta !== null) {
      const x = Math.max(-1, Math.min(1, (e.gamma || 0) / 45));
      const y = Math.max(-1, Math.min(1, ((e.beta || 0) - 45) / 45));
      setMouse({ x, y });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    if (typeof DeviceOrientationEvent !== "undefined") {
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        const requestPerm = async () => {
          try {
            const perm = await (DeviceOrientationEvent as any).requestPermission();
            if (perm === "granted") {
              window.addEventListener("deviceorientation", handleDeviceOrientation, { passive: true });
            }
          } catch {
            // permission denied
          }
          window.removeEventListener("touchstart", requestPerm);
        };
        window.addEventListener("touchstart", requestPerm, { once: true, passive: true });
      } else {
        window.addEventListener("deviceorientation", handleDeviceOrientation, { passive: true });
      }
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, [handleMouseMove, handleTouchMove, handleDeviceOrientation]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            background: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)",
            transform: `translate(${mouse.x * p.depth * 18}px, ${mouse.y * p.depth * 18}px)`,
            transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
            animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ── Main Snow Background ────────────────────────────────────
export default function SnowBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ErrorBoundary>
      {/* PixelSnow WebGL background */}
      <div className="fixed inset-0 z-0">
        <PixelSnow
          color={isDark ? "#ffffff" : "#1a1a2e"}
          flakeSize={0.008}
          minFlakeSize={1.0}
          pixelResolution={250}
          speed={0.8}
          density={0.2}
          direction={135}
          brightness={isDark ? 0.9 : 0.6}
          gamma={0.5}
          variant="round"
          depthFade={6}
          farPlane={18}
        />
      </div>

      {/* Parallax particles */}
      <ParallaxField isDark={isDark} />

      {/* Noise texture overlay */}
      <div className="noise-overlay" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />

      {/* Radial gradient backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 60%)"
              : "radial-gradient(circle, rgba(0,0,0,0.03) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
        />
      </div>
    </ErrorBoundary>
  );
}
