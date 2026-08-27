import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";

export const GET = withAuth(async (_request, { user }) => {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin = adminEmails.includes((user.email || "").toLowerCase());

  return NextResponse.json({ isAdmin });
});
