import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasGoogleIdAlt: !!process.env.AUTH_GOOGLE_ID,
    hasGoogleSecretAlt: !!process.env.AUTH_GOOGLE_SECRET,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes("GOOGLE") || k.includes("AUTH") || k.includes("NEXTAUTH")),
  });
}
