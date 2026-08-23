import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// GET /api/user — Get current user profile
export async function GET() {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(user);
}

// PATCH /api/user — Update user profile
export async function PATCH(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, niche, brandVoice, targetAudience, goals, keywords, onboarded } = body;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(niche !== undefined && { niche }),
      ...(brandVoice !== undefined && { brandVoice }),
      ...(targetAudience !== undefined && { targetAudience }),
      ...(goals !== undefined && { goals: JSON.stringify(goals) }),
      ...(keywords !== undefined && { keywords: JSON.stringify(keywords) }),
      ...(onboarded !== undefined && { onboarded }),
    },
  });

  return NextResponse.json(updated);
}
