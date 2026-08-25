import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMITS,
} from "@/lib/rate-limit";

// Fix #9: Whitelist allowed OTP types
const VALID_OTP_TYPES = ["signup", "email", "magiclink"] as const;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, token, type } = body;

  if (!email || !token) {
    return NextResponse.json(
      { error: "Email and verification code are required" },
      { status: 400 }
    );
  }

  // Rate limit: 5 attempts per 15 min per IP+email
  const ip = getClientIp(request);
  const rateLimitKey = `verify-otp:${ip}:${email}`;
  const { allowed, remaining, retryAfterSeconds } = await checkRateLimit(
    rateLimitKey,
    RATE_LIMITS.verifyOtp.limit,
    RATE_LIMITS.verifyOtp.windowMs
  );

  if (!allowed) {
    return NextResponse.json(
      {
        error: `Too many attempts. Try again in ${retryAfterSeconds} seconds.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Limit": String(RATE_LIMITS.verifyOtp.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const supabase = await createSupabaseServerClient();

  // Fix #9: Validate type against allowlist
  const otpType = VALID_OTP_TYPES.includes(type) ? type : "signup";

  // Verify the OTP
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: otpType,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message || "Invalid or expired verification code" },
      {
        status: 400,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMITS.verifyOtp.limit),
          "X-RateLimit-Remaining": String(remaining),
        },
      }
    );
  }

  // Fix #8: Don't leak user object
  return NextResponse.json(
    {
      message: "Email verified successfully",
    },
    {
      headers: {
        "X-RateLimit-Limit": String(RATE_LIMITS.verifyOtp.limit),
        "X-RateLimit-Remaining": String(remaining),
      },
    }
  );
}
