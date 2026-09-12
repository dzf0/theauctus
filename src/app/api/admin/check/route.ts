import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";

export const GET = withAuth(async (_request, { user }) => {
  const raw = process.env.ADMIN_EMAILS || "";
  const adminEmails = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = (user.email || "").toLowerCase();
  const isAdmin = adminEmails.includes(userEmail);

  // Debug log — trace exactly what the check is seeing
  console.log("[ADMIN CHECK]", {
    userEmail,
    adminEmails,
    rawEnv: raw || "(empty)",
    isAdmin,
  });

  return NextResponse.json({
    isAdmin,
    debug: process.env.NODE_ENV !== "production"
      ? { userEmail, adminEmails, rawEnv: raw || "(empty)" }
      : undefined,
  });
});
