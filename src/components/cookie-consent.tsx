"use client";

import { useState, useEffect } from "react";

const COOKIE_CONSENT_KEY = "theauctus_cookie_consent";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always on
    analytics: false,
    marketing: false,
    timestamp: "",
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    const withTimestamp = { ...prefs, timestamp: new Date().toISOString() };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(withTimestamp));
    setPreferences(withTimestamp);
    setShowBanner(false);
    setShowSettings(false);

    // Initialize analytics/marketing scripts based on preferences
    if (prefs.analytics) {
      // Initialize analytics (e.g., Google Analytics)
      console.log("Analytics enabled");
    }
    if (prefs.marketing) {
      // Initialize marketing scripts
      console.log("Marketing enabled");
    }
  };

  const acceptAll = () => {
    savePreferences({ essential: true, analytics: true, marketing: true, timestamp: "" });
  };

  const acceptEssential = () => {
    savePreferences({ essential: true, analytics: false, marketing: false, timestamp: "" });
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        style={{
          background: "var(--lg-bg-strong)",
          backdropFilter: "blur(40px) saturate(180%)",
          borderTop: "1px solid var(--lg-border)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🍪</span>
                <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  We value your privacy
                </h3>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: "var(--muted)" }}>
                We use cookies to enhance your experience, analyze site traffic, and personalize content.
                By clicking &quot;Accept All&quot;, you consent to our use of cookies.{" "}
                <a href="/privacy" className="accent-text hover:opacity-80 underline">Privacy Policy</a>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 text-[11px] font-medium rounded-lg transition-colors"
                style={{
                  background: "var(--lg-bg)",
                  border: "1px solid var(--lg-border)",
                  color: "var(--muted)",
                }}
              >
                Customize
              </button>
              <button
                onClick={acceptEssential}
                className="px-4 py-2 text-[11px] font-medium rounded-lg transition-colors"
                style={{
                  background: "var(--lg-bg)",
                  border: "1px solid var(--lg-border)",
                  color: "var(--foreground)",
                }}
              >
                Essential Only
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-[11px] font-medium rounded-lg liquid-btn-primary"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowSettings(false)}
        >
          <div
            className="liquid-card max-w-lg w-full p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                Cookie Preferences
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="hover:opacity-70"
                style={{ color: "var(--muted)" }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Essential Cookies */}
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--lg-bg)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Essential Cookies</p>
                  <p className="text-[11px]" style={{ color: "var(--muted)" }}>Required for the site to function</p>
                </div>
                <div className="w-10 h-6 rounded-full" style={{ background: "var(--accent-copper)" }}>
                  <div className="w-4 h-4 bg-white rounded-full mx-1 translate-x-4" />
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--lg-bg)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Analytics Cookies</p>
                  <p className="text-[11px]" style={{ color: "var(--muted)" }}>Help us understand how you use the site</p>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                  className="w-10 h-6 rounded-full transition-colors"
                  style={{ background: preferences.analytics ? "var(--accent-copper)" : "var(--lg-border)" }}
                >
                  <div
                    className="w-4 h-4 bg-white rounded-full mx-1 transition-transform"
                    style={{ transform: preferences.analytics ? "translateX(16px)" : "translateX(0)" }}
                  />
                </button>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--lg-bg)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Marketing Cookies</p>
                  <p className="text-[11px]" style={{ color: "var(--muted)" }}>Used for personalized advertisements</p>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                  className="w-10 h-6 rounded-full transition-colors"
                  style={{ background: preferences.marketing ? "var(--accent-copper)" : "var(--lg-border)" }}
                >
                  <div
                    className="w-4 h-4 bg-white rounded-full mx-1 transition-transform"
                    style={{ transform: preferences.marketing ? "translateX(16px)" : "translateX(0)" }}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2.5 text-[12px] font-medium rounded-lg"
                style={{
                  background: "var(--lg-bg)",
                  border: "1px solid var(--lg-border)",
                  color: "var(--muted)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveCustom}
                className="flex-1 py-2.5 text-[12px] font-medium rounded-lg liquid-btn-primary"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
