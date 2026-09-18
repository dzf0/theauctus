/**
 * Paddle SDK helpers
 *
 * Server-side: getPaddleInstance() returns a Paddle Node SDK instance
 * Client-side: initializePaddle() returns a Paddle.js instance
 *
 * Env vars needed:
 *   NEXT_PUBLIC_PADDLE_ENV        — "sandbox" or "production"
 *   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN — client-side token (safe to expose)
 *   PADDLE_API_KEY                — server-side API key (never expose)
 */

import {
  Environment,
  LogLevel,
  Paddle,
  type PaddleOptions,
} from "@paddle/paddle-node-sdk";

// ══════════════════════════════════════════════════════════════
// Server-side: Paddle Node SDK instance
// ══════════════════════════════════════════════════════════════

let paddleInstance: Paddle | null = null;

export function getPaddleInstance(): Paddle {
  if (paddleInstance) return paddleInstance;

  if (!process.env.PADDLE_API_KEY) {
    throw new Error(
      "PADDLE_API_KEY is not set. Get one from Paddle Dashboard → Developer tools → Authentication"
    );
  }

  const options: PaddleOptions = {
    environment:
      (process.env.NEXT_PUBLIC_PADDLE_ENV as Environment) ??
      Environment.sandbox,
    logLevel: LogLevel.error,
  };

  paddleInstance = new Paddle(process.env.PADDLE_API_KEY, options);
  return paddleInstance;
}

// ══════════════════════════════════════════════════════════════
// Shared helpers
// ══════════════════════════════════════════════════════════════

export function getPaddleEnv(): "sandbox" | "production" {
  return (process.env.NEXT_PUBLIC_PADDLE_ENV as "sandbox" | "production") ?? "sandbox";
}

export function getPaddleClientId(): string {
  return process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";
}

export function isPaddleConfigured(): boolean {
  return !!(process.env.PADDLE_API_KEY && process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN);
}
