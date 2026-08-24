import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const body = await request.json();
  const { email, token, type } = body;

  if (!email || !token) {
    return NextResponse.json(
      { error: "Email and verification code are required" },
      { status: 400 }
    );
  }

  // Verify the OTP
  // When verifyOtp succeeds, supabase sets session cookies via setAll
  // Next.js App Router automatically includes these in the response
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: (type as "signup" | "email" | "magiclink") || "signup",
  });

  if (error) {
    return NextResponse.json(
      { error: error.message || "Invalid or expired verification code" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: "Email verified successfully",
    user: data.user,
  });
}
