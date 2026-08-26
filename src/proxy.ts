import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ══════════════════════════════════════════════════════════════
// SECURITY HEADERS
// ══════════════════════════════════════════════════════════════

const isProd = process.env.NODE_ENV === "production";

const SECURITY_HEADERS: Record<string, string> = {
  // Prevent MIME sniffing
  "X-Content-Type-Options": "nosniff",
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  // XSS protection (legacy browsers)
  "X-XSS-Protection": "1; mode=block",
  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Restrict browser features
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()",
  // Prevent DNS prefetching
  "X-DNS-Prefetch-Control": "off",
  // Force HTTPS (production only)
  ...(isProd
    ? {
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
      }
    : {}),
};

// ══════════════════════════════════════════════════════════════
// CONTENT SECURITY POLICY
// ══════════════════════════════════════════════════════════════

// In production, drop unsafe-eval to prevent code injection.
// Dev keeps it for Next.js HMR / fast refresh.
const CSP_DIRECTIVES = [
  "default-src 'self'",
  `script-src 'self' ${isProd ? "'unsafe-inline'" : "'unsafe-inline' 'unsafe-eval'"} https://fonts.googleapis.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // Tighten img-src: only self, data URIs for inline icons, and known hosts
  "img-src 'self' data: blob: https://*.supabase.co https://avatars.githubusercontent.com https://lh3.googleusercontent.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

// ══════════════════════════════════════════════════════════════
// CORS CONFIGURATION
// ══════════════════════════════════════════════════════════════

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || "https://www.theauctus.in",
  "https://theauctus.in",
  "http://localhost:3000",
];

function setCorsHeaders(
  response: NextResponse,
  request: NextRequest
): void {
  const origin = request.headers.get("origin");
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token, X-Requested-With");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400");
}

function handleCorsPreflight(request: NextRequest): NextResponse | null {
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    setCorsHeaders(response, request);
    return response;
  }
  return null;
}

// ══════════════════════════════════════════════════════════════
// MAIN MIDDLEWARE
// ══════════════════════════════════════════════════════════════

export async function proxy(request: NextRequest) {
  // ── CORS preflight ──────────────────────────────────────────
  const preflightResponse = handleCorsPreflight(request);
  if (preflightResponse) return preflightResponse;

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

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ── API routes: apply CORS + security headers ──────────────
  if (pathname.startsWith("/api")) {
    setCorsHeaders(supabaseResponse, request);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      supabaseResponse.headers.set(key, value);
    }
    supabaseResponse.headers.set("Content-Security-Policy", CSP_DIRECTIVES);
    return supabaseResponse;
  }

  // ── Static assets: skip deeper checks ──────────────────────
  if (
    pathname.startsWith("/_next") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico")
  ) {
    return supabaseResponse;
  }

  // ── Protect dashboard routes ────────────────────────────────
  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  // ── Onboarding gate (strict) ───────────────────────────────
  // Flow: sign-up → /auth/username (if needed) → /auth/pricing → /onboarding → /dashboard
  const isOnboardingFlow =
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/auth/pricing") ||
    pathname.startsWith("/auth/username");

  // Auth pages that don't need onboarding checks
  const isAuthPage = pathname.startsWith("/auth/signin") ||
    pathname.startsWith("/auth/signup") ||
    pathname.startsWith("/auth/verify-otp") ||
    pathname.startsWith("/auth/forgot-password") ||
    pathname.startsWith("/auth/update-password");

  if (user && !isOnboardingFlow && !isAuthPage) {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("onboarded, full_name, username")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && profile) {
        // Not onboarded → go to pricing
        if (!profile.onboarded) {
          const url = request.nextUrl.clone();
          url.pathname = "/auth/pricing";
          return NextResponse.redirect(url);
        }

        // Onboarded but missing profile data → back to username picker
        if (profile.onboarded && (!profile.full_name || !profile.username)) {
          const url = request.nextUrl.clone();
          url.pathname = "/auth/username";
          return NextResponse.redirect(url);
        }
      }
    } catch {
      // DB error — don't redirect
    }
  }

  // ── Redirect completed users away from onboarding flow ──────
  if (user && isOnboardingFlow) {
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
      // DB error — let them stay
    }
  }

  // ── Prevent back-button caching of dashboard ────────────────
  if (pathname.startsWith("/dashboard")) {
    supabaseResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    supabaseResponse.headers.set("Pragma", "no-cache");
    supabaseResponse.headers.set("Expires", "0");
  }

  // ── Apply security headers to all pages ─────────────────────
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    supabaseResponse.headers.set(key, value);
  }
  supabaseResponse.headers.set("Content-Security-Policy", CSP_DIRECTIVES);

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
