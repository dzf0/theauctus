import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll(cookiesToSet) {
          // We can't set cookies here since we're in a route handler
          // Instead, we'll handle this in the response
        },
      },
    }
  );

  // Sign out from Supabase (this clears the server session)
  try {
    await supabase.auth.signOut();
  } catch {
    // Continue even if signOut fails
  }

  // Clear auth cookies manually
  const response = NextResponse.redirect(new URL("/", request.url));

  // Clear all Supabase auth cookies
  const cookieNames = [
    "sb-access-token",
    "sb-refresh-token",
    "auth-token",
  ];

  for (const name of cookieNames) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  // Also try to clear any cookie that starts with sb-
  const allCookies = request.headers.get("cookie") || "";
  const cookieMatches = allCookies.match(/sb-[^=]+/g) || [];
  for (const name of cookieMatches) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return response;
}

// Also handle GET for browser navigation
export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));

  // Clear all auth cookies
  const allCookies = request.headers.get("cookie") || "";
  const cookieNames = [
    "sb-access-token",
    "sb-refresh-token",
    "auth-token",
    ...(allCookies.match(/sb-[^=]+/g) || []),
  ];

  for (const name of cookieNames) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return response;
}
