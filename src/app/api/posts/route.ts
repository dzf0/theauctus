import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { apiValidationError, apiNotFound } from "@/lib/errors";

// GET /api/posts — Get all posts for the current user
export const GET = withAuth(
  async (request, { supabase, user }) => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const platform = searchParams.get("platform");

    let query = supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_at", { ascending: true });

    if (status) {
      query = query.eq("status", status);
    }
    if (platform) {
      query = query.eq("platform", platform);
    }

    const { data: posts, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(posts);
  },
  {
    rateLimit: { limit: 30, windowMs: 60_000 },
    rateLimitKey: "posts:GET",
  }
);

// POST /api/posts — Create a new post
export const POST = withAuth(
  async (request, { supabase, user }) => {
    const body = await request.json();
    const {
      title,
      content,
      platform,
      contentType,
      scheduledAt,
      hashtags,
      calendarId,
    } = body;

    if (!title || !content || !platform) {
      return apiValidationError("Missing required fields");
    }

    // Validate platform
    const validPlatforms = [
      "twitter",
      "instagram",
      "linkedin",
      "tiktok",
      "youtube",
      "threads",
      "facebook",
      "blog",
    ];
    if (!validPlatforms.includes(platform)) {
      return apiValidationError("Invalid platform", "platform");
    }

    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        calendar_id: calendarId || null,
        title,
        content,
        platform,
        content_type: contentType || "text",
        scheduled_at: scheduledAt || null,
        hashtags: Array.isArray(hashtags) ? hashtags : [],
        ai_generated: body.aiGenerated ?? true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(post, { status: 201 });
  },
  {
    rateLimit: { limit: 20, windowMs: 60_000 },
    rateLimitKey: "posts:POST",
    auditAction: "create_post",
  }
);

// PATCH /api/posts — Update a post
export const PATCH = withAuth(
  async (request, { supabase, user }) => {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return apiValidationError("Missing post ID", "id");
    }

    // Verify post belongs to user
    const { data: existing } = await supabase
      .from("posts")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      return apiNotFound("Post");
    }

    // Map camelCase to snake_case with validation
    const allowedFields = new Set([
      "title",
      "content",
      "platform",
      "contentType",
      "status",
      "scheduledAt",
      "publishedAt",
      "hashtags",
    ]);

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (!allowedFields.has(key)) continue;
      switch (key) {
        case "title":
          updateData.title = value;
          break;
        case "content":
          updateData.content = value;
          break;
        case "platform":
          updateData.platform = value;
          break;
        case "contentType":
          updateData.content_type = value;
          break;
        case "status":
          updateData.status = value;
          break;
        case "scheduledAt":
          updateData.scheduled_at = value;
          break;
        case "publishedAt":
          updateData.published_at = value;
          break;
        case "hashtags":
          updateData.hashtags = value;
          break;
      }
    }
    updateData.updated_at = new Date().toISOString();

    if (Object.keys(updateData).length <= 1) {
      // Only updated_at — nothing meaningful to update
      return apiValidationError("No valid fields to update");
    }

    const { data: post, error } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(post);
  },
  {
    rateLimit: { limit: 30, windowMs: 60_000 },
    rateLimitKey: "posts:PATCH",
    auditAction: "update_post",
  }
);

// DELETE /api/posts?id=xxx
export const DELETE = withAuth(
  async (request, { supabase, user }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return apiValidationError("Missing post ID", "id");
    }

    // Verify post belongs to user
    const { data: existing } = await supabase
      .from("posts")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      return apiNotFound("Post");
    }

    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  },
  {
    rateLimit: { limit: 20, windowMs: 60_000 },
    rateLimitKey: "posts:DELETE",
    auditAction: "delete_post",
  }
);
