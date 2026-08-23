import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

/**
 * Get the current user (returns null if not logged in)
 */
export async function getUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Require authentication — redirects to home if not logged in
 */
export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect("/");
  }
  return user;
}

/**
 * Get user profile from database
 */
export async function getProfile(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}
