"use client";

import { useState, useMemo } from "react";
import { growthStrategy, creatorProfile, mockPosts } from "@/lib/store";
import { generateCalendar } from "@/lib/ai";
import { platformConfig } from "@/lib/store";
import type { ContentPost, Platform } from "@/lib/types";

type ViewMode = "calendar" | "list";

export default function PlannerPage() {
  const [selectedMonth, setSelectedMonth] = useState("2026-09");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [calendarPosts, setCalendarPosts] = useState<ContentPost[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<Platform | "all">("all");
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Combine pre-seeded posts with generated posts
  const allPosts = useMemo(() => {
    const scheduled = mockPosts.filter((p) => p.status === "scheduled" || p.status === "draft");
    const generated = calendarPosts;
    return [...scheduled, ...generated];
  }, [calendarPosts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    if (filterPlatform === "all") return allPosts;
    return allPosts.filter((p) => p.platform === filterPlatform);
  }, [allPosts, filterPlatform]);

  // Group posts by day for calendar view
  const postsByDay = useMemo(() => {
    const map: Record<number, ContentPost[]> = {};
    filteredPosts.forEach((post) => {
      const dateStr = post.scheduledAt || post.publishedAt;
      if (!dateStr) return;
      const day = new Date(dateStr).getDate();
      if (!map[day]) map[day] = [];
      map[day].push(post);
    });
    return map;
  }, [filteredPosts]);

  // Calendar grid
  const calendarDays = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    return { firstDay, daysInMonth, year, month };
  }, [selectedMonth]);

  const handleGenerate = async () => {
    setGenerating(true);
    // Simulate AI generation time
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const posts = generateCalendar(growthStrategy, selectedMonth);
    setCalendarPosts(posts);
    setGenerated(true);
    setGenerating(false);
  };

  const handleApprove = (postId: string) => {
    setCalendarPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status: "scheduled" as const } : p))
    );
  };

  const handleApproveAll = () => {
    setCalendarPosts((prev) =>
      prev.map((p) => (p.status === "draft" ? { ...p, status: "scheduled" as const } : p))
    );
  };

  const handleEdit = (postId: string) => {
    const post = allPosts.find((p) => p.id === postId);
    if (post) {
      setEditingPost(postId);
      setEditContent(post.content);
    }
  };

  const handleSaveEdit = () => {
    if (editingPost) {
      setCalendarPosts((prev) =>
        prev.map((p) => (p.id === editingPost ? { ...p, content: editContent } : p))
      );
      setEditingPost(null);
    }
  };

  const monthName = new Date(calendarDays.year, calendarDays.month - 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Content Planner</h2>
          <p className="text-sm text-slate-500 mt-1">
            Generate a 30-day content calendar optimized for your niche and platforms
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-3 py-1.5 rounded text-[12px] tracking-wide transition-colors ${
              viewMode === "calendar"
                ? "glass-btn-primary"
                : "glass-subtle text-slate-400 hover:bg-white/[0.1]"
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded text-[12px] tracking-wide transition-colors ${
              viewMode === "list"
                ? "glass-btn-primary"
                : "glass-subtle text-slate-400 hover:bg-white/[0.1]"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* ── Generation controls ─────────────────────────────── */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Target Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Niche
            </label>
            <input
              type="text"
              value={creatorProfile.niche}
              readOnly
              className="w-full px-4 py-2.5 rounded-xl border border-white/[0.08] glass-subtle text-sm text-slate-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Platforms
            </label>
            <div className="flex flex-wrap gap-2">
              {creatorProfile.platforms
                .filter((p) => p.connected)
                .map((p) => (
                  <span
                    key={p.platform}
                    className="px-3 py-1.5 glass-subtle rounded-lg text-xs font-medium text-slate-300"
                  >
                    {platformConfig[p.platform].icon} {platformConfig[p.platform].label}
                  </span>
                ))}
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-2.5 glass-btn-primary transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 spinner" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {generated ? "Regenerate" : "Generate Calendar"}
              </span>
            )}
          </button>
        </div>

        {/* Strategy preview */}
        {generated && (
          <div className="mt-6 pt-6 border-t border-white/[0.06] animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Content Pillars</h3>
              {calendarPosts.length > 0 && (
                <button
                  onClick={handleApproveAll}
                  className="text-xs text-green-400 hover:text-green-300 font-medium"
                >
                  Approve all drafts →
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {growthStrategy.pillars.map((pillar, i) => (
                <div key={i} className="glass-subtle glass-subtle p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{pillar.name}</span>
                    <span className="text-xs text-slate-500">{pillar.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${pillar.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Platform filter ─────────────────────────────────── */}
      {generated && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterPlatform("all")}
            className={`px-3 py-1.5 rounded text-[10px] uppercase tracking-[0.1em] whitespace-nowrap transition-colors ${
              filterPlatform === "all"
                ? "glass-btn-primary"
                : "glass-subtle text-slate-400 hover:bg-white/[0.1]"
            }`}
          >
            All ({allPosts.length})
          </button>
          {(["twitter", "linkedin", "instagram", "youtube", "tiktok", "threads"] as Platform[]).map(
            (platform) => {
              const count = allPosts.filter((p) => p.platform === platform).length;
              if (count === 0) return null;
              const config = platformConfig[platform];
              return (
                <button
                  key={platform}
                  onClick={() => setFilterPlatform(platform)}
                  className={`px-3 py-1.5 rounded text-[10px] uppercase tracking-[0.1em] whitespace-nowrap transition-colors ${
                    filterPlatform === platform
                      ? "glass-btn-primary"
                      : "glass-subtle text-slate-400 hover:bg-white/[0.1]"
                  }`}
                >
                  {config.icon} {config.label} ({count})
                </button>
              );
            }
          )}
        </div>
      )}

      {/* ── Calendar view ───────────────────────────────────── */}
      {generated && viewMode === "calendar" && (
        <div className="glass-card overflow-hidden animate-fade-in">
          {/* Month header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h3 className="font-semibold text-white">{monthName}</h3>
            <span className="text-sm text-slate-500">
              {filteredPosts.length} posts scheduled
            </span>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-white/[0.06]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2 text-center text-xs font-medium text-slate-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells before month starts */}
            {Array.from({ length: calendarDays.firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-28 border-b border-r border-white/[0.06] p-1" />
            ))}

            {/* Day cells */}
            {Array.from({ length: calendarDays.daysInMonth }).map((_, i) => {
              const day = i + 1;
              const posts = postsByDay[day] || [];
              const isSelected = selectedDay === day;
              const isToday = new Date().getDate() === day && new Date().getMonth() === calendarDays.month - 1;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`h-28 border-b border-r border-white/[0.06] p-1 cursor-pointer transition-colors ${
                    isSelected ? "bg-indigo-50" : "hover:glass-subtle"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-medium ${
                        isToday
                          ? "w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center"
                          : "text-slate-300"
                      }`}
                    >
                      {day}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {posts.slice(0, 3).map((post) => {
                      const config = platformConfig[post.platform];
                      return (
                        <div
                          key={post.id}
                          className="text-[9px] leading-tight px-1 py-0.5 rounded truncate"
                          style={{
                            backgroundColor: `${config.color}15`,
                            color: config.color,
                          }}
                        >
                          {config.icon} {post.title.slice(0, 20)}...
                        </div>
                      );
                    })}
                    {posts.length > 3 && (
                      <span className="text-[9px] text-slate-500">
                        +{posts.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── List view ────────────────────────────────────────── */}
      {generated && viewMode === "list" && (
        <div className="space-y-3 animate-fade-in">
          {filteredPosts.map((post) => {
            const config = platformConfig[post.platform];
            const isEditing = editingPost === post.id;

            return (
              <div
                key={post.id}
                className="glass-card p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: `${config.color}15` }}
                  >
                    {config.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${config.color}15`,
                          color: config.color,
                        }}
                      >
                        {config.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        {post.scheduledAt
                          ? new Date(post.scheduledAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : "TBD"}
                      </span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs text-slate-500 capitalize">
                        {post.contentType}
                      </span>
                      {post.status === "draft" && (
                        <span className="text-xs text-amber-400 bg-amber-50 px-2 py-0.5 rounded-full">
                          Draft
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-white mb-1">
                      {post.title}
                    </h4>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-3 py-2 border border-white/[0.08] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1 glass-btn-primary text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPost(null)}
                            className="px-3 py-1 glass-subtle text-slate-400 text-xs rounded-lg hover:bg-white/[0.1]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 line-clamp-2">{post.content}</p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      {post.hashtags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {post.status === "draft" && (
                      <button
                        onClick={() => handleApprove(post.id)}
                        className="px-3 py-1.5 glass-badge text-green-300 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors"
                      >
                        ✓ Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(post.id)}
                      className="px-3 py-1.5 glass-subtle text-slate-400 text-xs font-medium rounded-lg hover:bg-white/[0.1] transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────── */}
      {!generated && !generating && (
        <div className="text-center py-16 glass-card">
          <div className="text-5xl mb-4">🧠</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Generate Your Content Calendar
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Our AI will analyze your niche, competitors, and audience to create a
            complete 30-day content calendar with platform-specific posts, optimal
            timing, and hashtag strategies.
          </p>
          <button
            onClick={handleGenerate}
            className="px-6 py-3 glass-btn-primary transition-colors"
          >
            Generate Calendar for {monthName}
          </button>
        </div>
      )}

      {/* ── Generating animation ─────────────────────────────── */}
      {generating && (
        <div className="text-center py-16 glass-card animate-fade-in">
          <div className="text-5xl mb-4 animate-pulse-glow">⚡</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            AI is building your content calendar...
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Analyzing your niche, competitors, and optimal posting strategies.
            Generating {calendarDays.daysInMonth} days of content across your connected platforms.
          </p>
          <div className="max-w-xs mx-auto">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" style={{ width: "70%" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
