import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  // Send OTP for email verification
  const { error } = await supabase.auth.sendOtp({
    email,
    options: {
      // This sends a 6-digit OTP code
    },
  });

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to resend verification code" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: "Verification code sent successfully",
  });
}
