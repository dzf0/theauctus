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
          <h2 className="text-2xl font-bold text-white">Analytics & Growth</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track your audience growth and get AI-powered growth tactics
          </p>
        </div>
        <button
          onClick={() => setShowReferral(!showReferral)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          🎁 Referral Program
        </button>
      </div>

      {/* ── Tab navigation ──────────────────────────────────── */}
      <div className="flex items-center gap-1 glass-subtle p-1 rounded-xl w-fit">
        {[
          { key: "overview", label: "Overview" },
          { key: "platforms", label: "Platforms" },
          { key: "growth", label: "Growth Tactics" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded text-[12px] tracking-wide transition-colors ${
              activeTab === tab.key
                ? "bg-white text-white shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}
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
              {
                label: "Total Followers",
                value: growthMetrics.totalFollowers.toLocaleString(),
                change: `+${growthMetrics.followersGrowth.toLocaleString()}`,
                icon: "👥",
                color: "indigo",
              },
              {
                label: "Engagement Rate",
                value: `${growthMetrics.engagementRate}%`,
                change: "+0.6%",
                icon: "💬",
                color: "purple",
              },
              {
                label: "Total Reach",
                value: `${(growthMetrics.totalReach / 1000).toFixed(1)}K`,
                change: "+23%",
                icon: "📡",
                color: "amber",
              },
              {
                label: "Revenue",
                value: `$${growthMetrics.revenue.toLocaleString()}`,
                change: "+32%",
                icon: "💰",
                color: "green",
              },
            ].map((metric, i) => (
              <div key={i} className="glass-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{metric.icon}</span>
                  <span className="text-xs text-slate-500">{metric.label}</span>
                </div>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
                <span className="text-xs font-medium text-green-400">{metric.change} this month</span>
              </div>
            ))}
          </div>

          {/* Growth chart */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-6">Follower Growth</h3>
            <div className="relative h-64">
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-500 py-2">
                <span>{(Math.max(...growthMetrics.weeklyData.map((w) => w.followers)) / 1000).toFixed(0)}K</span>
                <span>{(Math.max(...growthMetrics.weeklyData.map((w) => w.followers)) / 2000).toFixed(0)}K</span>
                <span>0</span>
              </div>
              <div className="ml-10 h-full flex items-end gap-4">
                {growthMetrics.weeklyData.map((week, i) => {
                  const maxFollowers = Math.max(...growthMetrics.weeklyData.map((w) => w.followers));
                  const height = (week.followers / maxFollowers) * 100;
                  const maxHeight = 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-xs font-medium text-slate-300">
                        {(week.followers / 1000).toFixed(1)}K
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl transition-all duration-700 hover:from-indigo-700 hover:to-indigo-500"
                        style={{ height: `${(height / maxHeight) * 200}px` }}
                      />
                      <div className="text-xs text-slate-500">{week.week}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Engagement + Reach chart */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Engagement Over Time</h3>
              <div className="space-y-3">
                {growthMetrics.weeklyData.map((week, i) => {
                  const maxEngagement = Math.max(...growthMetrics.weeklyData.map((w) => w.engagement));
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-14 shrink-0">{week.week}</span>
                      <div className="flex-1 h-3 glass-subtle rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                          style={{ width: `${(week.engagement / maxEngagement) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-300 w-12 text-right">
                        {(week.engagement / 1000).toFixed(1)}K
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Reach Over Time</h3>
              <div className="space-y-3">
                {growthMetrics.weeklyData.map((week, i) => {
                  const maxReach = Math.max(...growthMetrics.weeklyData.map((w) => w.reach));
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-14 shrink-0">{week.week}</span>
                      <div className="flex-1 h-3 glass-subtle rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-700"
                          style={{ width: `${(week.reach / maxReach) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-300 w-12 text-right">
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
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">🏆 Top Performing Post</h3>
              <div className="glass-subtle glass-subtle p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2 py-0.5 rounded-lg text-xs font-medium"
                    style={{
                      backgroundColor: `${platformConfig[growthMetrics.topPerformingPost.platform].color}15`,
                      color: platformConfig[growthMetrics.topPerformingPost.platform].color,
                    }}
                  >
                    {platformConfig[growthMetrics.topPerformingPost.platform].icon}{" "}
                    {platformConfig[growthMetrics.topPerformingPost.platform].label}
                  </span>
                  <span className="text-xs text-slate-500">
                    {growthMetrics.topPerformingPost.publishedAt
                      ? new Date(growthMetrics.topPerformingPost.publishedAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white mb-1">
                  {growthMetrics.topPerformingPost.title}
                </p>
                <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                  {growthMetrics.topPerformingPost.content}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
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
              <div key={i} className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${config.color}15` }}
                  >
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{config.label}</h3>
                    <p className="text-sm text-slate-500">{platform.followers.toLocaleString()} followers</p>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-sm font-semibold text-green-400">
                      +{platform.growth.toLocaleString()}
                    </span>
                    <p className="text-xs text-slate-500">this month</p>
                  </div>
                </div>

                <div className="w-full h-3 glass-subtle rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(platform.followers / maxFollowers) * 100}%`,
                      backgroundColor: config.color,
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="glass-subtle glass-subtle p-3 text-center">
                    <p className="text-lg font-bold text-white">
                      {((platform.growth / platform.followers) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-slate-500">Growth rate</p>
                  </div>
                  <div className="glass-subtle glass-subtle p-3 text-center">
                    <p className="text-lg font-bold text-white">
                      ${(platform.followers * 0.02).toFixed(0)}
                    </p>
                    <p className="text-xs text-slate-500">Est. value/follower</p>
                  </div>
                  <div className="glass-subtle glass-subtle p-3 text-center">
                    <p className="text-lg font-bold text-white">
                      {Math.ceil(platform.followers / 1000)}
                    </p>
                    <p className="text-xs text-slate-500">Days to 10K</p>
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
          {/* AI-generated tactics */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">🎯 AI Growth Tactics</h3>
              <span className="text-xs glass-badge text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                Personalized for {creatorProfile.niche}
              </span>
            </div>
            <div className="space-y-3">
              {tactics.map((tactic, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl glass-subtle border border-white/[0.06] hover:border-indigo-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-400 flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm text-white">{tactic}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button className="text-xs text-indigo-400 hover:text-indigo-800 font-medium">
                        Add to queue →
                      </button>
                      <button className="text-xs text-slate-500 hover:text-slate-300">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor insights */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4">🔍 Competitor Insights</h3>
            <div className="space-y-3">
              {growthStrategy.competitorInsights.map((insight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg glass-subtle"
                >
                  <span className="text-amber-500">💡</span>
                  <p className="text-sm text-slate-300">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Best posting times */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4">⏰ Optimal Posting Times</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {growthStrategy.bestTimes.map((time, i) => {
                const config = platformConfig[time.platform];
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg glass-subtle"
                  >
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${config.color}15`,
                        color: config.color,
                      }}
                    >
                      {config.icon}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{time.time}</p>
                      <p className="text-xs text-slate-500">{time.day}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hashtag strategy */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4">#️⃣ Hashtag Strategy</h3>
            <div className="space-y-4">
              {growthStrategy.hashtags.map((group, i) => (
                <div key={i}>
                  <p className="text-sm font-medium text-slate-300 mb-2">{group.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 glass-badge text-indigo-300 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">🎁 Referral Program</h3>
              <button
                onClick={() => setShowReferral(false)}
                className="text-slate-500 hover:text-slate-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 glass-subtle p-4 mb-4">
              <p className="text-sm text-slate-400 mb-2">Your referral code</p>
              <div className="flex items-center gap-3">
                <code className="text-2xl font-bold text-indigo-400">ALEX20</code>
                <button className="px-3 py-1 glass-btn-primary text-xs">
                  Copy
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="glass-subtle glass-subtle p-3 text-center">
                <p className="text-xl font-bold text-white">23</p>
                <p className="text-xs text-slate-500">Referrals</p>
              </div>
              <div className="glass-subtle glass-subtle p-3 text-center">
                <p className="text-xl font-bold text-white">$230</p>
                <p className="text-xs text-slate-500">Credits earned</p>
              </div>
              <div className="glass-subtle glass-subtle p-3 text-center">
                <p className="text-xl font-bold text-white">🥈</p>
                <p className="text-xs text-slate-500">Silver tier</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500">🥉 Bronze:</span>
                <span className="text-slate-300">1-10 referrals → $10 credit each</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500">🥈 Silver:</span>
                <span className="text-slate-300">11-50 referrals → $15 credit each</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-slate-500">🥇 Gold:</span>
                <span className="text-slate-300">51+ referrals → 1 month free per 10 referrals</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
