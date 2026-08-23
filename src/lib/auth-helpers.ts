import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * Get the current session (returns null if not logged in)
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Require authentication — redirects to home if not logged in
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/");
  }
  return session;
}

/**
 * Get or create user in database from session
 */
export async function getOrCreateUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      platforms: true,
      subscription: true,
      _count: { select: { posts: true, calendars: true } },
    },
  });

  // Create user if doesn't exist (first login)
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: session.user.id,
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null,
        platforms: {
          create: [
            { platform: "twitter", connected: false },
            { platform: "linkedin", connected: false },
            { platform: "instagram", connected: false },
            { platform: "youtube", connected: false },
            { platform: "tiktok", connected: false },
            { platform: "threads", connected: false },
            { platform: "blog", connected: false },
          ],
        },
        subscription: {
          create: {
            plan: "starter",
            status: "active",
          },
        },
      },
      include: {
        platforms: true,
        subscription: true,
        _count: { select: { posts: true, calendars: true } },
      },
    });
  }

  return user;
}
