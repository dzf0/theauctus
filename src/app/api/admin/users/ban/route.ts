import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { apiValidationError } from "@/lib/errors";

export const POST = withAuth(
  async (request, { supabase }) => {
    const body = await request.json();
    const { user_id, action, reason } = body;

    if (!user_id || typeof user_id !== "string") {
      return apiValidationError("user_id is required");
    }

    if (action !== "ban" && action !== "unban") {
      return apiValidationError("action must be 'ban' or 'unban'");
    }

    if (action === "ban") {
      if (!reason || typeof reason !== "string" || reason.length > 500) {
        return apiValidationError("reason is required for banning (max 500 characters)");
      }

      // Check not banning another admin
      const admin = createSupabaseAdminClient();
      const { data: authUser } = await admin.auth.admin.getUserById(user_id);
      const adminEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase());

      if (adminEmails.includes((authUser?.user?.email || "").toLowerCase())) {
        return NextResponse.json({ error: "Cannot ban an admin user" }, { status: 400 });
      }

      // Insert ban record
      const { error } = await supabase.from("ip_bans").upsert(
        {
          identifier: user_id,
          reason,
          banned_at: new Date().toISOString(),
          banned_by: null, // set by RLS or middleware context
        },
        { onConflict: "identifier" }
      );

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: "banned", user_id });
    } else {
      // Unban
      const { error } = await supabase
        .from("ip_bans")
        .delete()
        .eq("identifier", user_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, action: "unbanned", user_id });
    }
  },
  {
    requireAdmin: true,
    rateLimit: { limit: 20, windowMs: 60_000 },
    rateLimitKey: "admin:users:ban",
    auditAction: "admin_ban_user",
  }
);
