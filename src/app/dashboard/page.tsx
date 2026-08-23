"use client";

import { growthMetrics, mockPosts, creatorProfile } from "@/lib/store";
import { platformConfig } from "@/lib/store";
import Link from "next/link";

export default function DashboardPage() {
  const upcomingPosts = mockPosts
    .filter((p) => p.status === "scheduled")
    .sort((a, b) => (a.scheduledAt || "").localeCompare(b.scheduledAt || ""))
    .slice(0, 5);

  return (
    <div className="space-y-16 animate-fade-in">
      {/* ── Welcome — editorial headline ──────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] accent-text mb-3">
            {creatorProfile.niche}
          </p>
          <h2 className="font-headline text-4xl sm:text-5xl text-[#f5f0eb] leading-[1.05]">
            Welcome back,
            <br />
            <span className="text-[#6b6560]">{creatorProfile.name.split(" ")[0]}.</span>
          </h2>
          <p className="text-[13px] text-[#6b6560] mt-3">
            {upcomingPosts.length} posts scheduled this week.
          </p>
        </div>
        <Link
          href="/dashboard/planner"
          className="glass-btn-primary inline-flex items-center gap-2 text-[11px]"
        >
          + Generate Content
        </Link>
      </div>

      {/* ── Metrics — editorial large numbers ─────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04]">
        {[
          {
            value: growthMetrics.totalFollowers.toLocaleString(),
            label: "Followers",
            change: `+${growthMetrics.followersGrowth.toLocaleString()}`,
          },
          {
            value: `${growthMetrics.engagementRate}%`,
            label: "Engagement",
            change: "+0.6%",
          },
          {
            value: `${(growthMetrics.totalReach / 1000).toFixed(1)}K`,
            label: "Reach",
            change: "+23%",
          },
          {
            value: growthMetrics.postsPublished.toString(),
            label: "Published",
            change: "+12",
          },
        ].map((metric, i) => (
          <div key={i} className="p-6 bg-[#111] hover:bg-white/[0.02] transition-colors">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#6b6560] mb-2">{metric.label}</p>
            <p className="font-headline text-4xl sm:text-5xl text-[#f5f0eb] tracking-tight mb-2">{metric.value}</p>
            <p className="text-[11px] accent-text">{metric.change} this month</p>
          </div>
        ))}
      </div>

      {/* ── Growth chart + Platforms ──────────────────────── */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-px bg-white/[0.04]">
        {/* Growth chart */}
        <div className="p-6 bg-[#111]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-headline text-lg text-[#f5f0eb]">Growth Overview</h3>
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#6b6560]">Last 6 weeks</span>
          </div>
          <div className="relative h-48">
            <div className="absolute inset-0 flex items-end">
              {growthMetrics.weeklyData.map((week, i) => {
                const maxFollowers = Math.max(
                  ...growthMetrics.weeklyData.map((w) => w.followers)
                );
                const height = (week.followers / maxFollowers) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 px-1">
                    <div
                      className="w-full rounded-t-sm transition-all duration-500"
                      style={{
                        height: `${height}%`,
                        background: `linear-gradient(to top, rgba(201, 168, 124, 0.6), rgba(201, 168, 124, 0.2))`,
                      }}
                    />
                    <span className="text-[9px] text-[#6b6560]">{week.week}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent-copper rounded-full"></div>
              <span className="text-[10px] uppercase tracking-[0.1em] text-[#6b6560]">Followers</span>
            </div>
            <span className="text-[10px] text-[#6b6560]">
              +{growthMetrics.followersGrowth.toLocaleString()} growth
            </span>
          </div>
        </div>

        {/* Platforms */}
        <div className="p-6 bg-[#111]">
          <h3 className="font-headline text-lg text-[#f5f0eb] mb-6">Platforms</h3>
          <div className="space-y-5">
            {growthMetrics.platformBreakdown.map((platform, i) => {
              const config = platformConfig[platform.platform];
              const maxFollowers = Math.max(
                ...growthMetrics.platformBreakdown.map((p) => p.followers)
              );
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{config.icon}</span>
                      <span className="text-[12px] text-[#9a9590]">{config.label}</span>
                    </div>
                    <span className="font-headline text-sm text-[#f5f0eb]">
                      {(platform.followers / 1000).toFixed(1)}K
                    </span>
                  </div>
                  <div className="w-full h-[2px] bg-white/[0.04] overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(platform.followers / maxFollowers) * 100}%`,
                        backgroundColor: config.color,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <p className="text-[10px] accent-text mt-1">+{platform.growth.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Upcoming + Revenue ────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-px bg-white/[0.04]">
        {/* Upcoming posts */}
        <div className="p-6 bg-[#111]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline text-lg text-[#f5f0eb]">Upcoming</h3>
            <Link href="/dashboard/queue" className="text-[10px] uppercase tracking-[0.12em] accent-text hover:text-[#dcc4a0] transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-0">
            {upcomingPosts.map((post, i) => {
              const config = platformConfig[post.platform];
              return (
                <div
                  key={post.id}
                  className={`flex items-start gap-4 py-4 ${
                    i > 0 ? "border-t border-white/[0.04]" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#f5f0eb] truncate">{post.title}</p>
                    <p className="text-[11px] text-[#6b6560] mt-1">
                      {config.icon} {config.label} ·{" "}
                      {post.scheduledAt
                        ? new Date(post.scheduledAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "TBD"}
                    </p>
                  </div>
                  <span className="glass-badge text-[9px] shrink-0">{post.contentType}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue */}
        <div className="p-6 bg-[#111]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline text-lg text-[#f5f0eb]">Revenue</h3>
            <Link href="/dashboard/analytics" className="text-[10px] uppercase tracking-[0.12em] accent-text hover:text-[#dcc4a0] transition-colors">
              Details →
            </Link>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#6b6560] mb-1">Monthly</p>
              <p className="font-headline text-5xl text-[#f5f0eb] tracking-tight">
                ${growthMetrics.revenue.toLocaleString()}
              </p>
            </div>
            <div className="editorial-divider" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#6b6560] mb-1">Subscribers</p>
              <p className="font-headline text-3xl text-[#f5f0eb] tracking-tight">
                {growthMetrics.subscribers}
              </p>
            </div>
            <div className="editorial-divider" />
            <div className="flex items-center gap-2">
              <span className="text-[11px] accent-text font-medium">+32%</span>
              <span className="text-[11px] text-[#6b6560]">vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Growth tactics — editorial ─────────────────────── */}
      <div className="p-6 bg-[#111] border border-white/[0.04]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-headline text-lg text-[#f5f0eb]">Growth Tactics</h3>
          <span className="glass-badge text-[9px]">AI-generated</span>
        </div>
        <div className="grid md:grid-cols-2 gap-px bg-white/[0.04]">
          {[
            'Create a "AI Productivity Starter Pack" thread — resource threads get 3-5x more bookmarks',
            "Post 2 carousel posts on LinkedIn — carousels get 2.3x more saves",
            "Spend 20 min/day replying to top creators for visibility",
            "Repurpose your top tweet into an Instagram Reel — video gets 3x reach",
          ].map((tactic, i) => (
            <div
              key={i}
              className="p-5 bg-[#111]"
            >
              <span className="font-headline text-2xl text-[#2a2a2a] block mb-2">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[13px] text-[#9a9590] leading-relaxed">{tactic}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
