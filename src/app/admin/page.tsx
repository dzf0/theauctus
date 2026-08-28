"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/components/user-provider";
import { useRouter } from "next/navigation";

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in: string | null;
  is_admin: boolean;
  banned: boolean;
  ban_info: { reason: string; banned_at: string } | null;
  credits: number;
  niche: string | null;
  brand_voice: string | null;
  target_audience: string | null;
  onboarded: boolean;
  username: string | null;
  full_name: string | null;
  subscription: { plan: string; status: string } | null;
  platforms: { total: number; connected: number; platforms: string[] };
  posts: { total: number; published: number; draft: number; scheduled: number };
}

interface AdminStats {
  users: { total: number; newLast30d: number; newLast7d: number };
  credits: { totalInCirculation: number; totalPurchased: number; totalUsed: number; purchasedLast30d: number };
  platforms: Record<string, { total: number; connected: number }>;
  content: { totalPosts: number; publishedPosts: number; totalCalendars: number };
  signupsByDay: { date: string; count: number }[];
}

interface AuditEntry {
  id: string;
  user_id: string;
  action: string;
  table_name: string | null;
  record_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  profiles: { email: string; username: string } | null;
}

type Tab = "overview" | "users" | "audit" | "health";

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════

export default function AdminPage() {
  const user = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("overview");

  // Check admin status
  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((data) => {
        setIsAdmin(data.isAdmin);
        if (!data.isAdmin) router.push("/dashboard");
      })
      .catch(() => {
        setIsAdmin(false);
        router.push("/dashboard");
      });
  }, [user, router]);

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center py-20" style={{ color: "var(--muted)" }}>
        <div className="generating-spinner" style={{ width: 20, height: 20 }} />
      </div>
    );
  }

  if (!isAdmin) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "audit", label: "Audit Log" },
    { key: "health", label: "Health" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Admin Panel</h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>System overview, user management, and audit logs</p>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded text-[12px] tracking-wide transition-colors"
            style={{
              background: tab === t.key ? "var(--lg-bg-strong)" : "transparent",
              color: tab === t.key ? "var(--foreground)" : "var(--muted)",
              border: tab === t.key ? "1px solid var(--lg-border)" : "1px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "users" && <UsersTab />}
      {tab === "audit" && <AuditTab />}
      {tab === "health" && <HealthTab />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ══════════════════════════════════════════════════════════════

function OverviewTab() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <div className="py-12 text-center text-[13px]" style={{ color: "var(--muted)" }}>Loading stats...</div>;
  }

  const maxSignups = Math.max(...stats.signupsByDay.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* User metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.users.total, color: "var(--foreground)" },
          { label: "New (7d)", value: stats.users.newLast7d, color: "var(--success)" },
          { label: "New (30d)", value: stats.users.newLast30d, color: "var(--info)" },
          { label: "Onboarded", value: stats.users.total - stats.users.newLast30d, color: "var(--muted)" },
        ].map((s, i) => (
          <div key={i} className="liquid-card p-4">
            <p className="text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: "var(--muted)" }}>{s.label}</p>
            <p className="text-2xl font-headline" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Credit metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Credits in Circulation", value: stats.credits.totalInCirculation.toLocaleString(), color: "var(--accent-copper)" },
          { label: "Total Purchased", value: stats.credits.totalPurchased.toLocaleString(), color: "var(--success)" },
          { label: "Total Used", value: stats.credits.totalUsed.toLocaleString(), color: "var(--danger)" },
          { label: "Purchased (30d)", value: stats.credits.purchasedLast30d.toLocaleString(), color: "var(--info)" },
        ].map((s, i) => (
          <div key={i} className="liquid-card p-4">
            <p className="text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: "var(--muted)" }}>{s.label}</p>
            <p className="text-2xl font-headline" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Content & Platforms */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="liquid-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Content</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-headline" style={{ color: "var(--foreground)" }}>{stats.content.totalPosts}</p>
              <p className="text-[11px]" style={{ color: "var(--muted)" }}>Total Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-headline" style={{ color: "var(--success)" }}>{stats.content.publishedPosts}</p>
              <p className="text-[11px]" style={{ color: "var(--muted)" }}>Published</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-headline" style={{ color: "var(--info)" }}>{stats.content.totalCalendars}</p>
              <p className="text-[11px]" style={{ color: "var(--muted)" }}>Calendars</p>
            </div>
          </div>
        </div>

        <div className="liquid-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Platform Connections</h3>
          <div className="space-y-2">
            {Object.entries(stats.platforms).map(([platform, data]) => (
              <div key={platform} className="flex items-center justify-between">
                <span className="text-[12px] capitalize" style={{ color: "var(--foreground)" }}>{platform}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: "var(--lg-bg)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${data.total > 0 ? (data.connected / data.total) * 100 : 0}%`,
                        background: "var(--success)",
                      }}
                    />
                  </div>
                  <span className="text-[11px] w-16 text-right" style={{ color: "var(--muted)" }}>
                    {data.connected}/{data.total}
                  </span>
                </div>
              </div>
            ))}
            {Object.keys(stats.platforms).length === 0 && (
              <p className="text-[12px] text-center py-4" style={{ color: "var(--muted)" }}>No platform connections</p>
            )}
          </div>
        </div>
      </div>

      {/* Signups chart */}
      <div className="liquid-card p-5">
        <h3 className="font-semibold mb-4" style={{ color: "var(--foreground)" }}>Signups (Last 14 Days)</h3>
        <div className="flex items-end gap-2 h-32">
          {stats.signupsByDay.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px]" style={{ color: "var(--muted)" }}>{day.count}</span>
              <div
                className="w-full rounded-t transition-all duration-500"
                style={{
                  height: `${(day.count / maxSignups) * 100}%`,
                  minHeight: day.count > 0 ? "4px" : "0",
                  background: "linear-gradient(180deg, var(--accent-copper), var(--primary-dark))",
                }}
              />
              <span className="text-[8px]" style={{ color: "var(--muted)" }}>
                {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// USERS TAB
// ══════════════════════════════════════════════════════════════

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [grantModal, setGrantModal] = useState<AdminUser | null>(null);
  const [grantAmount, setGrantAmount] = useState("");
  const [grantReason, setGrantReason] = useState("");
  const [granting, setGranting] = useState(false);
  const [banModal, setBanModal] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banning, setBanning] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "banned" | "admin">("all");

  const fetchUsers = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { setUsers(data.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGrant = async () => {
    if (!grantModal || !grantAmount || !grantReason) return;
    setGranting(true);
    try {
      const res = await fetch("/api/admin/credits/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: grantModal.id, amount: parseInt(grantAmount, 10), reason: grantReason }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Granted ${grantAmount} credits to ${grantModal.email}`, "success");
        setGrantModal(null); setGrantAmount(""); setGrantReason("");
        fetchUsers();
      } else {
        showToast(data.error || "Failed to grant credits", "error");
      }
    } catch { showToast("Network error", "error"); }
    finally { setGranting(false); }
  };

  const handleBan = async (action: "ban" | "unban") => {
    if (!banModal) return;
    if (action === "ban" && !banReason) return;
    setBanning(true);
    try {
      const res = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: banModal.id, action, reason: action === "ban" ? banReason : undefined }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(action === "ban" ? `Banned ${banModal.email}` : `Unbanned ${banModal.email}`, "success");
        setBanModal(null); setBanReason("");
        fetchUsers();
      } else {
        showToast(data.error || "Failed", "error");
      }
    } catch { showToast("Network error", "error"); }
    finally { setBanning(false); }
  };

  const filtered = users
    .filter((u) => {
      if (filter === "active") return !u.banned && !u.is_admin;
      if (filter === "banned") return u.banned;
      if (filter === "admin") return u.is_admin;
      return true;
    })
    .filter((u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.niche?.toLowerCase().includes(search.toLowerCase())
    );

  const totalCredits = users.reduce((sum, u) => sum + u.credits, 0);

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-[13px] animate-fade-in-down"
          style={{
            background: toast.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
            border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: toast.type === "success" ? "#22c55e" : "#ef4444",
            backdropFilter: "blur(12px)",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: users.length, color: "var(--foreground)" },
          { label: "Active", value: users.filter((u) => !u.banned).length, color: "var(--success)" },
          { label: "Banned", value: users.filter((u) => u.banned).length, color: "var(--danger)" },
          { label: "Total Credits", value: totalCredits.toLocaleString(), color: "var(--accent-copper)" },
        ].map((s, i) => (
          <div key={i} className="liquid-card p-3">
            <p className="text-[9px] uppercase tracking-[0.15em] mb-1" style={{ color: "var(--muted)" }}>{s.label}</p>
            <p className="text-xl font-headline" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search by email, username, or niche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 liquid-input text-[13px]"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "active", "banned", "admin"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded text-[10px] uppercase tracking-[0.1em] transition-all"
              style={{
                background: filter === f ? "rgba(201,168,124,0.12)" : "var(--lg-bg)",
                color: filter === f ? "var(--accent-copper)" : "var(--muted)",
                border: `1px solid ${filter === f ? "rgba(201,168,124,0.3)" : "var(--lg-border)"}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={fetchUsers} className="liquid-btn text-[11px] px-3 py-1.5">Refresh</button>
      </div>

      {/* Users table */}
      <div className="liquid-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--lg-border)" }}>
                {["User", "Credits", "Plan", "Platforms", "Posts", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-medium whitespace-nowrap" style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-[13px]" style={{ color: "var(--muted)" }}>Loading users...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-[13px]" style={{ color: "var(--muted)" }}>No users found</td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--lg-border)" }} className="cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => setSelectedUser(u)}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: "var(--foreground)" }}>{u.full_name || u.username || u.email}</p>
                        <p className="text-[11px]" style={{ color: "var(--muted)" }}>{u.email}</p>
                        {u.niche && <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>{u.niche}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-headline" style={{ color: "var(--accent-copper)" }}>{u.credits}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] capitalize" style={{ color: u.subscription ? "var(--foreground)" : "var(--muted)" }}>
                        {u.subscription?.plan || "free"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px]" style={{ color: u.platforms.connected > 0 ? "var(--success)" : "var(--muted)" }}>
                        {u.platforms.connected}/{u.platforms.total}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                        {u.posts.published}p / {u.posts.total}t
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_admin ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "rgba(201,168,124,0.15)", color: "var(--accent-copper)", border: "1px solid rgba(201,168,124,0.25)" }}>Admin</span>
                      ) : u.banned ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "rgba(239,68,68,0.15)", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.25)" }}>Banned</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "rgba(34,197,94,0.1)", color: "var(--success)", border: "1px solid rgba(34,197,94,0.2)" }}>Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                        {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        {!u.is_admin && (
                          <>
                            <button onClick={() => { setGrantModal(u); setGrantAmount(""); setGrantReason(""); }}
                              className="text-[10px] px-2 py-1 rounded transition-colors"
                              style={{ background: "rgba(201,168,124,0.1)", color: "var(--accent-copper)", border: "1px solid rgba(201,168,124,0.2)" }}>
                              + Cr
                            </button>
                            <button onClick={() => { setBanModal(u); setBanReason(""); }}
                              className="text-[10px] px-2 py-1 rounded transition-colors"
                              style={u.banned
                                ? { background: "rgba(34,197,94,0.1)", color: "var(--success)", border: "1px solid rgba(34,197,94,0.2)" }
                                : { background: "rgba(239,68,68,0.1)", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.2)" }}>
                              {u.banned ? "Unban" : "Ban"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-lg rounded-2xl p-6 max-h-[80vh] overflow-y-auto" style={{ background: "var(--lg-bg-strong)", border: "1px solid var(--lg-border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-headline text-lg" style={{ color: "var(--foreground)" }}>User Details</h3>
              <button onClick={() => setSelectedUser(null)} style={{ color: "var(--muted)" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Profile */}
              <div className="p-4 rounded-xl" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                <p className="text-[10px] uppercase tracking-[0.15em] mb-3" style={{ color: "var(--muted)" }}>Profile</p>
                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <div><span style={{ color: "var(--muted)" }}>Name: </span><span style={{ color: "var(--foreground)" }}>{selectedUser.full_name || "—"}</span></div>
                  <div><span style={{ color: "var(--muted)" }}>Username: </span><span style={{ color: "var(--foreground)" }}>@{selectedUser.username || "—"}</span></div>
                  <div><span style={{ color: "var(--muted)" }}>Email: </span><span style={{ color: "var(--foreground)" }}>{selectedUser.email}</span></div>
                  <div><span style={{ color: "var(--muted)" }}>Niche: </span><span style={{ color: "var(--foreground)" }}>{selectedUser.niche || "—"}</span></div>
                  <div className="col-span-2"><span style={{ color: "var(--muted)" }}>Brand Voice: </span><span style={{ color: "var(--foreground)" }}>{selectedUser.brand_voice || "—"}</span></div>
                  <div className="col-span-2"><span style={{ color: "var(--muted)" }}>Target Audience: </span><span style={{ color: "var(--foreground)" }}>{selectedUser.target_audience || "—"}</span></div>
                </div>
              </div>

              {/* Stats */}
              <div className="p-4 rounded-xl" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                <p className="text-[10px] uppercase tracking-[0.15em] mb-3" style={{ color: "var(--muted)" }}>Stats</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xl font-headline" style={{ color: "var(--accent-copper)" }}>{selectedUser.credits}</p>
                    <p className="text-[10px]" style={{ color: "var(--muted)" }}>Credits</p>
                  </div>
                  <div>
                    <p className="text-xl font-headline" style={{ color: "var(--foreground)" }}>{selectedUser.posts.total}</p>
                    <p className="text-[10px]" style={{ color: "var(--muted)" }}>Posts</p>
                  </div>
                  <div>
                    <p className="text-xl font-headline" style={{ color: "var(--success)" }}>{selectedUser.platforms.connected}</p>
                    <p className="text-[10px]" style={{ color: "var(--muted)" }}>Platforms</p>
                  </div>
                </div>
              </div>

              {/* Subscription & Platforms */}
              <div className="p-4 rounded-xl" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                <p className="text-[10px] uppercase tracking-[0.15em] mb-3" style={{ color: "var(--muted)" }}>Subscription & Platforms</p>
                <div className="space-y-2 text-[12px]">
                  <div><span style={{ color: "var(--muted)" }}>Plan: </span><span style={{ color: "var(--foreground)" }}>{selectedUser.subscription?.plan || "free"} ({selectedUser.subscription?.status || "inactive"})</span></div>
                  <div><span style={{ color: "var(--muted)" }}>Connected: </span><span style={{ color: "var(--foreground)" }}>{selectedUser.platforms.platforms.join(", ") || "None"}</span></div>
                  <div><span style={{ color: "var(--muted)" }}>Posts: </span><span style={{ color: "var(--foreground)" }}>{selectedUser.posts.published} published, {selectedUser.posts.draft} drafts, {selectedUser.posts.scheduled} scheduled</span></div>
                </div>
              </div>

              {/* Metadata */}
              <div className="p-4 rounded-xl" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)" }}>
                <p className="text-[10px] uppercase tracking-[0.15em] mb-3" style={{ color: "var(--muted)" }}>Metadata</p>
                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <div><span style={{ color: "var(--muted)" }}>Joined: </span><span style={{ color: "var(--foreground)" }}>{new Date(selectedUser.created_at).toLocaleDateString()}</span></div>
                  <div><span style={{ color: "var(--muted)" }}>Last Sign-in: </span><span style={{ color: "var(--foreground)" }}>{selectedUser.last_sign_in ? new Date(selectedUser.last_sign_in).toLocaleDateString() : "Never"}</span></div>
                  <div><span style={{ color: "var(--muted)" }}>Onboarded: </span><span style={{ color: selectedUser.onboarded ? "var(--success)" : "var(--danger)" }}>{selectedUser.onboarded ? "Yes" : "No"}</span></div>
                  <div><span style={{ color: "var(--muted)" }}>Admin: </span><span style={{ color: selectedUser.is_admin ? "var(--accent-copper)" : "var(--muted)" }}>{selectedUser.is_admin ? "Yes" : "No"}</span></div>
                </div>
              </div>

              {/* Actions */}
              {!selectedUser.is_admin && (
                <div className="flex gap-3">
                  <button onClick={() => { setGrantModal(selectedUser); setSelectedUser(null); setGrantAmount(""); setGrantReason(""); }}
                    className="flex-1 py-2.5 liquid-btn-primary text-[12px]">+ Grant Credits</button>
                  <button onClick={() => { setBanModal(selectedUser); setSelectedUser(null); setBanReason(""); }}
                    className="flex-1 py-2.5 text-[12px]"
                    style={selectedUser.banned
                      ? { background: "rgba(34,197,94,0.15)", color: "var(--success)", border: "1px solid rgba(34,197,94,0.3)" }
                      : { background: "rgba(239,68,68,0.15)", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.3)" }}>
                    {selectedUser.banned ? "Unban User" : "Ban User"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grant Credits Modal */}
      {grantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setGrantModal(null)}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "var(--lg-bg-strong)", border: "1px solid var(--lg-border)" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="font-headline text-lg mb-1" style={{ color: "var(--foreground)" }}>Grant Credits</h3>
            <p className="text-[12px] mb-5" style={{ color: "var(--muted)" }}>To: {grantModal.email}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] mb-1.5" style={{ color: "var(--muted)" }}>Amount</label>
                <input type="number" min={1} max={10000} value={grantAmount} onChange={(e) => setGrantAmount(e.target.value)} placeholder="100" className="w-full px-4 py-2.5 liquid-input text-[14px]" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] mb-1.5" style={{ color: "var(--muted)" }}>Reason</label>
                <input type="text" value={grantReason} onChange={(e) => setGrantReason(e.target.value)} placeholder="Promotional bonus" className="w-full px-4 py-2.5 liquid-input text-[13px]" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setGrantModal(null)} className="flex-1 py-2.5 liquid-btn text-[12px]">Cancel</button>
              <button onClick={handleGrant} disabled={granting || !grantAmount || !grantReason} className="flex-1 py-2.5 liquid-btn-primary text-[12px] disabled:opacity-50">
                {granting ? "Granting..." : "Grant"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setBanModal(null)}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "var(--lg-bg-strong)", border: "1px solid var(--lg-border)" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="font-headline text-lg mb-1" style={{ color: "var(--foreground)" }}>
              {banModal.banned ? "Unban User" : "Ban User"}
            </h3>
            <p className="text-[12px] mb-5" style={{ color: "var(--muted)" }}>
              {banModal.banned ? `Unban ${banModal.email}?` : `Ban ${banModal.email}? This will restrict their access.`}
            </p>
            {!banModal.banned && (
              <div className="mb-4">
                <label className="block text-[11px] uppercase tracking-[0.1em] mb-1.5" style={{ color: "var(--muted)" }}>Reason</label>
                <input type="text" value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="Violation of terms" className="w-full px-4 py-2.5 liquid-input text-[13px]" />
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setBanModal(null)} className="flex-1 py-2.5 liquid-btn text-[12px]">Cancel</button>
              <button
                onClick={() => handleBan(banModal.banned ? "unban" : "ban")}
                disabled={banning || (!banModal.banned && !banReason)}
                className={`flex-1 py-2.5 text-[12px] disabled:opacity-50 ${banModal.banned ? "liquid-btn" : ""}`}
                style={banModal.banned ? {} : { background: "rgba(239,68,68,0.15)", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.3)" }}>
                {banning ? "Processing..." : banModal.banned ? "Unban" : "Ban"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// AUDIT LOG TAB
// ══════════════════════════════════════════════════════════════

function AuditTab() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState("");
  const limit = 25;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(limit), offset: String(page * limit) });
    if (actionFilter) params.set("action", actionFilter);
    fetch(`/api/admin/audit?${params}`)
      .then((r) => r.json())
      .then((data) => { setEntries(data.entries || []); setTotal(data.total || 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, [page, actionFilter]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Filter by action (e.g. admin_list_users)"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
          className="flex-1 max-w-md px-4 py-2.5 liquid-input text-[13px]"
        />
        <span className="text-[12px]" style={{ color: "var(--muted)" }}>{total} entries</span>
      </div>

      {/* Log entries */}
      <div className="liquid-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--lg-border)" }}>
                {["Time", "Action", "User", "IP", "Details"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-medium" style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-[13px]" style={{ color: "var(--muted)" }}>Loading...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-[13px]" style={{ color: "var(--muted)" }}>No audit entries found</td></tr>
              ) : (
                entries.map((e) => (
                  <tr key={e.id} style={{ borderBottom: "1px solid var(--lg-border)" }}>
                    <td className="px-4 py-2.5 text-[11px] whitespace-nowrap" style={{ color: "var(--muted)" }}>
                      {new Date(e.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "var(--lg-bg)", border: "1px solid var(--lg-border)", color: "var(--foreground)" }}>
                        {e.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[11px]" style={{ color: "var(--muted)" }}>
                      {e.profiles?.email || e.user_id?.slice(0, 8)}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                      {e.ip_address || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-[11px]" style={{ color: "var(--muted)" }}>
                      {e.table_name && <span>{e.table_name}</span>}
                      {e.record_id && <span> · {e.record_id.slice(0, 8)}</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="liquid-btn text-[11px] px-3 py-1.5 disabled:opacity-30">
            ← Previous
          </button>
          <span className="text-[12px]" style={{ color: "var(--muted)" }}>
            Page {page + 1} of {totalPages}
          </span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="liquid-btn text-[11px] px-3 py-1.5 disabled:opacity-30">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// HEALTH TAB
// ══════════════════════════════════════════════════════════════

function HealthTab() {
  const [health, setHealth] = useState<{ status: string; healthy: boolean; message: string; tables: Record<string, { healthy: boolean; error?: string }> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const checkHealth = () => {
    setLoading(true);
    setError("");
    fetch("/api/health/db")
      .then((r) => r.json())
      .then((data) => { setHealth(data); setLoading(false); })
      .catch(() => { setError("Failed to check health"); setLoading(false); });
  };

  useEffect(() => { checkHealth(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>Database Health</h3>
        <button onClick={checkHealth} className="liquid-btn text-[11px] px-3 py-1.5">
          {loading ? "Checking..." : "Re-check"}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p className="text-[13px]" style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}

      {health && (
        <>
          <div className="p-4 rounded-xl flex items-center gap-3" style={{
            background: health.healthy ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${health.healthy ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}>
            <div className="w-3 h-3 rounded-full" style={{ background: health.healthy ? "var(--success)" : "var(--danger)" }} />
            <span className="text-[13px] font-medium" style={{ color: health.healthy ? "var(--success)" : "var(--danger)" }}>
              {health.status.toUpperCase()}
            </span>
            <span className="text-[12px]" style={{ color: "var(--muted)" }}>{health.message}</span>
          </div>

          <div className="liquid-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--lg-border)" }}>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-medium" style={{ color: "var(--muted)" }}>Table</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-medium" style={{ color: "var(--muted)" }}>Status</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-medium" style={{ color: "var(--muted)" }}>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(health.tables).map(([table, info]) => (
                    <tr key={table} style={{ borderBottom: "1px solid var(--lg-border)" }}>
                      <td className="px-4 py-2.5 text-[12px] font-mono" style={{ color: "var(--foreground)" }}>{table}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: info.healthy ? "var(--success)" : "var(--danger)" }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: info.healthy ? "var(--success)" : "var(--danger)" }} />
                          {info.healthy ? "Healthy" : "Error"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[11px]" style={{ color: "var(--danger)" }}>
                        {info.error || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
