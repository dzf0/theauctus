import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { generateCsrfToken } from "@/lib/api-middleware";

// GET /api/auth/csrf — Get a CSRF token for the current session
export const GET = withAuth(async (_request, { user }) => {
  const token = generateCsrfToken(user.id);

  return NextResponse.json({
    token,
    expiresIn: 3600, // 1 hour
  });
});
