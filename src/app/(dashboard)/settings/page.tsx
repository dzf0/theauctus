"use client";

import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/Loading";

interface Platform {
  id: string;
  label: string;
  color: string;
  connected: boolean;
  platformName: string | null;
  username: string | null;
  followers: number;
  lastSync: string | null;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  name: string;
  niche: string;
  brand_voice: string;
  target_audience: string;
  goals: string;
  keywords: string[];
  onboarded: boolean;
}

const NICHE_OPTIONS = [
  "Fashion & Beauty", "Food & Cooking", "Fitness & Health", "Travel & Adventure",
  "Technology & Gadgets", "Business & Entrepreneurship", "Education & Learning",
  "Entertainment & Comedy", "Art & Design", "Music & Audio", "Gaming",
  "Parenting & Family", "Pets & Animals", "Home & Garden", "Sports & Outdoors",
  "Finance & Investing", "Marketing & Social Media", "Health & Wellness",
  "Sustainability & Environment", "Other",
];

const VOICE_OPTIONS = [
  { id: "professional", label: "Professional", description: "Authoritative and trustworthy" },
  { id: "casual", label: "Casual", description: "Friendly and approachable" },
  { id: "humorous", label: "Humorous", description: "Witty and entertaining" },
  { id: "inspirational", label: "Inspirational", description: "Motivating and uplifting" },
  { id: "educational", label: "Educational", description: "Informative and helpful" },
];

function PlatformsSection() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchPlatforms();
    // Check URL params for connection status
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    if (connected) {
      fetchPlatforms();
      window.history.replaceState({}, "", window.location.pathname);
    }
    const error = params.get("error");
    if (error) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const fetchPlatforms = async () => {
    try {
      const res = await fetch("/api/platforms");
      const data = await res.json();
      setPlatforms(data.platforms || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleConnect = (platformId: string) => {
    setConnecting(platformId);
    window.location.href = `/api/platforms/${platformId}/connect`;
  };

  const handleDisconnect = async (platformId: string) => {
    await fetch(`/api/platforms/${platformId}/disconnect`, { method: "POST" });
    fetchPlatforms();
  };

  if (loading) {
    return (
      <div className="liquid-card p-6">
        <div className="flex items-center justify-center py-8">
          <Spinner size={16} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="liquid-card p-6">
        <h3 className="font-semibold mb-2" style={{ color: "var(--foreground)" }}>Platform Connections</h3>
        <p className="text-[13px] mb-6" style={{ color: "var(--muted)" }}>
          Connect your social platforms to enable auto-publishing. Posts will be published automatically at their scheduled time.
        </p>
        <div className="space-y-3">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="flex items-center justify-between p-4 rounded-xl transition-colors"
              style={{ background: "var(--lg-bg)", border: `1px solid ${platform.connected ? "rgba(124, 184, 124, 0.3)" : "var(--lg-border)"}` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: `${platform.color}15`, color: platform.color }}>
                  {platform.id === "twitter" ? "X" : platform.id === "instagram" ? "IG" : platform.id === "linkedin" ? "in" : platform.id === "tiktok" ? "TT" : platform.id === "youtube" ? "YT" : platform.id === "threads" ? "@" : platform.id === "facebook" ? "f" : "//"}
                </div>
                <div>
                  <p className="text-[13px] font-medium" style={{ color: "var(--foreground)" }}>{platform.label}</p>
                  {platform.connected ? (
                    <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                      Connected as {platform.platformName || platform.username || "--"}
                      {platform.followers > 0 ? ` · ${platform.followers.toLocaleString()} followers` : ""}
                    </p>
                  ) : (
                    <p className="text-[11px]" style={{ color: "var(--muted)" }}>Not connected</p>
                  )}
                </div>
              </div>
              <div>
                {platform.connected ? (
                  <button
                    onClick={() => handleDisconnect(platform.id)}
                    className="px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors"
                    style={{ color: "var(--danger)", border: "1px solid rgba(224, 108, 117, 0.2)" }}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.id)}
                    disabled={connecting !== null}
                    className="px-3 py-1.5 text-[11px] font-medium rounded-lg liquid-btn-primary disabled:opacity-50"
                  >
                    {connecting === platform.id ? "Connecting..." : "Connect"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="liquid-card p-6">
        <h3 className="font-semibold mb-2" style={{ color: "var(--foreground)" }}>How Auto-Publishing Works</h3>
        <div className="space-y-2 text-[13px]" style={{ color: "var(--muted)" }}>
          <p>1. Connect your platforms above</p>
          <p>2. Generate or create content in the Content Planner</p>
          <p>3. Schedule posts for specific dates/times</p>
          <p>4. The system publishes automatically when the time arrives</p>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<"profile" | "platforms" | "ai" | "notifications">("profile");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name || profile.full_name,
          full_name: profile.full_name,
          niche: profile.niche,
          brand_voice: profile.brand_voice,
          target_audience: profile.target_audience,
          goals: profile.goals,
          keywords: profile.keywords,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" style={{ color: "var(--muted)" }}>
        <Spinner size={20} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20" style={{ color: "var(--muted)" }}>
        <p>Failed to load profile.</p>
      </div>
    );
  }

  const sections = [
    { key: "profile", label: "Profile", icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    )},
    { key: "platforms", label: "Platforms", icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    )},
    { key: "ai", label: "AI Preferences", icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    )},
    { key: "notifications", label: "Notifications", icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Settings</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Configure your profile, platforms, and AI preferences</p>
        </div>
        {saved && (
          <span className="text-sm px-3 py-1 rounded-lg font-medium animate-fade-in" style={{ color: "var(--success)", background: "rgba(124, 184, 124, 0.1)" }}>✓ Saved</span>
        )}
      </div>

      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        <nav className="space-y-1">
          {sections.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key as typeof activeSection)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left"
              style={{
                background: activeSection === item.key ? "var(--lg-bg-strong)" : "transparent",
                color: activeSection === item.key ? "var(--foreground)" : "var(--muted)",
                border: activeSection === item.key ? "1px solid var(--lg-border)" : "1px solid transparent",
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          {activeSection === "profile" && (
            <div className="liquid-card p-6">
              <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Creator Profile</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] mb-2" style={{ color: "var(--muted)" }}>Full Name</label>
                  <input
                    type="text"
                    value={profile.full_name || ""}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl liquid-input text-sm"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] mb-2" style={{ color: "var(--muted)" }}>Email</label>
                  <input
                    type="email"
                    value={profile.email || ""}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl liquid-input text-sm opacity-60 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] mb-2" style={{ color: "var(--muted)" }}>Username</label>
                  <input
                    type="text"
                    value={profile.username || ""}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-xl liquid-input text-sm opacity-60 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.1em] mb-2" style={{ color: "var(--muted)" }}>Niche *</label>
                  <select
                    value={profile.niche || ""}
                    onChange={(e) => setProfile({ ...profile, niche: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl liquid-input text-sm"
                  >
                    <option value="">Select your niche</option>
                    {NICHE_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] uppercase tracking-[0.1em] mb-2" style={{ color: "var(--muted)" }}>Keywords</label>
                  <input
                    type="text"
                    value={(profile.keywords || []).join(", ")}
                    onChange={(e) => setProfile({ ...profile, keywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                    className="w-full px-4 py-2.5 rounded-xl liquid-input text-sm"
                    placeholder="AI tools, productivity, automation"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] uppercase tracking-[0.1em] mb-2" style={{ color: "var(--muted)" }}>Target Audience *</label>
                  <textarea
                    value={profile.target_audience || ""}
                    onChange={(e) => setProfile({ ...profile, target_audience: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl liquid-input text-sm min-h-[80px]"
                    placeholder="Describe your ideal follower..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] uppercase tracking-[0.1em] mb-2" style={{ color: "var(--muted)" }}>Goals</label>
                  <textarea
                    value={profile.goals || ""}
                    onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl liquid-input text-sm min-h-[80px]"
                    placeholder="One goal per line"
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !profile.niche || !profile.target_audience}
                className="mt-6 px-6 py-2.5 liquid-btn-primary transition-colors text-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {activeSection === "ai" && (
            <div className="space-y-6">
              <div className="liquid-card p-6">
                <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Brand Voice</h3>
                <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>Describe your brand voice so AI-generated content matches your style</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {VOICE_OPTIONS.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setProfile({ ...profile, brand_voice: voice.id })}
                      className="p-3 rounded-xl text-left transition-colors"
                      style={{
                        border: `1px solid ${profile.brand_voice === voice.id ? "var(--accent-copper)" : "var(--lg-border)"}`,
                        background: profile.brand_voice === voice.id ? "rgba(201, 168, 124, 0.08)" : "var(--lg-bg)",
                      }}
                    >
                      <p className="text-[13px] font-medium" style={{ color: "var(--foreground)" }}>{voice.label}</p>
                      <p className="text-[11px]" style={{ color: "var(--muted)" }}>{voice.description}</p>
                    </button>
                  ))}
                </div>
                <textarea
                  value={profile.brand_voice || ""}
                  onChange={(e) => setProfile({ ...profile, brand_voice: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl liquid-input text-sm min-h-[120px]"
                  placeholder="Friendly, practical, no-BS. Uses short sentences..."
                />
                <button onClick={handleSave} disabled={saving} className="mt-4 px-6 py-2.5 liquid-btn-primary transition-colors text-sm disabled:opacity-50">
                  {saving ? "Saving..." : "Save Brand Voice"}
                </button>
              </div>
            </div>
          )}

          {activeSection === "platforms" && <PlatformsSection />}

          {activeSection === "notifications" && (
            <div className="liquid-card p-6">
              <p className="text-[13px] text-center py-8" style={{ color: "var(--muted)" }}>
                Notification settings coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
