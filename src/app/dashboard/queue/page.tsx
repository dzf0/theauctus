"use client";

import { useState } from "react";
import { mockPosts, platformConfig, scheduledTasks } from "@/lib/store";
import type { ContentPost, PostStatus, Platform } from "@/lib/types";

type QueueFilter = "all" | PostStatus;

export default function QueuePage() {
  const [filter, setFilter] = useState<QueueFilter>("all");
  const [filterPlatform, setFilterPlatform] = useState<Platform | "all">("all");
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Queue</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage, schedule, and track all your content across platforms
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedPosts.size > 0 && (
            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg">
              <span className="text-sm text-indigo-300 font-medium">
                {selectedPosts.size} selected
              </span>
              <button className="text-xs text-indigo-400 hover:text-indigo-800 font-medium">
                Schedule
              </button>
              <button className="text-xs text-red-400 hover:text-red-800 font-medium">
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
            className={`p-3 rounded-xl border text-center transition-all ${
              filter === status
                ? "border-indigo-300 bg-indigo-50 shadow-sm"
                : "border-white/[0.08] bg-white hover:border-gray-300"
            }`}
          >
            <p className="text-2xl font-bold text-white">{statusCounts[status]}</p>
            <p className="text-xs text-slate-500 capitalize mt-0.5">
              {status === "publishing" ? "Publishing" : status}
            </p>
          </button>
        ))}
      </div>

      {/* ── Platform filter ─────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterPlatform("all")}
          className={`px-3 py-1.5 rounded text-[10px] uppercase tracking-[0.1em] whitespace-nowrap transition-colors ${
            filterPlatform === "all"
              ? "glass-btn-primary"
              : "glass-subtle text-slate-400 hover:bg-white/[0.1]"
          }`}
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
                className={`px-3 py-1.5 rounded text-[10px] uppercase tracking-[0.1em] whitespace-nowrap transition-colors ${
                  filterPlatform === platform
                    ? "glass-btn-primary"
                    : "glass-subtle text-slate-400 hover:bg-white/[0.1]"
                }`}
              >
                {config.icon} {config.label}
              </button>
            );
          }
        )}
      </div>

      {/* ── Posts table ─────────────────────────────────────── */}
      <div className="glass-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[40px_1fr_120px_100px_100px_120px] gap-4 px-5 py-3 border-b border-white/[0.06] text-xs font-medium text-slate-500 uppercase tracking-wider">
          <div>
            <input
              type="checkbox"
              checked={selectedPosts.size === posts.length && posts.length > 0}
              onChange={selectAll}
              className="rounded border-gray-300"
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
              className={`grid grid-cols-[40px_1fr_120px_100px_100px_120px] gap-4 px-5 py-4 border-b border-gray-50 items-center hover:glass-subtle transition-colors ${
                isSelected ? "bg-indigo-50" : ""
              }`}
            >
              <div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(post.id)}
                  className="rounded border-gray-300"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {post.title}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
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
                <span className="text-xs text-slate-400 capitalize">
                  {post.contentType}
                </span>
              </div>

              <div>
                <StatusBadge status={post.status} />
              </div>

              <div className="text-xs text-slate-500">
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
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm">No posts match your filters</p>
          </div>
        )}
      </div>

      {/* ── Scheduled Tasks ─────────────────────────────────── */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4">Publishing Queue</h3>
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
                  className="flex items-center gap-4 p-3 rounded-lg glass-subtle"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        task.status === "completed"
                          ? "bg-green-400"
                          : task.status === "executing"
                          ? "bg-amber-400 animate-pulse"
                          : task.status === "failed"
                          ? "bg-red-400"
                          : "bg-gray-300"
                      }`}
                    />
                    <span className="text-xs text-slate-500 capitalize">{task.status}</span>
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

                  <p className="text-sm text-slate-300 flex-1 truncate">
                    {post.title}
                  </p>

                  <span className="text-xs text-slate-500 whitespace-nowrap">
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

function StatusBadge({ status }: { status: PostStatus }) {
  const config: Record<PostStatus, { label: string; className: string }> = {
    draft: { label: "Draft", className: "glass-subtle text-slate-400" },
    scheduled: { label: "Scheduled", className: "glass-badge text-blue-300" },
    publishing: { label: "Publishing", className: "glass-badge text-amber-300" },
    published: { label: "Published", className: "glass-badge text-green-300" },
    failed: { label: "Failed", className: "glass-badge text-red-300" },
  };

  const { label, className } = config[status];

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}
