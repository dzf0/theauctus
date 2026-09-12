import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/auth/signin");
    }

    const raw = process.env.ADMIN_EMAILS || "";
    const adminEmails = raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    // If ADMIN_EMAILS is not configured at all, deny access (fail closed)
    if (adminEmails.length === 0) {
      console.error("[ADMIN LAYOUT] ADMIN_EMAILS env var is not set — denying access");
      redirect("/dashboard");
    }

    const userEmail = (user.email || "").toLowerCase();

    if (!adminEmails.includes(userEmail)) {
      console.log("[ADMIN LAYOUT] User not admin — redirecting:", {
        userEmail,
        adminEmails,
      });
      redirect("/dashboard");
    }
  } catch (err) {
    // If session check fails (e.g. cookies not available), redirect to signin
    console.error("[ADMIN LAYOUT] Session check failed:", err);
    redirect("/auth/signin");
  }

  return <>{children}</>;
}
