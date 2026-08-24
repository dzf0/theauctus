import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMITS,
} from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  // Rate limit: 3 requests per 5 min per IP+email
  const ip = getClientIp(request);
  const rateLimitKey = `resend-otp:${ip}:${email}`;
  const { allowed, remaining, retryAfterSeconds } = checkRateLimit(
    rateLimitKey,
    RATE_LIMITS.resendOtp.limit,
    RATE_LIMITS.resendOtp.windowMs
  );

  if (!allowed) {
    return NextResponse.json(
      {
        error: `Too many requests. Try again in ${retryAfterSeconds} seconds.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Limit": String(RATE_LIMITS.resendOtp.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const supabase = await createSupabaseServerClient();

  // Resend verification email using Supabase built-in method
  const { error } = await supabase.auth.resend({
    email,
    type: "signup",
  });

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to resend verification code" },
      {
        status: 400,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMITS.resendOtp.limit),
          "X-RateLimit-Remaining": String(remaining),
        },
      }
    );
  }

  return NextResponse.json(
    {
      message: "Verification code sent successfully",
    },
    {
      headers: {
        "X-RateLimit-Limit": String(RATE_LIMITS.resendOtp.limit),
        "X-RateLimit-Remaining": String(remaining),
      },
    }
  );
}
