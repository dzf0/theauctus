/**
 * Seed Paddle subscription catalog — Starter, Growth, Pro with monthly+yearly
 * Run once: PADDLE_SANDBOX_API_KEY=... npx tsx scripts/seed-paddle-subscriptions.ts
 */

import { Environment, LogLevel, Paddle } from "@paddle/paddle-node-sdk";

const apiKey = process.env.PADDLE_SANDBOX_API_KEY;
if (!apiKey) {
  console.error("Set PADDLE_SANDBOX_API_KEY first");
  process.exit(1);
}

const paddle = new Paddle(apiKey, {
  environment: Environment.sandbox,
  logLevel: LogLevel.error,
});

async function seed() {
  console.log("Creating subscription products...\n");

  // ── Starter ──
  const starter = await paddle.products.create({
    name: "Starter",
    taxCategory: "saas",
    description: "For new creators — 25 credits/month",
  });

  const starterMonth = await paddle.prices.create({
    productId: starter.id,
    description: "Starter monthly",
    unitPrice: { amount: "500", currencyCode: "USD" },
    billingCycle: { interval: "month", frequency: 1 },
  });

  const starterYear = await paddle.prices.create({
    productId: starter.id,
    description: "Starter yearly",
    unitPrice: { amount: "4800", currencyCode: "USD" },
    billingCycle: { interval: "year", frequency: 1 },
  });

  console.log(`✅ Starter`);
  console.log(`   Month: ${starterMonth.id}`);
  console.log(`   Year:  ${starterYear.id}\n`);

  // ── Growth ──
  const growth = await paddle.products.create({
    name: "Growth",
    taxCategory: "saas",
    description: "For consistent creators — 100 credits/month",
  });

  const growthMonth = await paddle.prices.create({
    productId: growth.id,
    description: "Growth monthly",
    unitPrice: { amount: "1500", currencyCode: "USD" },
    billingCycle: { interval: "month", frequency: 1 },
  });

  const growthYear = await paddle.prices.create({
    productId: growth.id,
    description: "Growth yearly",
    unitPrice: { amount: "14400", currencyCode: "USD" },
    billingCycle: { interval: "year", frequency: 1 },
  });

  console.log(`✅ Growth`);
  console.log(`   Month: ${growthMonth.id}`);
  console.log(`   Year:  ${growthYear.id}\n`);

  // ── Pro ──
  const pro = await paddle.products.create({
    name: "Pro",
    taxCategory: "saas",
    description: "For power creators — 500 credits/month",
  });

  const proMonth = await paddle.prices.create({
    productId: pro.id,
    description: "Pro monthly",
    unitPrice: { amount: "4900", currencyCode: "USD" },
    billingCycle: { interval: "month", frequency: 1 },
  });

  const proYear = await paddle.prices.create({
    productId: pro.id,
    description: "Pro yearly",
    unitPrice: { amount: "47040", currencyCode: "USD" },
    billingCycle: { interval: "year", frequency: 1 },
  });

  console.log(`✅ Pro`);
  console.log(`   Month: ${proMonth.id}`);
  console.log(`   Year:  ${proYear.id}\n`);

  // ── Summary ──
  console.log("═".repeat(60));
  console.log("Add these to your .env file:\n");
  console.log(`PADDLE_PRICE_STARTER_MONTH=${starterMonth.id}`);
  console.log(`PADDLE_PRICE_STARTER_YEAR=${starterYear.id}`);
  console.log(`PADDLE_PRICE_GROWTH_MONTH=${growthMonth.id}`);
  console.log(`PADDLE_PRICE_GROWTH_YEAR=${growthYear.id}`);
  console.log(`PADDLE_PRICE_PRO_MONTH=${proMonth.id}`);
  console.log(`PADDLE_PRICE_PRO_YEAR=${proYear.id}`);
  console.log("\n" + "═".repeat(60));
}

seed().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
