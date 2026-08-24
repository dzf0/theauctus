"use client";

import { useState } from "react";
import { creatorProfile, platformConfig } from "@/lib/store";
import type { Platform } from "@/lib/types";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<"profile" | "platforms" | "ai" | "notifications">("profile");
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: creatorProfile.name,
    email: creatorProfile.email,
    niche: creatorProfile.niche,
    targetAudience: creatorProfile.targetAudience,
    brandVoice: creatorProfile.brandVoice,
    keywords: creatorProfile.keywords.join(", "),
    goals: creatorProfile.goals.join("\n"),
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    { key: "profile", label: "Profile", icon: "👤" },
    { key: "platforms", label: "Platforms", icon: "🔗" },
    { key: "ai", label: "AI Preferences", icon: "🧠" },
    { key: "notifications", label: "Notifications", icon: "🔔" },
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
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          {activeSection === "profile" && (
            <div className="liquid-card p-6">
              <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Creator Profile</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "Name", key: "name", type: "text" },
                  { label: "Email", key: "email", type: "email" },
                  { label: "Niche", key: "niche", type: "text" },
                  { label: "Keywords", key: "keywords", type: "text", placeholder: "Comma-separated keywords" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>{field.label}</label>
                    <input
                      type={field.type}
                      value={(profile as Record<string, string>)[field.key]}
                      onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl liquid-input text-sm"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Target Audience</label>
                  <textarea value={profile.targetAudience} onChange={(e) => setProfile({ ...profile, targetAudience: e.target.value })} className="w-full px-4 py-2.5 rounded-xl liquid-input text-sm min-h-[80px]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>Goals</label>
                  <textarea value={profile.goals} onChange={(e) => setProfile({ ...profile, goals: e.target.value })} className="w-full px-4 py-2.5 rounded-xl liquid-input text-sm min-h-[80px]" placeholder="One goal per line" />
                </div>
              </div>
              <button onClick={handleSave} className="mt-6 px-6 py-2.5 liquid-btn-primary transition-colors text-sm">Save Changes</button>
            </div>
          )}

          {activeSection === "platforms" && (
            <div className="liquid-card p-6">
              <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Connected Platforms</h3>
              <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>Connect your social platforms to auto-publish content and track analytics</p>
              <div className="space-y-3">
                {creatorProfile.platforms.map((platform) => {
                  const config = platformConfig[platform.platform];
                  return (
                    <div key={platform.platform} className="flex items-center gap-4 p-4 rounded-xl" style={{ border: "1px solid var(--lg-border)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${config.color}15` }}>{config.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{config.label}</p>
                        {platform.connected ? (
                          <p className="text-xs" style={{ color: "var(--muted)" }}>{platform.username} · {platform.followers?.toLocaleString()} followers</p>
                        ) : (
                          <p className="text-xs" style={{ color: "var(--muted)" }}>Not connected</p>
                        )}
                      </div>
                      {platform.connected ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(124, 184, 124, 0.1)", color: "var(--success)" }}>Connected</span>
                          <button className="text-xs hover:opacity-80" style={{ color: "var(--muted)" }}>Disconnect</button>
                        </div>
                      ) : (
                        <button className="px-4 py-2 text-xs font-medium rounded-lg liquid-btn-primary">Connect</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSection === "ai" && (
            <div className="space-y-6">
              <div className="liquid-card p-6">
                <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Brand Voice</h3>
                <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>Describe your brand voice so AI-generated content matches your style</p>
                <textarea value={profile.brandVoice} onChange={(e) => setProfile({ ...profile, brandVoice: e.target.value })} className="w-full px-4 py-2.5 rounded-xl liquid-input text-sm min-h-[120px]" />
                <button onClick={handleSave} className="mt-4 px-6 py-2.5 liquid-btn-primary transition-colors text-sm">Save Brand Voice</button>
              </div>
              <div className="liquid-card p-6">
                <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>AI Behavior</h3>
                <div className="space-y-4">
                  {[
                    { label: "Auto-generate weekly content", description: "AI will automatically plan content every Monday", enabled: true },
                    { label: "Include trending topics", description: "AI will incorporate current trends into your content", enabled: true },
                    { label: "A/B test headlines", description: "Generate 2 variations and track which performs better", enabled: true },
                  ].map((setting, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "var(--lg-bg)" }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{setting.label}</p>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>{setting.description}</p>
                      </div>
                      <button className="w-10 h-6 rounded-full transition-colors" style={{ background: setting.enabled ? "var(--accent-copper)" : "var(--lg-border)" }}>
                        <div className="w-4 h-4 bg-white rounded-full transition-transform mx-1" style={{ transform: setting.enabled ? "translateX(16px)" : "translateX(0)" }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="liquid-card p-6">
              <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: "Content published", description: "When a post goes live", email: true, push: true },
                  { label: "Engagement milestones", description: "When you hit follower/engagement goals", email: true, push: true },
                  { label: "Weekly analytics report", description: "Summary every Monday", email: true, push: false },
                  { label: "AI content ready for review", description: "When new content is generated", email: false, push: true },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg" style={{ background: "var(--lg-bg)" }}>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{notif.label}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{notif.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 text-xs" style={{ color: "var(--muted)" }}>
                        <input type="checkbox" defaultChecked={notif.email} className="rounded" /> Email
                      </label>
                      <label className="flex items-center gap-1 text-xs" style={{ color: "var(--muted)" }}>
                        <input type="checkbox" defaultChecked={notif.push} className="rounded" /> Push
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleSave} className="mt-6 px-6 py-2.5 liquid-btn-primary transition-colors text-sm">Save Preferences</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
