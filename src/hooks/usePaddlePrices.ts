/**
 * usePaddlePrices — fetches localized prices from Paddle.PricePreview()
 *
 * Uses one-time credit pack price IDs from CREDIT_PACKS.
 * Credits never expire — users buy once, use forever.
 *
 * Security:
 * - PricePreview is a CLIENT-SIDE call (no API key needed)
 * - Country code is validated server-side before reaching here
 * - "OTHERS" sentinel is never passed to Paddle — we drop the address field instead
 * - Price IDs come from env vars via CREDIT_PACKS — never hardcoded
 */

import { type Paddle, type PricePreviewParams, type PricePreviewResponse } from "@paddle/paddle-js";
import { useEffect, useState } from "react";
import { CREDIT_PACKS } from "@/lib/constants";

export type PaddlePrices = Record<string, string>;

/**
 * Build line items for PricePreview — one entry per credit pack.
 * All prices are one-time (no billing cycle).
 */
function getLineItems(): PricePreviewParams["items"] {
  return CREDIT_PACKS
    .filter((pack) => pack.paddlePriceId) // skip packs without price IDs
    .map((pack) => ({
      priceId: pack.paddlePriceId!,
      quantity: 1,
    }));
}

/**
 * Extract formatted totals from the PricePreview response.
 * item.formattedTotals.total is already locale-formatted (e.g. "$5.00", "€4.50").
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
      setError("No price IDs configured. Set PADDLE_PRICE_STARTER/GROWTH/PRO env vars.");
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
