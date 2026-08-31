import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
  // Create a Supabase client that READS the actual request cookies
  // so it can properly invalidate the session server-side
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers.get("cookie")
            ? request.headers.get("cookie")!.split("; ").map(c => {
                const [name, ...rest] = c.split("=");
                return { name, value: rest.join("=") };
              })
            : [];
        },
        setAll(cookiesToSet) {
          // Update the response cookies
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Sign out from Supabase (this invalidates the server session)
  try {
    await supabase.auth.signOut();
  } catch {
    // Continue even if signOut fails
  }

  // Build response that clears all auth cookies
  const response = NextResponse.redirect(new URL("/", request.url));

  // Clear all cookies from the original request
  const allCookies = request.headers.get("cookie") || "";
  const cookieNames = new Set<string>();

  // Parse all cookie names
  for (const part of allCookies.split(";")) {
    const name = part.trim().split("=")[0];
    if (name) cookieNames.add(name);
  }

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

// Also handle GET for browser navigation
export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));

  const allCookies = request.headers.get("cookie") || "";
  const cookieNames = new Set<string>();

  for (const part of allCookies.split(";")) {
    const name = part.trim().split("=")[0];
    if (name) cookieNames.add(name);
  }

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
