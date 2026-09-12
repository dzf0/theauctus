// ══════════════════════════════════════════════════════════════
// WEBHOOK HANDLERS
// Prepared handlers for Paddle, Razorpay, and platform webhooks
// ══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { Platform } from "./types";

// ══════════════════════════════════════════════════════════════
// PADDLE WEBHOOK HANDLER (Merchant of Record)
// ══════════════════════════════════════════════════════════════

export interface PaddleWebhookHandler {
  handleTransactionCompleted: (transactionId: string, userId: string) => Promise<void>;
  handleTransactionUpdated: (transactionId: string) => Promise<void>;
}

export const paddleWebhookHandler: PaddleWebhookHandler = {
  async handleTransactionCompleted(transactionId: string, userId: string) {
    console.log("[PADDLE] Transaction completed:", transactionId, "user:", userId);
  },

  async handleTransactionUpdated(transactionId: string) {
    console.log("[PADDLE] Transaction updated:", transactionId);
  },
};

// ══════════════════════════════════════════════════════════════
// RAZORPAY WEBHOOK HANDLER (India payments)
// ══════════════════════════════════════════════════════════════

export interface RazorpayWebhookHandler {
  handlePaymentCaptured: (paymentId: string, userId: string) => Promise<void>;
  handlePaymentFailed: (paymentId: string) => Promise<void>;
}

export const razorpayWebhookHandler: RazorpayWebhookHandler = {
  async handlePaymentCaptured(paymentId: string, userId: string) {
    console.log("[RAZORPAY] Payment captured:", paymentId, "user:", userId);
  },

  async handlePaymentFailed(paymentId: string) {
    console.error("[RAZORPAY] Payment failed:", paymentId);
  },
};

// ══════════════════════════════════════════════════════════════
// PLATFORM WEBHOOK HANDLER
// ══════════════════════════════════════════════════════════════

export interface PlatformWebhookHandler {
  handlePostPublished: (platform: Platform, postId: string, data: Record<string, unknown>) => Promise<void>;
  handlePostFailed: (platform: Platform, postId: string, error: string) => Promise<void>;
  handleMetricsUpdated: (platform: Platform, metrics: PlatformMetrics) => Promise<void>;
  handleConnectionRevoked: (platform: Platform, userId: string) => Promise<void>;
}

export interface PlatformMetrics {
  followers: number;
  engagement: number;
  reach: number;
  impressions: number;
}

export const platformWebhookHandler: PlatformWebhookHandler = {
  async handlePostPublished(platform: Platform, postId: string, data: Record<string, unknown>) {
    // TODO: Implement platform-specific post published handling
    console.log(`[${platform}] Post published:`, postId, data);
  },

  async handlePostFailed(platform: Platform, postId: string, error: string) {
    // TODO: Implement platform-specific post failed handling
    console.error(`[${platform}] Post failed:`, postId, error);
  },

  async handleMetricsUpdated(platform: Platform, metrics: PlatformMetrics) {
    // TODO: Implement metrics update handling
    console.log(`[${platform}] Metrics updated:`, metrics);
  },

  async handleConnectionRevoked(platform: Platform, userId: string) {
    // TODO: Handle platform connection being revoked
    console.log(`[${platform}] Connection revoked for user:`, userId);
  },
};

// ══════════════════════════════════════════════════════════════
// WEBHOOK SIGNATURE VERIFICATION
// ══════════════════════════════════════════════════════════════

import crypto from "crypto";

/**
 * Verify Paddle webhook signature (HMAC-SHA256).
 * The canonical verification happens in /api/webhooks/paddle/route.ts.
 * This is exported for any shared use.
 */
export function verifyPaddleSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

/**
 * Verify Razorpay webhook signature (HMAC-SHA256).
 * The canonical verification happens in /api/webhooks/razorpay/route.ts.
 */
export function verifyRazorpaySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

export function verifyPlatformSignature(
  platform: Platform,
  payload: string,
  signature: string
): boolean {
  // TODO: Implement platform-specific signature verification
  console.warn(`[${platform}] Signature verification not implemented`);
  return true;
}

// ══════════════════════════════════════════════════════════════
// WEBHOOK ROUTE BUILDER
// ══════════════════════════════════════════════════════════════

export function buildWebhookRoute(platform: Platform) {
  return async function POST(request: Request) {
    try {
      const body = await request.text();
      const signature = request.headers.get("x-webhook-signature") || "";

      // Verify signature
      if (!verifyPlatformSignature(platform, body, signature)) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }

      const event = JSON.parse(body);

      // Route to appropriate handler
      switch (event.type) {
        case "post.published":
          await platformWebhookHandler.handlePostPublished(
            platform,
            event.data.postId,
            event.data
          );
          break;
        case "post.failed":
          await platformWebhookHandler.handlePostFailed(
            platform,
            event.data.postId,
            event.data.error
          );
          break;
        case "metrics.updated":
          await platformWebhookHandler.handleMetricsUpdated(
            platform,
            event.data.metrics
          );
          break;
        case "connection.revoked":
          await platformWebhookHandler.handleConnectionRevoked(
            platform,
            event.data.userId
          );
          break;
        default:
          console.warn(`[${platform}] Unknown webhook event:`, event.type);
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error(`[${platform}] Webhook error:`, error);
      return NextResponse.json(
        { error: "Webhook processing failed" },
        { status: 500 }
      );
    }
  };
}
