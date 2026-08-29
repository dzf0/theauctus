"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardHeader, CardTitle, Badge, Modal, Input, Select, Tabs, TabsList, TabsTrigger, TabsContent, useToast, ToastContainer } from "@/components/ui";
import { AILoader, Skeleton } from "@/components/ui/Loading";
import { CREDIT_COSTS } from "@/lib/constants";

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
  { value: "instagram", label: "Instagram", icon: "IG" },
  { value: "tiktok", label: "TikTok", icon: "TT" },
  { value: "twitter", label: "Twitter/X", icon: "X" },
  { value: "linkedin", label: "LinkedIn", icon: "in" },
  { value: "facebook", label: "Facebook", icon: "f" },
];

const FREQUENCIES = [
  { value: "daily", label: "Daily", desc: "1 post per day" },
  { value: "3x-week", label: "3x / week", desc: "Mon, Wed, Fri" },
  { value: "5x-week", label: "5x / week", desc: "Mon–Fri" },
  { value: "weekly", label: "Weekly", desc: "1 post per week" },
  { value: "auto", label: "AI decides", desc: "Best schedule for topic" },
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
  const [selectedDayPosts, setSelectedDayPosts] = useState<Post[] | null>(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, toast, dismissToast } = useToast();
  const [topic, setTopic] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"]);
  const [postCount, setPostCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // tomorrow
    return d.toISOString().split("T")[0];
  });
  const [frequency, setFrequency] = useState("auto");

  const creditCostPerPost = CREDIT_COSTS.find((c) => c.action === "Single social post")?.credits ?? 5;
  const totalCreditCost = postCount * creditCostPerPost;

  useEffect(() => {
    fetchPosts();
    fetch("/api/user/stats")
      .then((r) => r.json())
      .then((data) => setCredits(data.credits ?? 0))
      .catch(() => {});
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      const data = await response.json();
      if (response.ok) setPosts(Array.isArray(data) ? data : data.posts || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) { toast.error("Please enter a topic"); return; }
    setGenerating(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          platforms: selectedPlatforms,
          count: postCount,
          startDate,
          frequency,
        }),
      });
      const data = await response.json();
      if (!response.ok) { toast.error(data.error || "Failed to generate posts"); return; }
      toast.success(`Generated ${data.count ?? postCount} posts!`);
      setGenerateModalOpen(false);
      setTopic("");
      fetchPosts();
    } catch { toast.error("Something went wrong"); } finally { setGenerating(false); }
  };

  const handleCopy = async (post: Post) => {
    const text = `${post.title}\n\n${post.content}\n\n${post.hashtags.map((t) => `#${t}`).join(" ")}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Post copied to clipboard!");
    } catch {
      toast.error("Failed to copy — try selecting manually");
    }
  };

  const handleDelete = async (post: Post) => {
    try {
      const response = await fetch(`/api/posts?id=${post.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to delete");
        return;
      }
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setSelectedPost(null);
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) => prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const getPostsForDate = (date: Date) => posts.filter((post) => {
    if (!post.scheduled_at) return false;
    const d = new Date(post.scheduled_at);
    return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
  });

  const formatMonth = (date: Date) => date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl" style={{ color: "var(--foreground)" }}>Content Planner</h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--muted)" }}>Plan, schedule, and manage your content</p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs defaultValue="calendar" className="w-auto">
            <TabsList>
              <TabsTrigger value="calendar" onClick={() => setView("calendar")}>Calendar</TabsTrigger>
              <TabsTrigger value="list" onClick={() => setView("list")}>List</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setGenerateModalOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            Generate
            <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded-full" style={{ background: "rgba(0,0,0,0.15)" }}>
              {creditCostPerPost} cr/post
            </span>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <Card variant="default" padding="none">
          {view === "calendar" ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 rounded transition-colors" style={{ color: "var(--muted)" }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h2 className="font-headline text-lg" style={{ color: "var(--foreground)" }}>{formatMonth(currentMonth)}</h2>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 rounded transition-colors" style={{ color: "var(--muted)" }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-px" style={{ background: "var(--lg-border)" }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-3 text-center text-[11px] uppercase tracking-wider" style={{ color: "var(--muted)", background: "var(--background)" }}>{day}</div>
                ))}
                {getDaysInMonth(currentMonth).map((date, index) => {
                  const dayPosts = date ? getPostsForDate(date) : [];
                  const isToday = date?.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={index}
                      className="min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 transition-colors relative"
                      style={{
                        background: "var(--background)",
                        cursor: date ? "pointer" : "default",
                        boxShadow: isToday ? "inset 0 0 0 1px var(--accent-copper)" : "none",
                      }}
                      onClick={() => {
                        if (date && dayPosts.length > 1) {
                          setSelectedDayPosts(dayPosts);
                        } else if (date && dayPosts.length === 1) {
                          setSelectedPost(dayPosts[0]);
                        }
                      }}
                    >
                      {date && (
                        <>
                          <span className="text-[11px] sm:text-[12px]" style={{ color: isToday ? "var(--accent-copper)" : "var(--muted)", fontWeight: isToday ? 500 : 400 }}>{date.getDate()}</span>
                          <div className="mt-1 space-y-1">
                            {dayPosts.map((post) => (
                              <div key={post.id} className="px-1.5 py-0.5 text-[9px] sm:text-[10px] rounded truncate" style={{ background: "rgba(201, 168, 124, 0.1)", color: "var(--accent-copper)" }}>{post.platform}</div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              {loading ? (
                <div className="p-8 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2"><Skeleton className="h-3 w-1/3" /><Skeleton className="h-3 w-2/3" /></div>
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="mb-4" style={{ color: "var(--muted)" }}>No posts yet</p>
                  <Button onClick={() => setGenerateModalOpen(true)}>Generate Your First Posts</Button>
                </div>
              ) : (
                posts.map((post, i) => (
                  <div key={post.id} className="p-4 cursor-pointer transition-colors" style={{ borderBottom: "1px solid var(--lg-border)" }} onClick={() => setSelectedPost(post)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[16px]">{PLATFORMS.find((p) => p.value === post.platform)?.icon}</span>
                          <Badge variant={STATUS_COLORS[post.status]}>{post.status}</Badge>
                        </div>
                        <p className="text-[13px] truncate" style={{ color: "var(--foreground)" }}>{post.title}</p>
                        <p className="text-[12px] truncate mt-1" style={{ color: "var(--muted)" }}>{post.content}</p>
                      </div>
                      {post.scheduled_at && (
                        <span className="text-[11px] whitespace-nowrap" style={{ color: "var(--muted)" }}>
                          {new Date(post.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          {selectedPost ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Post Details</CardTitle>
                  <Badge variant={STATUS_COLORS[selectedPost.status]}>{selectedPost.status}</Badge>
                </div>
              </CardHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>Platform</p>
                  <p className="text-[14px]" style={{ color: "var(--foreground)" }}>
                    {PLATFORMS.find((p) => p.value === selectedPost.platform)?.icon} {PLATFORMS.find((p) => p.value === selectedPost.platform)?.label}
                  </p>
                </div>
                {selectedPost.scheduled_at && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>Scheduled</p>
                    <p className="text-[14px]" style={{ color: "var(--foreground)" }}>
                      {new Date(selectedPost.scheduled_at).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>Content</p>
                  <p className="text-[13px] whitespace-pre-wrap" style={{ color: "var(--foreground)" }}>{selectedPost.content}</p>
                </div>
                {selectedPost.hashtags.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--muted)" }}>Hashtags</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedPost.hashtags.map((tag) => (
                        <span key={tag} className="text-[12px] accent-text">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button variant="secondary" size="sm" className="flex-1">Edit</Button>
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => handleCopy(selectedPost)}>Copy</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(selectedPost)}>Delete</Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "var(--lg-bg)" }}>
                  <svg className="w-6 h-6" style={{ color: "var(--muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <p className="text-[13px]" style={{ color: "var(--muted)" }}>Select a post to view details</p>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>This Month</CardTitle></CardHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Scheduled</p>
                <p className="font-headline text-2xl" style={{ color: "var(--foreground)" }}>{posts.filter((p) => p.status === "scheduled").length}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Published</p>
                <p className="font-headline text-2xl" style={{ color: "var(--foreground)" }}>{posts.filter((p) => p.status === "published").length}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Day detail modal — shows all posts for a day */}
      <Modal isOpen={!!selectedDayPosts} onClose={() => setSelectedDayPosts(null)} title="Posts for this day" size="md">
        {selectedDayPosts && (
          <div className="space-y-3">
            {selectedDayPosts.map((post) => (
              <div
                key={post.id}
                className="p-3 rounded-lg cursor-pointer transition-colors"
                style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}
                onClick={() => { setSelectedDayPosts(null); setSelectedPost(post); }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[14px]">{PLATFORMS.find((p) => p.value === post.platform)?.icon}</span>
                  <span className="text-[12px] font-medium" style={{ color: "var(--foreground)" }}>{post.title}</span>
                </div>
                <p className="text-[11px] truncate" style={{ color: "var(--muted)" }}>{post.content}</p>
                {post.scheduled_at && (
                  <p className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>
                    {new Date(post.scheduled_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Generate modal */}
      <Modal isOpen={generateModalOpen} onClose={() => setGenerateModalOpen(false)} title="Generate Content" description="AI will create posts based on your brand profile" size="lg">
        {generating ? (
          <AILoader step={0} />
        ) : (
          <div className="space-y-6">
            <Input label="Topic" placeholder="e.g., Sustainable fashion tips for Gen Z" value={topic} onChange={(e) => setTopic(e.target.value)} />

            <div>
              <label className="block text-[11px] uppercase tracking-[0.1em] mb-3" style={{ color: "var(--muted)" }}>Platforms</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.value}
                    onClick={() => togglePlatform(platform.value)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all"
                    style={{
                      borderColor: selectedPlatforms.includes(platform.value) ? "rgba(201, 168, 124, 0.3)" : "var(--lg-border)",
                      background: selectedPlatforms.includes(platform.value) ? "rgba(201, 168, 124, 0.1)" : "var(--lg-bg)",
                      color: selectedPlatforms.includes(platform.value) ? "var(--foreground)" : "var(--muted)",
                    }}
                  >
                    <span>{platform.icon}</span>
                    <span className="text-[13px]">{platform.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.1em] mb-3" style={{ color: "var(--muted)" }}>Number of Posts</label>
              <div className="flex items-center gap-4">
                <input type="range" min="1" max="30" value={postCount} onChange={(e) => setPostCount(parseInt(e.target.value))} className="flex-1 h-2 rounded-lg appearance-none cursor-pointer" style={{ background: "var(--lg-bg)", accentColor: "var(--accent-copper)" }} />
                <span className="font-headline text-2xl w-12 text-right" style={{ color: "var(--foreground)" }}>{postCount}</span>
              </div>
              <div className="flex justify-between mt-2 text-[11px]" style={{ color: "var(--muted)" }}><span>1 post</span><span>30 posts</span></div>
            </div>

            {/* Scheduling section */}
            <div className="p-4 rounded-lg" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
              <p className="text-[11px] uppercase tracking-[0.1em] mb-4" style={{ color: "var(--muted)" }}>Schedule</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] mb-2" style={{ color: "var(--muted)" }}>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-[13px]"
                    style={{ background: "var(--background)", border: "1px solid var(--lg-border)", color: "var(--foreground)" }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] mb-2" style={{ color: "var(--muted)" }}>Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-[13px]"
                    style={{ background: "var(--background)", border: "1px solid var(--lg-border)", color: "var(--foreground)" }}
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>{f.label} — {f.desc}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-[11px] mt-3" style={{ color: "var(--muted)" }}>
                Posts will be scheduled starting {new Date(startDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                {frequency !== "auto" && ` at optimal times (${FREQUENCIES.find(f => f.value === frequency)?.desc})`}
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
              <div className="flex items-center justify-between text-[13px]">
                <span style={{ color: "var(--muted)" }}>Credits needed:</span>
                <span className="font-medium" style={{ color: totalCreditCost > (credits ?? 0) ? "var(--danger)" : "var(--foreground)" }}>
                  {totalCreditCost} credits
                </span>
              </div>
              <div className="flex items-center justify-between text-[13px] mt-1">
                <span style={{ color: "var(--muted)" }}>Your balance:</span>
                <span className="font-medium accent-text">{credits ?? "—"} credits</span>
              </div>
              {credits !== null && totalCreditCost > credits && (
                <p className="text-[11px] mt-2" style={{ color: "var(--danger)" }}>
                  Not enough credits. You need {totalCreditCost - credits} more.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setGenerateModalOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleGenerate} loading={generating} disabled={!topic.trim() || selectedPlatforms.length === 0 || (credits !== null && totalCreditCost > credits)} className="flex-1">
                Generate {postCount} Posts
                <span className="ml-2 text-[10px] opacity-75">({totalCreditCost} cr)</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
