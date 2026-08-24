import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const body = await request.json();
  const { email, password, username, fullName } = body;

  if (!email || !password || !username || !fullName) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  // Check if username is already taken
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (existingUser) {
    return NextResponse.json(
      { error: "Username is already taken" },
      { status: 400 }
    );
  }

  // Sign up with Supabase Auth (without email redirect - we'll send OTP separately)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username: username,
      },
      // Don't set emailRedirectTo - we want OTP, not magic link
    },
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  // Now send OTP for email verification
  const { error: otpError } = await supabase.auth.sendOtp({
    email,
    options: {
      // This sends a 6-digit OTP code
    },
  });

  if (otpError) {
    console.error("OTP send error:", otpError);
    // Account was created but OTP failed - still redirect to verify page
    // User can use resend to get the code
  }

  // Check if email confirmation is needed
  if (data.user && !data.session) {
    return NextResponse.json({
      message: "Verification code sent",
      email: data.user.email,
      needsVerification: true,
    });
  }

  // If auto-confirmed (rare in production)
  return NextResponse.json({
    message: "Account created successfully",
    user: data.user,
    session: data.session,
  });
}
