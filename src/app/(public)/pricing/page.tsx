/**
 * /pricing — Server component that reads country from headers
 *
 * Security:
 * - Country is read from x-vercel-ip-country (set by Vercel edge, can't be spoofed)
 * - Falls back to null (Paddle auto-detects from IP)
 * - User email is fetched client-side via /api/pricing/preview (requires auth)
 * - No server-side API keys are exposed
 */

import { headers } from "next/headers";
import { PricingSection } from "@/components/pricing/PricingSection";

// Valid ISO 3166-1 alpha-2 country codes
const VALID_COUNTRIES = new Set([
  "US", "GB", "CA", "AU", "DE", "FR", "IT", "ES", "NL", "JP",
  "KR", "IN", "BR", "MX", "SG", "AE", "SA", "SE", "CH", "AT",
  "BE", "DK", "FI", "IE", "NO", "NZ", "PL", "PT", "ZA", "TH",
  "ID", "MY", "PH", "VN", "HK", "TW", "CL", "CO", "AR", "EG",
]);

export default async function PricingPage() {
  const h = await headers();
  const rawCountry = h.get("x-vercel-ip-country");
  const country = rawCountry && VALID_COUNTRIES.has(rawCountry) ? rawCountry : null;

  return <PricingSection country={country} />;
}
