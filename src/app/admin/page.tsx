"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/components/user-provider";
import { useRouter } from "next/navigation";

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
  onboarded: boolean;
  username: string | null;
}

export default function AdminPage() {
  const user = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [grantModal, setGrantModal] = useState<AdminUser | null>(null);
  const [grantAmount, setGrantAmount] = useState("");
  const [grantReason, setGrantReason] = useState("");
  const [granting, setGranting] = useState(false);
  const [banModal, setBanModal] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banning, setBanning] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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

  // Fetch users
  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
  }, [isAdmin]);

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleGrant = async () => {
    if (!grantModal || !grantAmount || !grantReason) return;
    setGranting(true);
    try {
      const res = await fetch("/api/admin/credits/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: grantModal.id,
          amount: parseInt(grantAmount, 10),
          reason: grantReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Granted ${grantAmount} credits to ${grantModal.email}`, "success");
        setGrantModal(null);
        setGrantAmount("");
        setGrantReason("");
        fetchUsers();
      } else {
        showToast(data.error || "Failed to grant credits", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setGranting(false);
    }
  };

  const handleBan = async (action: "ban" | "unban") => {
    if (!banModal) return;
    if (action === "ban" && !banReason) return;
    setBanning(true);
    try {
      const res = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: banModal.id,
          action,
          reason: action === "ban" ? banReason : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(action === "ban" ? `Banned ${banModal.email}` : `Unbanned ${banModal.email}`, "success");
        setBanModal(null);
        setBanReason("");
        fetchUsers();
      } else {
        showToast(data.error || "Failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setBanning(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.niche?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCredits = users.reduce((sum, u) => sum + u.credits, 0);
  const bannedCount = users.filter((u) => u.banned).length;

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center py-20" style={{ color: "var(--muted)" }}>
        <div className="generating-spinner" style={{ width: 20, height: 20 }} />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-6 animate-fade-in">
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

      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Admin Panel</h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Manage users, credits, and moderation</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: users.length, color: "var(--foreground)" },
          { label: "Active Users", value: users.filter((u) => !u.banned).length, color: "var(--success)" },
          { label: "Banned", value: bannedCount, color: "var(--danger)" },
          { label: "Total Credits", value: totalCredits.toLocaleString(), color: "var(--accent-copper)" },
        ].map((stat, i) => (
          <div key={i} className="liquid-card p-4">
            <p className="text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: "var(--muted)" }}>{stat.label}</p>
            <p className="text-2xl font-headline" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
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
        <button onClick={fetchUsers} className="liquid-btn text-[12px] px-4 py-2.5">
          Refresh
        </button>
      </div>

      {/* Users table */}
      <div className="liquid-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--lg-border)" }}>
                {["User", "Credits", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-medium" style={{ color: "var(--muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[13px]" style={{ color: "var(--muted)" }}>
                    Loading users...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[13px]" style={{ color: "var(--muted)" }}>
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--lg-border)" }}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: "var(--foreground)" }}>
                          {u.username || u.email}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--muted)" }}>{u.email}</p>
                        {u.niche && (
                          <p className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>{u.niche}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-headline" style={{ color: "var(--accent-copper)" }}>
                        {u.credits}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_admin ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "rgba(201,168,124,0.15)", color: "var(--accent-copper)", border: "1px solid rgba(201,168,124,0.25)" }}>
                          Admin
                        </span>
                      ) : u.banned ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "rgba(239,68,68,0.15)", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.25)" }}>
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "rgba(34,197,94,0.1)", color: "var(--success)", border: "1px solid rgba(34,197,94,0.2)" }}>
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                        {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      {u.last_sign_in && (
                        <p className="text-[10px]" style={{ color: "var(--muted)" }}>
                          Last: {new Date(u.last_sign_in).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!u.is_admin && (
                          <>
                            <button
                              onClick={() => { setGrantModal(u); setGrantAmount(""); setGrantReason(""); }}
                              className="text-[11px] px-3 py-1.5 rounded-lg transition-colors"
                              style={{ background: "rgba(201,168,124,0.1)", color: "var(--accent-copper)", border: "1px solid rgba(201,168,124,0.2)" }}
                            >
                              + Credits
                            </button>
                            {u.banned ? (
                              <button
                                onClick={() => { setBanModal(u); setBanReason(""); }}
                                className="text-[11px] px-3 py-1.5 rounded-lg transition-colors"
                                style={{ background: "rgba(34,197,94,0.1)", color: "var(--success)", border: "1px solid rgba(34,197,94,0.2)" }}
                              >
                                Unban
                              </button>
                            ) : (
                              <button
                                onClick={() => { setBanModal(u); setBanReason(""); }}
                                className="text-[11px] px-3 py-1.5 rounded-lg transition-colors"
                                style={{ background: "rgba(239,68,68,0.1)", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.2)" }}
                              >
                                Ban
                              </button>
                            )}
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

      {/* Grant Credits Modal */}
      {grantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setGrantModal(null)}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "var(--lg-bg-strong)", border: "1px solid var(--lg-border)" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="font-headline text-lg mb-1" style={{ color: "var(--foreground)" }}>Grant Credits</h3>
            <p className="text-[12px] mb-5" style={{ color: "var(--muted)" }}>To: {grantModal.email}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] mb-1.5" style={{ color: "var(--muted)" }}>Amount</label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(e.target.value)}
                  placeholder="100"
                  className="w-full px-4 py-2.5 liquid-input text-[14px]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.1em] mb-1.5" style={{ color: "var(--muted)" }}>Reason</label>
                <input
                  type="text"
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  placeholder="Promotional bonus"
                  className="w-full px-4 py-2.5 liquid-input text-[13px]"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setGrantModal(null)} className="flex-1 py-2.5 liquid-btn text-[12px]">Cancel</button>
              <button
                onClick={handleGrant}
                disabled={granting || !grantAmount || !grantReason}
                className="flex-1 py-2.5 liquid-btn-primary text-[12px] disabled:opacity-50"
              >
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
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Violation of terms"
                  className="w-full px-4 py-2.5 liquid-input text-[13px]"
                />
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setBanModal(null)} className="flex-1 py-2.5 liquid-btn text-[12px]">Cancel</button>
              <button
                onClick={() => handleBan(banModal.banned ? "unban" : "ban")}
                disabled={banning || (!banModal.banned && !banReason)}
                className={`flex-1 py-2.5 text-[12px] disabled:opacity-50 ${banModal.banned ? "liquid-btn" : ""}`}
                style={banModal.banned ? {} : { background: "rgba(239,68,68,0.15)", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.3)" }}
              >
                {banning ? "Processing..." : banModal.banned ? "Unban" : "Ban"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
