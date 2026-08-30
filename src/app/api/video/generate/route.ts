// POST /api/video/generate
// Generates a short-form video with AI voiceover and captions
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { generateVoiceover } from "@/lib/voiceover";
import { generateVideo, VIDEO_TEMPLATES } from "@/lib/video";
import { deductCredits } from "@/lib/credits";

export const POST = withAuth(async (request, { supabase, user }) => {
  const body = await request.json();
  const { templateId, script, voiceId, captionStyleId, title, hashtags } = body;

  if (!templateId || !script) {
    return NextResponse.json({ error: "templateId and script are required" }, { status: 400 });
  }

  if (!VIDEO_TEMPLATES.find(t => t.id === templateId)) {
    return NextResponse.json({ error: "Invalid template" }, { status: 400 });
  }

  // 1. Generate voiceover
  const voiceover = await generateVoiceover(script, voiceId);
  if (!voiceover.success || !voiceover.audioBuffer) {
    return NextResponse.json({ error: voiceover.error || "Voiceover failed" }, { status: 500 });
  }

  // 2. Generate video
  const video = await generateVideo({
    templateId,
    script,
    voiceoverBuffer: voiceover.audioBuffer,
    wordTimings: voiceover.wordTimings,
    captionStyleId,
    title,
    hashtags,
  });

  if (!video.success || !video.videoBuffer) {
    return NextResponse.json({ error: video.error || "Video generation failed" }, { status: 500 });
  }

  // 3. Upload to Supabase Storage (admin client bypasses RLS)
  const adminClient = createSupabaseAdminClient();
  const fileName = `${user.id}/${Date.now()}.mp4`;
  const { error: uploadError } = await adminClient.storage
    .from("media")
    .upload(fileName, video.videoBuffer, {
      contentType: "video/mp4",
      upsert: false,
    });

  if (uploadError) {
    console.error("[video/generate] Upload failed:", uploadError);
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
  }

  // 4. Get signed URL (admin client — expires in 1 hour, bucket stays private)
  const { data: urlData, error: urlError } = await adminClient.storage
    .from("media")
    .createSignedUrl(fileName, 3600);

  if (urlError) {
    console.error("[video/generate] Signed URL failed:", urlError);
    return NextResponse.json({ error: `URL generation failed: ${urlError.message}` }, { status: 500 });
  }

  console.log(`[video/generate] Video uploaded: ${fileName}, signed URL created`);

  // 5. Create post record
  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      title: title || "AI Generated Video",
      content: script,
      platform: "youtube", // Default, user can change
      content_type: "video",
      status: "draft",
      hashtags: hashtags || [],
      ai_generated: true,
    })
    .select()
    .single();

  if (postError) {
    return NextResponse.json({ error: postError.message }, { status: 500 });
  }

  // 6. Deduct credits (admins exempt via deductCredits)
  const CREDIT_COST = 10;
  const deductResult = await deductCredits(
    user,
    CREDIT_COST,
    `Generated video: "${title || "AI Generated Video"}"`
  );
  if (!deductResult.success) {
    console.error("[video/generate] Credit deduction failed:", deductResult.error);
  }

  return NextResponse.json({
    success: true,
    post,
    videoUrl: urlData?.signedUrl,
    duration: video.duration,
    voiceoverChars: voiceover.charactersUsed,
    creditsDeducted: CREDIT_COST,
    newBalance: deductResult.balance,
  });
}, {
  rateLimit: { limit: 5, windowMs: 60 * 60 * 1000 },
  rateLimitKey: "video:generate",
  requireCredits: 10,
  auditAction: "generate_video",
});
