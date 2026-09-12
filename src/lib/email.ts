// ══════════════════════════════════════════════════════════════
// EMAIL UTILITY
// Server-side only — sends transactional emails via Nodemailer
// ══════════════════════════════════════════════════════════════

import nodemailer from "nodemailer";

// ── Transporter singleton ────────────────────────────────────

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  // Never send emails from client
  if (typeof window !== "undefined") return null;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: parseInt(port, 10) === 465,
      auth: { user, pass },
    });
  }

  return _transporter;
}

// ── Send email (non-blocking, fails silently) ────────────────

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  textFallback?: string
): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[EMAIL] SMTP not configured — skipping email to", to);
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@theauctus.in",
      to,
      subject,
      html,
      text: textFallback || subject,
    });
    console.log("[EMAIL] Sent to", to, "—", subject);
    return true;
  } catch (err) {
    console.error("[EMAIL] Failed to send to", to, ":", err);
    return false;
  }
}

// ══════════════════════════════════════════════════════════════
// PURCHASE RECEIPT
// ══════════════════════════════════════════════════════════════

export interface PurchaseReceiptData {
  userName: string;
  userEmail: string;
  packName: string;
  credits: number;
  amount: number;
  currency?: string;
  provider: "paddle" | "razorpay" | "demo";
  transactionId: string;
  date: Date;
}

export async function sendPurchaseReceipt(data: PurchaseReceiptData): Promise<boolean> {
  const {
    userName,
    userEmail,
    packName,
    credits,
    amount,
    currency = "USD",
    provider,
    transactionId,
    date,
  } = data;

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const providerLabel = provider === "paddle" ? "Paddle" : provider === "razorpay" ? "Razorpay" : "TheAuctus";
  const amountFormatted = currency === "USD" ? `$${amount.toFixed(2)}` : `${currency} ${(amount / 100).toFixed(2)}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#111118;border:1px solid #2a2a35;border-radius:16px;overflow:hidden;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#c9a87c,#8b6f47);padding:32px 40px;">
      <h1 style="margin:0;color:#0a0a0f;font-size:22px;font-weight:700;">TheAuctus</h1>
      <p style="margin:8px 0 0;color:#0a0a0f;opacity:0.8;font-size:14px;">Payment Receipt</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;">
      <p style="color:#e0e0e0;font-size:15px;margin:0 0 24px;">
        Hi ${userName || "there"},
      </p>
      <p style="color:#a0a0a0;font-size:14px;margin:0 0 32px;">
        Your payment was successful. Here are your receipt details:
      </p>

      <!-- Receipt card -->
      <div style="background:#1a1a24;border:1px solid #2a2a35;border-radius:12px;padding:24px;margin-bottom:32px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#808080;font-size:13px;">Pack</td>
            <td style="padding:8px 0;color:#e0e0e0;font-size:13px;text-align:right;font-weight:600;">${packName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#808080;font-size:13px;border-top:1px solid #2a2a35;">Credits</td>
            <td style="padding:8px 0;color:#c9a87c;font-size:13px;text-align:right;font-weight:600;border-top:1px solid #2a2a35;">+${credits}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#808080;font-size:13px;border-top:1px solid #2a2a35;">Amount</td>
            <td style="padding:8px 0;color:#e0e0e0;font-size:15px;text-align:right;font-weight:700;border-top:1px solid #2a2a35;">${amountFormatted}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#808080;font-size:13px;border-top:1px solid #2a2a35;">Payment via</td>
            <td style="padding:8px 0;color:#e0e0e0;font-size:13px;text-align:right;border-top:1px solid #2a2a35;">${providerLabel}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#808080;font-size:13px;border-top:1px solid #2a2a35;">Transaction ID</td>
            <td style="padding:8px 0;color:#a0a0a0;font-size:11px;text-align:right;border-top:1px solid #2a2a35;font-family:monospace;">${transactionId}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#808080;font-size:13px;border-top:1px solid #2a2a35;">Date</td>
            <td style="padding:8px 0;color:#a0a0a0;font-size:13px;text-align:right;border-top:1px solid #2a2a35;">${formattedDate}</td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.theauctus.in"}/billing"
           style="display:inline-block;background:linear-gradient(135deg,#c9a87c,#8b6f47);color:#0a0a0f;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
          Go to Billing →
        </a>
      </div>

      <p style="color:#808080;font-size:12px;text-align:center;margin:0;">
        Questions? Reply to this email or visit
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.theauctus.in"}" style="color:#c9a87c;">theauctus.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:16px 40px;border-top:1px solid #2a2a35;text-align:center;">
      <p style="color:#505060;font-size:11px;margin:0;">
        © ${new Date().getFullYear()} TheAuctus. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;

  const textFallback = [
    `TheAuctus — Payment Receipt`,
    ``,
    `Hi ${userName || "there"},`,
    ``,
    `Your payment was successful.`,
    ``,
    `Pack: ${packName}`,
    `Credits: +${credits}`,
    `Amount: ${amountFormatted}`,
    `Payment via: ${providerLabel}`,
    `Transaction ID: ${transactionId}`,
    `Date: ${formattedDate}`,
    ``,
    `View your billing: ${process.env.NEXT_PUBLIC_APP_URL || "https://www.theauctus.in"}/billing`,
  ].join("\n");

  return sendEmail(userEmail, `TheAuctus — Receipt for ${packName} pack`, html, textFallback);
}

// ══════════════════════════════════════════════════════════════
// REFUND NOTIFICATION
// ══════════════════════════════════════════════════════════════

export interface RefundNotificationData {
  userName: string;
  userEmail: string;
  creditsDeducted: number;
  originalDescription: string;
  provider: "paddle" | "razorpay";
  transactionId: string;
  date: Date;
}

export async function sendRefundNotification(data: RefundNotificationData): Promise<boolean> {
  const {
    userName,
    userEmail,
    creditsDeducted,
    originalDescription,
    provider,
    transactionId,
    date,
  } = data;

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const providerLabel = provider === "paddle" ? "Paddle" : "Razorpay";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#111118;border:1px solid #2a2a35;border-radius:16px;overflow:hidden;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#e07070,#b04040);padding:32px 40px;">
      <h1 style="margin:0;color:#0a0a0f;font-size:22px;font-weight:700;">TheAuctus</h1>
      <p style="margin:8px 0 0;color:#0a0a0f;opacity:0.8;font-size:14px;">Refund Processed</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;">
      <p style="color:#e0e0e0;font-size:15px;margin:0 0 24px;">
        Hi ${userName || "there"},
      </p>
      <p style="color:#a0a0a0;font-size:14px;margin:0 0 32px;">
        Your refund has been processed. Here are the details:
      </p>

      <!-- Refund card -->
      <div style="background:#1a1a24;border:1px solid #2a2a35;border-radius:12px;padding:24px;margin-bottom:32px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#808080;font-size:13px;">Original purchase</td>
            <td style="padding:8px 0;color:#e0e0e0;font-size:13px;text-align:right;">${originalDescription}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#808080;font-size:13px;border-top:1px solid #2a2a35;">Credits deducted</td>
            <td style="padding:8px 0;color:#e07070;font-size:13px;text-align:right;font-weight:600;border-top:1px solid #2a2a35;">-${creditsDeducted}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#808080;font-size:13px;border-top:1px solid #2a2a35;">Refund via</td>
            <td style="padding:8px 0;color:#e0e0e0;font-size:13px;text-align:right;border-top:1px solid #2a2a35;">${providerLabel}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#808080;font-size:13px;border-top:1px solid #2a2a35;">Transaction ID</td>
            <td style="padding:8px 0;color:#a0a0a0;font-size:11px;text-align:right;border-top:1px solid #2a2a35;font-family:monospace;">${transactionId}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#808080;font-size:13px;border-top:1px solid #2a2a35;">Date</td>
            <td style="padding:8px 0;color:#a0a0a0;font-size:13px;text-align:right;border-top:1px solid #2a2a35;">${formattedDate}</td>
          </tr>
        </table>
      </div>

      <p style="color:#a0a0a0;font-size:13px;margin:0 0 24px;">
        The refund has been processed to your original payment method. It may take 5-10 business days to appear on your statement.
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.theauctus.in"}/billing"
           style="display:inline-block;background:#2a2a35;color:#e0e0e0;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
          View Billing →
        </a>
      </div>

      <p style="color:#808080;font-size:12px;text-align:center;margin:0;">
        Questions? Reply to this email or visit
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.theauctus.in"}" style="color:#c9a87c;">theauctus.in</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:16px 40px;border-top:1px solid #2a2a35;text-align:center;">
      <p style="color:#505060;font-size:11px;margin:0;">
        © ${new Date().getFullYear()} TheAuctus. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;

  const textFallback = [
    `TheAuctus — Refund Processed`,
    ``,
    `Hi ${userName || "there"},`,
    ``,
    `Your refund has been processed.`,
    ``,
    `Original: ${originalDescription}`,
    `Credits deducted: -${creditsDeducted}`,
    `Refund via: ${providerLabel}`,
    `Transaction ID: ${transactionId}`,
    `Date: ${formattedDate}`,
    ``,
    `The refund will appear on your statement in 5-10 business days.`,
    ``,
    `View your billing: ${process.env.NEXT_PUBLIC_APP_URL || "https://www.theauctus.in"}/billing`,
  ].join("\n");

  return sendEmail(userEmail, `TheAuctus — Refund Confirmation`, html, textFallback);
}
