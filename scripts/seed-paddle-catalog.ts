/**
 * Seed Paddle catalog — creates 3 credit pack products + prices
 * Run once: npx tsx scripts/seed-paddle-catalog.ts
 *
 * Requires: PADDLE_SANDBOX_API_KEY env var
 */

import { Environment, LogLevel, Paddle } from "@paddle/paddle-node-sdk";

const apiKey = process.env.PADDLE_SANDBOX_API_KEY;
if (!apiKey) {
  console.error("Set PADDLE_SANDBOX_API_KEY first:");
  console.error("  export PADDLE_SANDBOX_API_KEY=pdl_sdbx_apikey_...");
  process.exit(1);
}

const paddle = new Paddle(apiKey, {
  environment: Environment.sandbox,
  logLevel: LogLevel.error,
});

async function seed() {
  console.log("Creating Paddle products...\n");

  // ── Starter Pack ──
  const starter = await paddle.products.create({
    name: "Starter Credits",
    taxCategory: "saas",
    description: "Try AI content generation with a small batch of 25 credits",
  });
  console.log(`✅ Product: ${starter.name} (${starter.id})`);

  const starterPrice = await paddle.prices.create({
    productId: starter.id,
    description: "25 credits — $5",
    unitPrice: { amount: "500", currencyCode: "USD" }, // $5.00 in cents
  });
  console.log(`   Price: ${starterPrice.id} ($5.00)\n`);

  // ── Growth Pack ──
  const growth = await paddle.products.create({
    name: "Growth Credits",
    taxCategory: "saas",
    description: "For creators who post consistently — 100 credits",
  });
  console.log(`✅ Product: ${growth.name} (${growth.id})`);

  const growthPrice = await paddle.prices.create({
    productId: growth.id,
    description: "100 credits — $15",
    unitPrice: { amount: "1500", currencyCode: "USD" }, // $15.00 in cents
  });
  console.log(`   Price: ${growthPrice.id} ($15.00)\n`);

  // ── Pro Pack ──
  const pro = await paddle.products.create({
    name: "Pro Credits",
    taxCategory: "saas",
    description: "Maximum value for power creators — 500 credits",
  });
  console.log(`✅ Product: ${pro.name} (${pro.id})`);

  const proPrice = await paddle.prices.create({
    productId: pro.id,
    description: "500 credits — $49",
    unitPrice: { amount: "4900", currencyCode: "USD" }, // $49.00 in cents
  });
  console.log(`   Price: ${proPrice.id} ($49.00)\n`);

  // ── Summary ──
  console.log("═".repeat(60));
  console.log("Add these to your .env file:\n");
  console.log(`PADDLE_PRICE_STARTER=${starterPrice.id}`);
  console.log(`PADDLE_PRICE_GROWTH=${growthPrice.id}`);
  console.log(`PADDLE_PRICE_PRO=${proPrice.id}`);
  console.log("\n" + "═".repeat(60));
}

seed().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
