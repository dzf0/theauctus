"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@/components/ui";
import { SkeletonDashboard } from "@/components/ui/Loading";

interface Profile {
  niche: string;
  brand_voice: string;
  onboarded: boolean;
}

interface Post {
  id: string;
  title: string;
  content: string;
  platform: string;
  status: string;
  created_at: string;
}

interface UserStats {
  credits: number;
  totalPosts: number;
  postsThisWeek: number;
  postsByStatus: {
    draft: number;
    scheduled: number;
    published: number;
  };
  engagement: {
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalReach: number;
    totalImpressions: number;
    engagementRate: string;
  };
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/posts").then((r) => r.json()),
      fetch("/api/user/stats").then((r) => r.json()),
    ]).then(([profileData, postsData, statsData]) => {
      setProfile(profileData.profile);
      setPosts(postsData.posts || []);
      setStats(statsData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <SkeletonDashboard />;
  }

  const statCards = [
    {
      label: "Credits",
      value: stats?.credits?.toString() ?? "0",
      sub: stats?.credits === 0 ? "Purchase credits to generate content" : "Available balance",
    },
    {
      label: "Posts This Week",
      value: stats?.postsThisWeek?.toString() ?? "0",
      sub: `${stats?.totalPosts ?? 0} total posts`,
    },
    {
      label: "Engagement Rate",
      value: stats?.engagement?.engagementRate ?? "0.0%",
      sub: `${stats?.engagement?.totalLikes ?? 0} likes · ${stats?.engagement?.totalComments ?? 0} comments`,
    },
    {
      label: "Total Reach",
      value: stats?.engagement?.totalReach?.toLocaleString() ?? "0",
      sub: `${stats?.engagement?.totalImpressions?.toLocaleString() ?? 0} impressions`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Low credit warning */}
      {stats && stats.credits < 5 && (
        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "rgba(201, 168, 124, 0.08)", border: "1px solid rgba(201, 168, 124, 0.2)" }}>
          <svg className="w-5 h-5 shrink-0" style={{ color: "var(--accent-copper)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div className="flex-1">
            <p className="text-[13px] font-medium" style={{ color: "var(--foreground)" }}>
              {stats.credits === 0 ? "You're out of credits" : `Only ${stats.credits} credit${stats.credits === 1 ? "" : "s"} left`}
            </p>
            <p className="text-[12px]" style={{ color: "var(--muted)" }}>
              {stats.credits === 0
                ? "Purchase credits to keep generating content."
                : "Generate a calendar (15 credits) or posts (5 credits) — buy more to continue."}
            </p>
          </div>
          <Link href="/dashboard/billing" className="shrink-0 px-4 py-2 text-[12px] font-medium liquid-btn-primary">
            Buy Credits
          </Link>
        </div>
      )}

      {/* Welcome Header */}
      <div>
        <h1 className="font-headline text-2xl" style={{ color: "var(--foreground)" }}>
          Welcome back{profile?.niche ? `, ${profile.niche} creator` : ""}
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--muted)" }}>
          Here&apos;s what&apos;s happening with your content
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} variant="stat">
            <CardContent>
              <p className="text-[11px] uppercase tracking-[0.1em] mb-1" style={{ color: "var(--muted)" }}>
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl" style={{ color: "var(--foreground)" }}>
                  {stat.value}
                </span>
              </div>
              <p className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>
                {stat.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/dashboard/planner">
          <Card variant="interactive">
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "rgba(201, 168, 124, 0.1)" }}>
                <svg className="w-6 h-6 accent-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-[14px] font-medium" style={{ color: "var(--foreground)" }}>Generate Content</p>
                <p className="text-[12px]" style={{ color: "var(--muted)" }}>AI-powered post creation</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/planner">
          <Card variant="interactive">
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "rgba(124, 184, 124, 0.1)" }}>
                <svg className="w-6 h-6" style={{ color: "var(--success)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[14px] font-medium" style={{ color: "var(--foreground)" }}>View Calendar</p>
                <p className="text-[12px]" style={{ color: "var(--muted)" }}>See scheduled posts</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analytics">
          <Card variant="interactive">
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "rgba(124, 158, 201, 0.1)" }}>
                <svg className="w-6 h-6" style={{ color: "var(--info)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-[14px] font-medium" style={{ color: "var(--foreground)" }}>View Analytics</p>
                <p className="text-[12px]" style={{ color: "var(--muted)" }}>Track performance</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Posts</CardTitle>
            <Link href="/dashboard/planner" className="text-[12px] accent-text hover:opacity-80 transition-opacity">
              View All →
            </Link>
          </div>
        </CardHeader>
        <div>
          {posts.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[13px] mb-4" style={{ color: "var(--muted)" }}>No posts yet</p>
              <Link href="/dashboard/planner">
                <Button>Generate Your First Posts</Button>
              </Link>
            </div>
          ) : (
            posts.slice(0, 5).map((post, i) => (
              <div
                key={post.id}
                className="py-3 flex items-center justify-between"
                style={{ borderTop: i === 0 ? "none" : "1px solid var(--lg-border)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[14px]">
                    {post.platform === "instagram" && "📸"}
                    {post.platform === "tiktok" && "🎵"}
                    {post.platform === "twitter" && "🐦"}
                    {post.platform === "linkedin" && "💼"}
                    {post.platform === "facebook" && "👤"}
                  </span>
                  <div>
                    <p className="text-[13px] truncate max-w-[300px]" style={{ color: "var(--foreground)" }}>
                      {post.title || post.content.slice(0, 50)}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    post.status === "published"
                      ? "success"
                      : post.status === "scheduled"
                      ? "warning"
                      : "default"
                  }
                >
                  {post.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
