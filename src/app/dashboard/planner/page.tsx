"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardHeader, CardTitle, Badge, Modal, Input, Select, Tabs, TabsList, TabsTrigger, TabsContent, useToast, ToastContainer } from "@/components/ui";
import { AILoader, Skeleton } from "@/components/ui/Loading";

interface Post {
  id: string;
  title: string;
  content: string;
  platform: string;
  status: "draft" | "ready" | "scheduled" | "published";
  scheduled_at: string | null;
  hashtags: string[];
  created_at: string;
}

const PLATFORMS = [
  { value: "instagram", label: "Instagram", icon: "📸" },
  { value: "tiktok", label: "TikTok", icon: "🎵" },
  { value: "twitter", label: "Twitter/X", icon: "🐦" },
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
  { value: "facebook", label: "Facebook", icon: "👤" },
];

const STATUS_COLORS: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  draft: "default",
  ready: "primary",
  scheduled: "warning",
  published: "success",
};

export default function PlannerPage() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, toast, dismissToast } = useToast();

  // Generate form state
  const [topic, setTopic] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"]);
  const [postCount, setPostCount] = useState(10);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      const data = await response.json();
      if (response.ok) {
        setPosts(data.posts || []);
      }
    } catch {
      console.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          platforms: selectedPlatforms,
          count: postCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to generate posts");
        return;
      }

      toast.success(`Generated ${postCount} posts!`);
      setGenerateModalOpen(false);
      setTopic("");
      fetchPosts();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getPostsForDate = (date: Date) => {
    return posts.filter((post) => {
      if (!post.scheduled_at) return false;
      const scheduledDate = new Date(post.scheduled_at);
      return (
        scheduledDate.getDate() === date.getDate() &&
        scheduledDate.getMonth() === date.getMonth() &&
        scheduledDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl text-[#F5F0EB]">Content Planner</h1>
          <p className="text-[13px] text-[#6B6560] mt-1">
            Plan, schedule, and manage your content
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs defaultValue="calendar" className="w-auto">
            <TabsList>
              <TabsTrigger value="calendar" onClick={() => setView("calendar")}>
                Calendar
              </TabsTrigger>
              <TabsTrigger value="list" onClick={() => setView("list")}>
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setGenerateModalOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            Generate
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar/List View */}
        <Card variant="default" padding="none">
          {view === "calendar" ? (
            <div className="p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-[#252525] rounded transition-colors"
                >
                  <svg className="w-5 h-5 text-[#6B6560]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="font-headline text-lg text-[#F5F0EB]">
                  {formatMonth(currentMonth)}
                </h2>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-[#252525] rounded transition-colors"
                >
                  <svg className="w-5 h-5 text-[#6B6560]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-px bg-[#2A2A2A]">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-3 text-center text-[11px] uppercase tracking-wider text-[#6B6560] bg-[#1A1A1A]">
                    {day}
                  </div>
                ))}
                {getDaysInMonth(currentMonth).map((date, index) => {
                  const dayPosts = date ? getPostsForDate(date) : [];
                  const isToday = date?.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 bg-[#1A1A1A] ${
                        date ? "hover:bg-[#252525] cursor-pointer" : ""
                      } ${isToday ? "ring-1 ring-[#C9A87C]/30" : ""}`}
                      onClick={() => date && dayPosts.length > 0 && setSelectedPost(dayPosts[0])}
                    >
                      {date && (
                        <>
                          <span className={`text-[12px] ${isToday ? "text-[#C9A87C] font-medium" : "text-[#9A9590]"}`}>
                            {date.getDate()}
                          </span>
                          <div className="mt-1 space-y-1">
                            {dayPosts.slice(0, 2).map((post) => (
                              <div
                                key={post.id}
                                className="px-2 py-1 text-[10px] rounded bg-[#C9A87C]/10 text-[#C9A87C] truncate"
                              >
                                {post.platform}
                              </div>
                            ))}
                            {dayPosts.length > 2 && (
                              <span className="text-[10px] text-[#6B6560]">
                                +{dayPosts.length - 2} more
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#2A2A2A]">
              {loading ? (
                <div className="p-8 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-[#6B6560] mb-4">No posts yet</p>
                  <Button onClick={() => setGenerateModalOpen(true)}>
                    Generate Your First Posts
                  </Button>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 hover:bg-[#252525] cursor-pointer transition-colors"
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[16px]">
                            {PLATFORMS.find((p) => p.value === post.platform)?.icon}
                          </span>
                          <Badge variant={STATUS_COLORS[post.status]}>
                            {post.status}
                          </Badge>
                        </div>
                        <p className="text-[13px] text-[#F5F0EB] truncate">{post.title}</p>
                        <p className="text-[12px] text-[#6B6560] truncate mt-1">{post.content}</p>
                      </div>
                      {post.scheduled_at && (
                        <span className="text-[11px] text-[#6B6560] whitespace-nowrap">
                          {new Date(post.scheduled_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>

        {/* Post Details Panel */}
        <div className="space-y-4">
          {selectedPost ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Post Details</CardTitle>
                  <Badge variant={STATUS_COLORS[selectedPost.status]}>
                    {selectedPost.status}
                  </Badge>
                </div>
              </CardHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#6B6560] mb-1">Platform</p>
                  <p className="text-[14px] text-[#F5F0EB]">
                    {PLATFORMS.find((p) => p.value === selectedPost.platform)?.icon}{" "}
                    {PLATFORMS.find((p) => p.value === selectedPost.platform)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#6B6560] mb-1">Content</p>
                  <p className="text-[13px] text-[#F5F0EB] whitespace-pre-wrap">{selectedPost.content}</p>
                </div>
                {selectedPost.hashtags.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#6B6560] mb-1">Hashtags</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedPost.hashtags.map((tag) => (
                        <span key={tag} className="text-[12px] text-[#C9A87C]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button variant="secondary" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1">
                    Copy
                  </Button>
                  <Button variant="danger" size="sm">
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#252525] flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#6B6560]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <p className="text-[13px] text-[#6B6560]">
                  Select a post to view details
                </p>
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#6B6560]">Scheduled</p>
                <p className="font-headline text-2xl text-[#F5F0EB]">
                  {posts.filter((p) => p.status === "scheduled").length}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#6B6560]">Published</p>
                <p className="font-headline text-2xl text-[#F5F0EB]">
                  {posts.filter((p) => p.status === "published").length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Generate Content Modal */}
      <Modal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        title="Generate Content"
        description="AI will create posts based on your brand profile"
        size="lg"
      >          {generating ? (
            <AILoader step={0} />
          ) : (
          <div className="space-y-6">
          <Input
            label="Topic"
            placeholder="e.g., Sustainable fashion tips for Gen Z"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] text-[#6B6560] mb-3">
              Platforms
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.value}
                  onClick={() => togglePlatform(platform.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    selectedPlatforms.includes(platform.value)
                      ? "border-[#C9A87C]/30 bg-[#C9A87C]/10 text-[#F5F0EB]"
                      : "border-[#2A2A2A] bg-[#1A1A1A] text-[#6B6560] hover:border-[#3A3A3A]"
                  }`}
                >
                  <span>{platform.icon}</span>
                  <span className="text-[13px]">{platform.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.1em] text-[#6B6560] mb-3">
              Number of Posts
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="30"
                value={postCount}
                onChange={(e) => setPostCount(parseInt(e.target.value))}
                className="flex-1 h-2 bg-[#252525] rounded-lg appearance-none cursor-pointer accent-[#C9A87C]"
              />
              <span className="font-headline text-2xl text-[#F5F0EB] w-12 text-right">
                {postCount}
              </span>
            </div>
            <div className="flex justify-between mt-2 text-[11px] text-[#6B6560]">
              <span>1 post</span>
              <span>30 posts</span>
            </div>
          </div>

          <div className="p-4 bg-[#252525] rounded-lg">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#9A9590]">Credits needed:</span>
              <span className="text-[#F5F0EB] font-medium">{postCount} credits</span>
            </div>
            <div className="flex items-center justify-between text-[13px] mt-1">
              <span className="text-[#9A9590]">Your balance:</span>
              <span className="text-[#C9A87C] font-medium">42 credits</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setGenerateModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              loading={generating}
              disabled={!topic.trim() || selectedPlatforms.length === 0}
              className="flex-1"
            >
              Generate {postCount} Posts
            </Button>
          </div>
        </div>
          )}
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
