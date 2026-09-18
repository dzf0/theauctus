/**
 * GET /api/pricing/preview
 *
 * Returns the authenticated user's email for checkout prefill.
 * Also returns the country code from the request header (server-side detection).
 *
 * Security:
 * - Requires authentication (withAuth wrapper)
 * - Rate limited to 30 requests/minute
 * - Never exposes server-side API keys
 * - Country code is validated against a whitelist
 */

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";

// Valid ISO 3166-1 alpha-2 country codes (top markets)
const VALID_COUNTRIES = new Set([
  "US", "GB", "CA", "AU", "DE", "FR", "IT", "ES", "NL", "JP",
  "KR", "IN", "BR", "MX", "SG", "AE", "SA", "SE", "CH", "AT",
  "BE", "DK", "FI", "IE", "NO", "NZ", "PL", "PT", "ZA", "TH",
  "ID", "MY", "PH", "VN", "HK", "TW", "CL", "CO", "AR", "EG",
]);

export const GET = withAuth(async (request, { user }) => {
  // Country from Vercel's edge headers (server-side, can't be spoofed by client)
  const rawCountry = request.headers.get("x-vercel-ip-country");
  const country = rawCountry && VALID_COUNTRIES.has(rawCountry) ? rawCountry : null;

  return NextResponse.json({
    email: user.email ?? null,
    // null means "let Paddle auto-detect from IP" — never pass "OTHERS" to Paddle
    country,
  });
}, {
  rateLimit: { limit: 30, windowMs: 60_000 },
  rateLimitKey: "pricing-preview:GET",
});
