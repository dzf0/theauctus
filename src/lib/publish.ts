// ══════════════════════════════════════════════════════════════
// PUBLISH SERVICE
// Unified interface for publishing content to social platforms.
// Each platform has its own adapter that implements the
// PlatformAdapter interface.
// ══════════════════════════════════════════════════════════════

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { auditLog } from "@/lib/api-middleware";
import type { Platform } from "@/lib/types";

// ── Types ────────────────────────────────────────────────────

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  error?: string;
  permalink?: string;
}

export interface PlatformAdapter {
  name: string;
  publish(params: {
    content: string;
    title?: string;
    hashtags: string[];
    mediaUrls: string[];
    accessToken: string;
    refreshToken?: string;
    platformUserId?: string;
  }): Promise<PublishResult>;

  refreshToken?(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  } | null>;
}

// ── Adapter registry ─────────────────────────────────────────

const adapters: Record<string, () => PlatformAdapter> = {};

export function registerAdapter(platform: string, factory: () => PlatformAdapter) {
  adapters[platform] = factory;
}

function getAdapter(platform: string): PlatformAdapter | null {
  const factory = adapters[platform];
  return factory ? factory() : null;
}

// ── Main publish function ────────────────────────────────────

export async function publishPost(postId: string): Promise<PublishResult> {
  const supabase = createSupabaseAdminClient();

  // 1. Fetch the post
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (postError || !post) {
    return { success: false, error: "Post not found" };
  }

  if (post.status === "published") {
    return { success: false, error: "Post already published" };
  }

  // 2. Get the platform connection
  const { data: connection, error: connError } = await supabase
    .from("connected_platforms")
    .select("*")
    .eq("user_id", post.user_id)
    .eq("platform", post.platform)
    .eq("connected", true)
    .single();

  if (connError || !connection) {
    return { success: false, error: `Platform ${post.platform} not connected` };
  }

  // 3. Check if token is expired and refresh if needed
  let accessToken = connection.access_token;
  if (connection.token_expires_at && new Date(connection.token_expires_at) < new Date()) {
    const adapter = getAdapter(post.platform);
    if (adapter?.refreshToken && connection.refresh_token) {
      const refreshed = await adapter.refreshToken(connection.refresh_token);
      if (refreshed) {
        accessToken = refreshed.accessToken;
        await supabase
          .from("connected_platforms")
          .update({
            access_token: refreshed.accessToken,
            refresh_token: refreshed.refreshToken || connection.refresh_token,
            token_expires_at: refreshed.expiresAt?.toISOString() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", connection.id);
      }
    }
  }

  // 4. Get the adapter
  const adapter = getAdapter(post.platform);
  if (!adapter) {
    return { success: false, error: `No adapter for platform: ${post.platform}` };
  }

  // 5. Publish
  const result = await adapter.publish({
    content: post.content,
    title: post.title,
    hashtags: post.hashtags || [],
    mediaUrls: post.media_urls || [],
    accessToken,
    refreshToken: connection.refresh_token,
    platformUserId: connection.platform_user_id,
  });

  // 6. Update the post
  if (result.success) {
    await supabase
      .from("posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        platform_post_id: result.platformPostId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);

    // Audit log
    auditLog({
      userId: post.user_id,
      action: "post_published",
      tableName: "posts",
      recordId: postId,
      newData: { platform: post.platform, platformPostId: result.platformPostId },
    }).catch(() => {});

    // Deduct credit
    const { data: balance } = await supabase
      .from("credit_balances")
      .select("balance")
      .eq("user_id", post.user_id)
      .single();

    if (balance) {
      await supabase
        .from("credit_balances")
        .update({ balance: Math.max(0, balance.balance - 1), updated_at: new Date().toISOString() })
        .eq("user_id", post.user_id);

      await supabase.from("credit_history").insert({
        user_id: post.user_id,
        amount: -1,
        type: "usage",
        description: `Published to ${post.platform}`,
        reference_id: postId,
      });
    }
  } else {
    await supabase
      .from("posts")
      .update({
        status: "failed",
        publish_error: result.error || "Unknown error",
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);
  }

  return result;
}

// ── Batch publish ────────────────────────────────────────────

export async function publishScheduledPosts(): Promise<{
  published: number;
  failed: number;
  skipped: number;
}> {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  // Find all posts scheduled for now or earlier
  const { data: posts } = await supabase
    .from("posts")
    .select("id")
    .eq("status", "scheduled")
    .lte("scheduled_at", now)
    .limit(50); // Process in batches of 50

  if (!posts || posts.length === 0) {
    return { published: 0, failed: 0, skipped: 0 };
  }

  let published = 0;
  let failed = 0;

  for (const post of posts) {
    const result = await publishPost(post.id);
    if (result.success) published++;
    else failed++;
  }

  return { published, failed, skipped: 0 };
}
