import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// GET /api/posts — Get all posts for the current user
export async function GET(request: NextRequest) {
  const user = await requireAuth();
  const supabase = await createSupabaseServerClient();

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
}

// POST /api/posts — Create a new post
export async function POST(request: NextRequest) {
  const user = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const body = await request.json();
  const { title, content, platform, contentType, scheduledAt, hashtags, calendarId } = body;

  if (!title || !content || !platform) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
      hashtags: hashtags || [],
      ai_generated: body.aiGenerated ?? true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(post, { status: 201 });
}

// PATCH /api/posts — Update a post
export async function PATCH(request: NextRequest) {
  const user = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
  }

  // Verify post belongs to user
  const { data: existing } = await supabase
    .from("posts")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Map camelCase to snake_case
  const updateData: Record<string, unknown> = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.content !== undefined) updateData.content = updates.content;
  if (updates.platform !== undefined) updateData.platform = updates.platform;
  if (updates.contentType !== undefined) updateData.content_type = updates.contentType;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.scheduledAt !== undefined) updateData.scheduled_at = updates.scheduledAt;
  if (updates.publishedAt !== undefined) updateData.published_at = updates.publishedAt;
  if (updates.hashtags !== undefined) updateData.hashtags = updates.hashtags;
  updateData.updated_at = new Date().toISOString();

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
}

// DELETE /api/posts?id=xxx
export async function DELETE(request: NextRequest) {
  const user = await requireAuth();
  const supabase = await createSupabaseServerClient();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
  }

  // Verify post belongs to user
  const { data: existing } = await supabase
    .from("posts")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
