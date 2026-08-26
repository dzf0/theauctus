"use client";

import { useState, useEffect } from "react";
import { mockPosts, platformConfig, scheduledTasks } from "@/lib/store";
import type { ContentPost, PostStatus, Platform } from "@/lib/types";

type QueueFilter = "all" | PostStatus;

export default function QueuePage() {
  const [filter, setFilter] = useState<QueueFilter>("all");
  const [filterPlatform, setFilterPlatform] = useState<Platform | "all">("all");
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const check = () => setIsDark(!document.documentElement.classList.contains("light"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const posts = mockPosts
    .filter((p) => (filter === "all" ? true : p.status === filter))
    .filter((p) => (filterPlatform === "all" ? true : p.platform === filterPlatform))
    .sort((a, b) => {
      const dateA = a.scheduledAt || a.publishedAt || "";
      const dateB = b.scheduledAt || b.publishedAt || "";
      return dateA.localeCompare(dateB);
    });

  const statusCounts = {
    all: mockPosts.length,
    draft: mockPosts.filter((p) => p.status === "draft").length,
    scheduled: mockPosts.filter((p) => p.status === "scheduled").length,
    publishing: mockPosts.filter((p) => p.status === "publishing").length,
    published: mockPosts.filter((p) => p.status === "published").length,
    failed: mockPosts.filter((p) => p.status === "failed").length,
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedPosts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPosts(next);
  };

  const selectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(posts.map((p) => p.id)));
    }
  };

  const tabBg = (active: boolean) => active
    ? "rgba(201, 168, 124, 0.12)"
    : isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)";

  const tabBorder = (active: boolean) => active
    ? "rgba(201, 168, 124, 0.4)"
    : isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";

  const tabColor = (active: boolean) => active
    ? "#c9a87c"
    : isDark ? "#7a756f" : "#6b6560";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Content Queue</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Manage, schedule, and track all your content across platforms
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedPosts.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(124, 158, 201, 0.1)" }}>
              <span className="text-sm font-medium" style={{ color: "var(--info)" }}>
                {selectedPosts.size} selected
              </span>
              <button className="text-xs font-medium hover:opacity-80" style={{ color: "var(--info)" }}>
                Schedule
              </button>
              <button className="text-xs font-medium hover:opacity-80" style={{ color: "var(--danger)" }}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(["draft", "scheduled", "publishing", "published", "failed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(filter === status ? "all" : status)}
            className="p-3 rounded-xl border text-center transition-all duration-300"
            style={{
              borderColor: tabBorder(filter === status),
              background: tabBg(filter === status),
              color: tabColor(filter === status),
            }}
          >
            <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{statusCounts[status]}</p>
            <p className="text-xs capitalize mt-0.5" style={{ color: "var(--muted)" }}>
              {status === "publishing" ? "Publishing" : status}
            </p>
          </button>
        ))}
      </div>

      {/* ── Platform filter ─────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterPlatform("all")}
          className="px-3 py-1.5 rounded text-[10px] uppercase tracking-[0.1em] whitespace-nowrap transition-all duration-300"
          style={{
            background: filterPlatform === "all" ? "linear-gradient(135deg, #c9a87c, #b8935f)" : tabBg(false),
            color: filterPlatform === "all" ? "#0a0a0f" : isDark ? "#7a756f" : "#6b6560",
            border: `1px solid ${filterPlatform === "all" ? "rgba(201, 168, 124, 0.3)" : tabBorder(false)}`,
          }}
        >
          All Platforms
        </button>
        {(["twitter", "linkedin", "instagram", "youtube", "tiktok", "threads"] as Platform[]).map(
          (platform) => {
            const config = platformConfig[platform];
            return (
              <button
                key={platform}
                onClick={() => setFilterPlatform(filterPlatform === platform ? "all" : platform)}
                className="px-3 py-1.5 rounded text-[10px] uppercase tracking-[0.1em] whitespace-nowrap transition-all duration-300"
                style={{
                  background: filterPlatform === platform ? "linear-gradient(135deg, #c9a87c, #b8935f)" : tabBg(false),
                  color: filterPlatform === platform ? "#0a0a0f" : isDark ? "#7a756f" : "#6b6560",
                  border: `1px solid ${filterPlatform === platform ? "rgba(201, 168, 124, 0.3)" : tabBorder(false)}`,
                }}
              >
                {config.icon} {config.label}
              </button>
            );
          }
        )}
      </div>

      {/* ── Posts: Desktop table ──────────────────────────── */}
      <div className="hidden sm:block liquid-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[40px_1fr_120px_100px_100px_120px] gap-4 px-5 py-3 text-xs font-medium uppercase tracking-wider" style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`, color: isDark ? "#7a756f" : "#6b6560" }}>
          <div>
            <input
              type="checkbox"
              checked={selectedPosts.size === posts.length && posts.length > 0}
              onChange={selectAll}
              className="rounded"
            />
          </div>
          <div>Content</div>
          <div>Platform</div>
          <div>Type</div>
          <div>Status</div>
          <div>Scheduled</div>
        </div>

        {/* Posts */}
        {posts.map((post) => {
          const config = platformConfig[post.platform];
          const isSelected = selectedPosts.has(post.id);

          return (
            <div
              key={post.id}
              className="grid grid-cols-[40px_1fr_120px_100px_100px_120px] gap-4 px-5 py-4 items-center transition-colors duration-300"
              style={{
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                background: isSelected ? "rgba(124, 158, 201, 0.05)" : "transparent",
              }}
            >
              <div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(post.id)}
                  className="rounded"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                  {post.title}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted)" }}>
                  {post.content.slice(0, 80)}...
                </p>
              </div>

              <div>
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: `${config.color}15`,
                    color: config.color,
                  }}
                >
                  {config.icon} {config.label}
                </span>
              </div>

              <div>
                <span className="text-xs capitalize" style={{ color: "var(--muted)" }}>
                  {post.contentType}
                </span>
              </div>

              <div>
                <StatusBadge status={post.status} isDark={isDark} />
              </div>

              <div className="text-xs" style={{ color: "var(--muted)" }}>
                {post.scheduledAt
                  ? new Date(post.scheduledAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </div>
            </div>
          );
        })}

        {posts.length === 0 && (
          <div className="text-center py-12" style={{ color: "var(--muted)" }}>
            <p className="text-sm">No posts match your filters</p>
          </div>
        )}
      </div>

      {/* ── Posts: Mobile cards ───────────────────────────── */}
      <div className="sm:hidden space-y-3">
        {posts.map((post) => {
          const config = platformConfig[post.platform];
          const isSelected = selectedPosts.has(post.id);

          return (
            <div
              key={post.id}
              className="liquid-card p-4 transition-colors duration-300"
              style={{
                background: isSelected ? "rgba(124, 158, 201, 0.05)" : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(post.id)}
                    className="rounded mt-0.5"
                  />
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: `${config.color}15`, color: config.color }}
                  >
                    {config.icon} {config.label}
                  </span>
                </div>
                <StatusBadge status={post.status} isDark={isDark} />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--foreground)" }}>
                {post.title}
              </p>
              <p className="text-xs line-clamp-2 mb-2" style={{ color: "var(--muted)" }}>
                {post.content.slice(0, 120)}...
              </p>
              <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--muted)" }}>
                <span className="capitalize">{post.contentType}</span>
                <span>
                  {post.scheduledAt
                    ? new Date(post.scheduledAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "—"}
                </span>
              </div>
            </div>
          );
        })}

        {posts.length === 0 && (
          <div className="liquid-card text-center py-12" style={{ color: "var(--muted)" }}>
            <p className="text-sm">No posts match your filters</p>
          </div>
        )}
      </div>

      {/* ── Scheduled Tasks ─────────────────────────────────── */}
      <div className="liquid-card p-5">
        <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Publishing Queue</h3>
        <div className="space-y-3">
          {scheduledTasks
            .sort((a, b) => a.executeAt.localeCompare(b.executeAt))
            .map((task) => {
              const post = mockPosts.find((p) => p.id === task.postId);
              const config = platformConfig[task.platform];
              if (!post) return null;

              return (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-3 rounded-lg"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          task.status === "completed"
                            ? "var(--success)"
                            : task.status === "executing"
                            ? "var(--accent-copper)"
                            : task.status === "failed"
                            ? "var(--danger)"
                            : "var(--muted)",
                        animation: task.status === "executing" ? "pulse-glow 2s infinite" : "none",
                      }}
                    />
                    <span className="text-xs capitalize" style={{ color: "var(--muted)" }}>{task.status}</span>
                  </div>

                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${config.color}15`,
                      color: config.color,
                    }}
                  >
                    {config.icon}
                  </span>

                  <p className="text-sm flex-1 truncate" style={{ color: "var(--foreground)" }}>
                    {post.title}
                  </p>

                  <span className="text-xs whitespace-nowrap" style={{ color: "var(--muted)" }}>
                    {new Date(task.executeAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, isDark }: { status: PostStatus; isDark: boolean }) {
  const statusConfig: Record<PostStatus, { label: string; bg: string; color: string; border: string }> = {
    draft: {
      label: "Draft",
      bg: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
      color: isDark ? "#7a756f" : "#6b6560",
      border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    },
    scheduled: {
      label: "Scheduled",
      bg: "rgba(124, 158, 201, 0.1)",
      color: "#7c9ec9",
      border: "rgba(124, 158, 201, 0.2)",
    },
    publishing: {
      label: "Publishing",
      bg: "rgba(229, 192, 123, 0.1)",
      color: "#c9a87c",
      border: "rgba(229, 192, 123, 0.2)",
    },
    published: {
      label: "Published",
      bg: "rgba(124, 184, 124, 0.1)",
      color: "#7cb87c",
      border: "rgba(124, 184, 124, 0.2)",
    },
    failed: {
      label: "Failed",
      bg: "rgba(224, 108, 117, 0.1)",
      color: "#c97c7c",
      border: "rgba(224, 108, 117, 0.2)",
    },
  };

  const { label, bg, color, border } = statusConfig[status];

  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ background: bg, color, border: `1px solid ${border}` }}
    >
      {label}
    </span>
  );
}
