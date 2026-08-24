import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Skip middleware for static assets and API routes (already in matcher,
  // but double-check to be safe)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico")
  ) {
    return supabaseResponse;
  }

  // Protect dashboard routes — redirect to signin if not logged in
  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  // For authenticated users on dashboard, check onboarding status
  // Use a try-catch to prevent redirect loops if the DB query fails
  if (user && pathname.startsWith("/dashboard")) {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("onboarded")
        .eq("id", user.id)
        .maybeSingle();

      // Only redirect if we successfully got the profile and user hasn't onboarded
      if (!error && profile && !profile.onboarded) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
      // If there's an error or no profile, let them through — the client
      // will handle it with its own auth check
    } catch {
      // DB error — don't redirect, let client handle it
    }
  }

  // If user is on onboarding but already onboarded, send to dashboard
  if (user && pathname === "/onboarding") {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("onboarded")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && profile && profile.onboarded) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    } catch {
      // DB error — let them stay on onboarding
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|api/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
