/**
 * usePaddlePrices — fetches localized prices from Paddle.PricePreview()
 *
 * Security:
 * - PricePreview is a CLIENT-SIDE call (no API key needed)
 * - Country code is validated server-side before reaching here
 * - "OTHERS" sentinel is never passed to Paddle — we drop the address field instead
 * - Price IDs come from env vars (NEXT_PUBLIC_PADDLE_*) — never hardcoded
 */

import { type Paddle, type PricePreviewParams, type PricePreviewResponse } from "@paddle/paddle-js";
import { useEffect, useState } from "react";
import { PRICING_TIERS } from "@/lib/constants";

export type PaddlePrices = Record<string, string>;

/**
 * Build the line items for PricePreview — all tiers, both billing frequencies.
 * This fetches everything in one API call.
 */
function getLineItems(): PricePreviewParams["items"] {
  return PRICING_TIERS.flatMap((tier) =>
    [tier.priceId.month, tier.priceId.year]
      .filter(Boolean) // skip empty price IDs (not configured yet)
      .map((priceId) => ({ priceId, quantity: 1 }))
  );
}

/**
 * Extract formatted totals from the PricePreview response.
 * item.formattedTotals.total is already locale-formatted (e.g. "$9.99", "€8.50", "¥1,200").
 */
function getPriceAmounts(response: PricePreviewResponse): PaddlePrices {
  return response.data.details.lineItems.reduce<PaddlePrices>((acc, item) => {
    acc[item.price.id] = item.formattedTotals.total;
    return acc;
  }, {});
}

/**
 * @param paddle - initialized Paddle instance (from initializePaddle)
 * @param country - ISO 3166-1 alpha-2 code, or null (let Paddle auto-detect)
 */
export function usePaddlePrices(
  paddle: Paddle | undefined,
  country: string | null
): { prices: PaddlePrices; loading: boolean; error: string | null } {
  const [prices, setPrices] = useState<PaddlePrices>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paddle) return;

    const items = getLineItems();
    if (items.length === 0) {
      setLoading(false);
      setError("No price IDs configured. Set PADDLE_PRICE_*_MONTH and *_YEAR env vars.");
      return;
    }

    const params: Partial<PricePreviewParams> = {
      items,
    };

    // Only pass address if we have a valid country code.
    // "OTHERS" is a sentinel meaning "let Paddle infer from IP" — never pass it to Paddle.
    if (country) {
      params.address = { countryCode: country };
    }

    setLoading(true);
    setError(null);

    paddle.PricePreview(params as PricePreviewParams)
      .then((response) => {
        setPrices(getPriceAmounts(response));
        setLoading(false);
      })
      .catch((err) => {
        console.error("[PADDLE] PricePreview failed:", err);
        setError("Failed to load prices. Please try again.");
        setLoading(false);
      });
  }, [country, paddle]);

  return { prices, loading, error };
}
