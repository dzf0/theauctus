"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@/components/ui";

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

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/posts").then((r) => r.json()),
    ]).then(([profileData, postsData]) => {
      setProfile(profileData.profile);
      setPosts(postsData.posts || []);
      setLoading(false);
    });
  }, []);

  const stats = [
    {
      label: "Credits",
      value: "42",
      change: "+10",
      positive: true,
    },
    {
      label: "Posts This Week",
      value: posts.filter((p) => {
        const created = new Date(p.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created > weekAgo;
      }).length.toString(),
      change: "+5",
      positive: true,
    },
    {
      label: "Engagement Rate",
      value: "4.2%",
      change: "+0.8%",
      positive: true,
    },
    {
      label: "Followers",
      value: "2.8K",
      change: "+127",
      positive: true,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-[#252525] rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#252525] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="font-headline text-2xl text-[#F5F0EB]">
          Welcome back{profile?.niche ? `, ${profile.niche} creator` : ""}
        </h1>
        <p className="text-[13px] text-[#6B6560] mt-1">
          Here&apos;s what&apos;s happening with your content
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} variant="stat">
            <CardContent>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#6B6560] mb-1">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl text-[#F5F0EB]">
                  {stat.value}
                </span>
                <span
                  className={`text-[11px] ${
                    stat.positive ? "text-[#7CB87C]" : "text-[#E06C75]"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/dashboard/planner">
          <Card variant="interactive">
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#C9A87C]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#C9A87C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-[14px] text-[#F5F0EB] font-medium">Generate Content</p>
                <p className="text-[12px] text-[#6B6560]">AI-powered post creation</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/planner">
          <Card variant="interactive">
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#7CB87C]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#7CB87C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[14px] text-[#F5F0EB] font-medium">View Calendar</p>
                <p className="text-[12px] text-[#6B6560]">See scheduled posts</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analytics">
          <Card variant="interactive">
            <CardContent className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#61AFEF]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#61AFEF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-[14px] text-[#F5F0EB] font-medium">View Analytics</p>
                <p className="text-[12px] text-[#6B6560]">Track performance</p>
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
            <Link href="/dashboard/planner" className="text-[12px] text-[#C9A87C] hover:text-[#B8956A] transition-colors">
              View All →
            </Link>
          </div>
        </CardHeader>
        <div className="divide-y divide-[#2A2A2A]">
          {posts.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[13px] text-[#6B6560] mb-4">No posts yet</p>
              <Link href="/dashboard/planner">
                <Button>Generate Your First Posts</Button>
              </Link>
            </div>
          ) : (
            posts.slice(0, 5).map((post) => (
              <div key={post.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[14px]">
                    {post.platform === "instagram" && "📸"}
                    {post.platform === "tiktok" && "🎵"}
                    {post.platform === "twitter" && "🐦"}
                    {post.platform === "linkedin" && "💼"}
                    {post.platform === "facebook" && "👤"}
                  </span>
                  <div>
                    <p className="text-[13px] text-[#F5F0EB] truncate max-w-[300px]">
                      {post.title || post.content.slice(0, 50)}
                    </p>
                    <p className="text-[11px] text-[#6B6560]">
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
