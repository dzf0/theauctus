"use client";

import { useState } from "react";
import { growthMetrics, platformConfig, growthStrategy, creatorProfile } from "@/lib/store";
import { generateGrowthTactics } from "@/lib/ai";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "platforms" | "growth">("overview");
  const [showReferral, setShowReferral] = useState(false);

  const tactics = generateGrowthTactics(creatorProfile.niche, growthMetrics.totalFollowers);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Analytics & Growth</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Track your audience growth and get AI-powered growth tactics
          </p>
        </div>
        <button
          onClick={() => setShowReferral(!showReferral)}
          className="px-4 py-2 text-sm font-medium rounded-xl liquid-btn-primary"
        >
          🎁 Referral Program
        </button>
      </div>

      {/* ── Tab navigation ──────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
        {[
          { key: "overview", label: "Overview" },
          { key: "platforms", label: "Platforms" },
          { key: "growth", label: "Growth Tactics" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className="px-4 py-2 rounded text-[12px] tracking-wide transition-colors"
            style={{
              background: activeTab === tab.key ? "var(--lg-bg-strong)" : "transparent",
              color: activeTab === tab.key ? "var(--foreground)" : "var(--muted)",
              border: activeTab === tab.key ? "1px solid var(--lg-border)" : "1px solid transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Followers", value: growthMetrics.totalFollowers.toLocaleString(), change: `+${growthMetrics.followersGrowth.toLocaleString()}`, icon: "👥" },
              { label: "Engagement Rate", value: `${growthMetrics.engagementRate}%`, change: "+0.6%", icon: "💬" },
              { label: "Total Reach", value: `${(growthMetrics.totalReach / 1000).toFixed(1)}K`, change: "+23%", icon: "📡" },
              { label: "Revenue", value: `$${growthMetrics.revenue.toLocaleString()}`, change: "+32%", icon: "💰" },
            ].map((metric, i) => (
              <div key={i} className="liquid-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{metric.icon}</span>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>{metric.label}</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{metric.value}</p>
                <span className="text-xs font-medium" style={{ color: "var(--success)" }}>{metric.change} this month</span>
              </div>
            ))}
          </div>

          {/* Growth chart */}
          <div className="liquid-card p-6">
            <h3 className="font-semibold mb-6" style={{ color: "var(--foreground)" }}>Follower Growth</h3>
            <div className="relative h-64">
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs py-2" style={{ color: "var(--muted)" }}>
                <span>{(Math.max(...growthMetrics.weeklyData.map((w) => w.followers)) / 1000).toFixed(0)}K</span>
                <span>{(Math.max(...growthMetrics.weeklyData.map((w) => w.followers)) / 2000).toFixed(0)}K</span>
                <span>0</span>
              </div>
              <div className="ml-10 h-full flex items-end gap-4">
                {growthMetrics.weeklyData.map((week, i) => {
                  const maxFollowers = Math.max(...growthMetrics.weeklyData.map((w) => w.followers));
                  const height = (week.followers / maxFollowers) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-xs font-medium" style={{ color: "var(--foreground)" }}>
                        {(week.followers / 1000).toFixed(1)}K
                      </div>
                      <div
                        className="w-full rounded-t-xl transition-all duration-700"
                        style={{ height: `${(height / 100) * 200}px`, background: "linear-gradient(180deg, var(--accent-copper), var(--primary-dark))" }}
                      />
                      <div className="text-xs" style={{ color: "var(--muted)" }}>{week.week}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Engagement + Reach chart */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="liquid-card p-6">
              <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Engagement Over Time</h3>
              <div className="space-y-3">
                {growthMetrics.weeklyData.map((week, i) => {
                  const maxEngagement = Math.max(...growthMetrics.weeklyData.map((w) => w.engagement));
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs w-14 shrink-0" style={{ color: "var(--muted)" }}>{week.week}</span>
                      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "var(--lg-bg)" }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(week.engagement / maxEngagement) * 100}%`, background: "linear-gradient(90deg, var(--accent-rose), var(--danger))" }} />
                      </div>
                      <span className="text-xs font-medium w-12 text-right" style={{ color: "var(--foreground)" }}>
                        {(week.engagement / 1000).toFixed(1)}K
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="liquid-card p-6">
              <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Reach Over Time</h3>
              <div className="space-y-3">
                {growthMetrics.weeklyData.map((week, i) => {
                  const maxReach = Math.max(...growthMetrics.weeklyData.map((w) => w.reach));
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs w-14 shrink-0" style={{ color: "var(--muted)" }}>{week.week}</span>
                      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "var(--lg-bg)" }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(week.reach / maxReach) * 100}%`, background: "linear-gradient(90deg, var(--info), var(--primary))" }} />
                      </div>
                      <span className="text-xs font-medium w-12 text-right" style={{ color: "var(--foreground)" }}>
                        {(week.reach / 1000).toFixed(0)}K
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top performing post */}
          {growthMetrics.topPerformingPost && (
            <div className="liquid-card p-6">
              <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>🏆 Top Performing Post</h3>
              <div className="p-4 rounded-xl" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-lg text-xs font-medium" style={{ backgroundColor: `${platformConfig[growthMetrics.topPerformingPost.platform].color}15`, color: platformConfig[growthMetrics.topPerformingPost.platform].color }}>
                    {platformConfig[growthMetrics.topPerformingPost.platform].icon} {platformConfig[growthMetrics.topPerformingPost.platform].label}
                  </span>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    {growthMetrics.topPerformingPost.publishedAt ? new Date(growthMetrics.topPerformingPost.publishedAt).toLocaleDateString() : ""}
                  </span>
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                  {growthMetrics.topPerformingPost.title}
                </p>
                <p className="text-sm line-clamp-2 mb-3" style={{ color: "var(--muted)" }}>
                  {growthMetrics.topPerformingPost.content}
                </p>
                <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
                  <span>❤️ {growthMetrics.topPerformingPost.engagement.likes.toLocaleString()}</span>
                  <span>💬 {growthMetrics.topPerformingPost.engagement.comments.toLocaleString()}</span>
                  <span>🔄 {growthMetrics.topPerformingPost.engagement.shares.toLocaleString()}</span>
                  <span>🔖 {growthMetrics.topPerformingPost.engagement.saves.toLocaleString()}</span>
                  <span>📡 {(growthMetrics.topPerformingPost.engagement.reach / 1000).toFixed(1)}K reach</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Platforms Tab ───────────────────────────────────── */}
      {activeTab === "platforms" && (
        <div className="space-y-6">
          {growthMetrics.platformBreakdown.map((platform, i) => {
            const config = platformConfig[platform.platform];
            const maxFollowers = Math.max(...growthMetrics.platformBreakdown.map((p) => p.followers));
            return (
              <div key={i} className="liquid-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${config.color}15` }}>
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>{config.label}</h3>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>{platform.followers.toLocaleString()} followers</p>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-sm font-semibold" style={{ color: "var(--success)" }}>+{platform.growth.toLocaleString()}</span>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>this month</p>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden mb-4" style={{ background: "var(--lg-bg)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(platform.followers / maxFollowers) * 100}%`, backgroundColor: config.color }} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 text-center rounded-xl" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                    <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{((platform.growth / platform.followers) * 100).toFixed(1)}%</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>Growth rate</p>
                  </div>
                  <div className="p-3 text-center rounded-xl" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                    <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>${(platform.followers * 0.02).toFixed(0)}</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>Est. value/follower</p>
                  </div>
                  <div className="p-3 text-center rounded-xl" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                    <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{Math.ceil(platform.followers / 1000)}</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>Days to 10K</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Growth Tactics Tab ──────────────────────────────── */}
      {activeTab === "growth" && (
        <div className="space-y-6">
          <div className="liquid-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>🎯 AI Growth Tactics</h3>
              <span className="text-xs liquid-badge">Personalized for {creatorProfile.niche}</span>
            </div>
            <div className="space-y-3">
              {tactics.map((tactic, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "rgba(201, 168, 124, 0.1)", color: "var(--accent-copper)" }}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: "var(--foreground)" }}>{tactic}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button className="text-xs font-medium accent-text hover:opacity-80">Add to queue →</button>
                      <button className="text-xs hover:opacity-80" style={{ color: "var(--muted)" }}>Dismiss</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="liquid-card p-6">
            <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>🔍 Competitor Insights</h3>
            <div className="space-y-3">
              {growthStrategy.competitorInsights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "var(--lg-bg)" }}>
                  <span>💡</span>
                  <p className="text-sm" style={{ color: "var(--foreground)" }}>{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="liquid-card p-6">
            <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>⏰ Optimal Posting Times</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {growthStrategy.bestTimes.map((time, i) => {
                const config = platformConfig[time.platform];
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--lg-bg)" }}>
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${config.color}15`, color: config.color }}>{config.icon}</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{time.time}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{time.day}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="liquid-card p-6">
            <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>#️⃣ Hashtag Strategy</h3>
            <div className="space-y-4">
              {growthStrategy.hashtags.map((group, i) => (
                <div key={i}>
                  <p className="text-sm font-medium mb-2" style={{ color: "var(--foreground)" }}>{group.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 liquid-badge rounded-full text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Referral modal ──────────────────────────────────── */}
      {showReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="liquid-card max-w-lg w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>🎁 Referral Program</h3>
              <button onClick={() => setShowReferral(false)} className="hover:opacity-70" style={{ color: "var(--muted)" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 mb-4 rounded-xl" style={{ background: "rgba(201, 168, 124, 0.1)", border: "1px solid rgba(201, 168, 124, 0.2)" }}>
              <p className="text-sm mb-2" style={{ color: "var(--muted)" }}>Your referral code</p>
              <div className="flex items-center gap-3">
                <code className="text-2xl font-bold accent-text">ALEX20</code>
                <button className="px-3 py-1 liquid-btn-primary text-xs">Copy</button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 text-center rounded-xl" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>23</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>Referrals</p>
              </div>
              <div className="p-3 text-center rounded-xl" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>$230</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>Credits earned</p>
              </div>
              <div className="p-3 text-center rounded-xl" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                <p className="text-xl font-bold">🥈</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>Silver tier</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <span style={{ color: "var(--muted)" }}>🥉 Bronze:</span>
                <span style={{ color: "var(--foreground)" }}>1-10 referrals → $10 credit each</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span style={{ color: "var(--muted)" }}>🥈 Silver:</span>
                <span style={{ color: "var(--foreground)" }}>11-50 referrals → $15 credit each</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span style={{ color: "var(--muted)" }}>🥇 Gold:</span>
                <span style={{ color: "var(--foreground)" }}>51+ referrals → 1 month free per 10 referrals</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
