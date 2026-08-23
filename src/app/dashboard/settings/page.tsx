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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure your profile, platforms, and AI preferences
          </p>
        </div>
        {saved && (
          <span className="text-sm text-green-400 bg-green-50 px-3 py-1 rounded-lg font-medium animate-fade-in">
            ✓ Saved
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        {/* ── Section nav ──────────────────────────────────── */}
        <nav className="space-y-1">
          {[
            { key: "profile", label: "Profile", icon: "👤" },
            { key: "platforms", label: "Platforms", icon: "🔗" },
            { key: "ai", label: "AI Preferences", icon: "🧠" },
            { key: "notifications", label: "Notifications", icon: "🔔" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key as typeof activeSection)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                activeSection === item.key
                  ? "glass-badge text-indigo-300"
                  : "text-slate-400 hover:glass-subtle"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* ── Content ──────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Profile section */}
          {activeSection === "profile" && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Creator Profile</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Niche</label>
                  <input
                    type="text"
                    value={profile.niche}
                    onChange={(e) => setProfile({ ...profile, niche: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Keywords</label>
                  <input
                    type="text"
                    value={profile.keywords}
                    onChange={(e) => setProfile({ ...profile, keywords: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="Comma-separated keywords"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Target Audience</label>
                  <textarea
                    value={profile.targetAudience}
                    onChange={(e) => setProfile({ ...profile, targetAudience: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[80px]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Goals</label>
                  <textarea
                    value={profile.goals}
                    onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[80px]"
                    placeholder="One goal per line"
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                className="mt-6 px-6 py-2.5 glass-btn-primary transition-colors text-sm"
              >
                Save Changes
              </button>
            </div>
          )}

          {/* Platforms section */}
          {activeSection === "platforms" && (
            <div className="space-y-4">
              <div className="glass-card p-6">
                <h3 className="font-semibold text-white mb-4">Connected Platforms</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Connect your social platforms to auto-publish content and track analytics
                </p>
                <div className="space-y-3">
                  {creatorProfile.platforms.map((platform) => {
                    const config = platformConfig[platform.platform];
                    return (
                      <div
                        key={platform.platform}
                        className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.08] hover:border-gray-300 transition-colors"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${config.color}15` }}
                        >
                          {config.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{config.label}</p>
                          {platform.connected ? (
                            <p className="text-xs text-slate-500">
                              {platform.username} · {platform.followers?.toLocaleString()} followers
                            </p>
                          ) : (
                            <p className="text-xs text-slate-500">Not connected</p>
                          )}
                        </div>
                        {platform.connected ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-400 bg-green-50 px-2 py-0.5 rounded-full">
                              Connected
                            </span>
                            <button className="text-xs text-slate-500 hover:text-slate-300">
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                            Connect
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* AI Preferences section */}
          {activeSection === "ai" && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-semibold text-white mb-4">Brand Voice</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Describe your brand voice so AI-generated content matches your style
                </p>
                <textarea
                  value={profile.brandVoice}
                  onChange={(e) => setProfile({ ...profile, brandVoice: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[120px]"
                />
                <button
                  onClick={handleSave}
                  className="mt-4 px-6 py-2.5 glass-btn-primary transition-colors text-sm"
                >
                  Save Brand Voice
                </button>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-semibold text-white mb-4">AI Behavior</h3>
                <div className="space-y-4">
                  {[
                    {
                      label: "Auto-generate weekly content",
                      description: "AI will automatically plan content every Monday",
                      enabled: true,
                    },
                    {
                      label: "Auto-approve posts under 200 chars",
                      description: "Short text posts skip the review queue",
                      enabled: false,
                    },
                    {
                      label: "Include trending topics",
                      description: "AI will incorporate current trends into your content",
                      enabled: true,
                    },
                    {
                      label: "A/B test headlines",
                      description: "Generate 2 variations and track which performs better",
                      enabled: true,
                    },
                  ].map((setting, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg glass-subtle"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{setting.label}</p>
                        <p className="text-xs text-slate-500">{setting.description}</p>
                      </div>
                      <button
                        className={`w-10 h-6 rounded-full transition-colors ${
                          setting.enabled ? "bg-indigo-600" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform mx-1 ${
                            setting.enabled ? "translate-x-4" : ""
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications section */}
          {activeSection === "notifications" && (
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: "Content published", description: "When a post goes live", email: true, push: true },
                  { label: "Engagement milestones", description: "When you hit follower/engagement goals", email: true, push: true },
                  { label: "Weekly analytics report", description: "Summary every Monday", email: true, push: false },
                  { label: "AI content ready for review", description: "When new content is generated", email: false, push: true },
                  { label: "Platform connection issues", description: "When a platform disconnects", email: true, push: true },
                  { label: "Billing reminders", description: "7 days before renewal", email: true, push: false },
                ].map((notif, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-lg glass-subtle"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{notif.label}</p>
                      <p className="text-xs text-slate-500">{notif.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 text-xs text-slate-500">
                        <input type="checkbox" defaultChecked={notif.email} className="rounded border-gray-300" />
                        Email
                      </label>
                      <label className="flex items-center gap-1 text-xs text-slate-500">
                        <input type="checkbox" defaultChecked={notif.push} className="rounded border-gray-300" />
                        Push
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSave}
                className="mt-6 px-6 py-2.5 glass-btn-primary transition-colors text-sm"
              >
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
