import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// GET /api/posts — Get all posts for the current user
export async function GET(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");

  const where: Record<string, unknown> = { userId: user.id };
  if (status) where.status = status;
  if (platform) where.platform = platform;

  const posts = await prisma.post.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(posts);
}

// POST /api/posts — Create a new post
export async function POST(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, content, platform, contentType, scheduledAt, hashtags, calendarId } = body;

  if (!title || !content || !platform) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      userId: user.id,
      calendarId: calendarId || null,
      title,
      content,
      platform,
      contentType: contentType || "text",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      hashtags: hashtags ? JSON.stringify(hashtags) : null,
      aiGenerated: body.aiGenerated ?? true,
    },
  });

  return NextResponse.json(post, { status: 201 });
}

// PATCH /api/posts — Update a post
export async function PATCH(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
  }

  const existing = await prisma.post.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (updates.scheduledAt) updates.scheduledAt = new Date(updates.scheduledAt);
  if (updates.publishedAt) updates.publishedAt = new Date(updates.publishedAt);

  const post = await prisma.post.update({
    where: { id },
    data: updates,
  });

  return NextResponse.json(post);
}

// DELETE /api/posts?id=xxx
export async function DELETE(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
  }

  const existing = await prisma.post.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await prisma.post.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
