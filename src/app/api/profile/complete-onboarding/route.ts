import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { apiValidationError } from "@/lib/errors";

// POST /api/profile/complete-onboarding
export const POST = withAuth(
  async (_request, { supabase, user, profile }) => {
    // Check if already onboarded
    if (profile?.onboarded) {
      return NextResponse.json({ message: "Already onboarded" });
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        onboarded: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Onboarding completed" });
  },
  {
    auditAction: "complete_onboarding",
  }
);
