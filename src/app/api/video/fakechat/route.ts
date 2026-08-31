// POST /api/video/fakechat — Generate a video from fake text chat messages
// Creates iPhone-style chat bubble video with voiceover
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { generateVoiceover } from "@/lib/voiceover";
import { generateVideo, VIDEO_TEMPLATES } from "@/lib/video";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { deductCredits } from "@/lib/credits";

export interface ChatMessage {
  sender: "left" | "right"; // left = other person, right = you
  text: string;
  delay?: number; // ms before this message appears
}

export const POST = withAuth(async (request, { supabase, user }) => {
  const body = await request.json();
  const { messages, voiceId, templateId, title } = body;

  if (!messages || !Array.isArray(messages) || messages.length < 2) {
    return NextResponse.json({ error: "At least 2 messages required" }, { status: 400 });
  }

  if (messages.length > 30) {
    return NextResponse.json({ error: "Maximum 30 messages allowed" }, { status: 400 });
  }

  // Validate messages
  for (const msg of messages) {
    if (!msg.text || typeof msg.text !== "string") {
      return NextResponse.json({ error: "Each message must have text" }, { status: 400 });
    }
    if (!["left", "right"].includes(msg.sender)) {
      return NextResponse.json({ error: "Each message must have sender: 'left' or 'right'" }, { status: 400 });
    }
  }

  // Build voiceover text from messages
  // Only read the "right" (main character) messages aloud
  const rightMessages = messages.filter(m => m.sender === "right");
  const voiceoverText = rightMessages.map(m => m.text).join(". ");

  if (voiceoverText.length < 10) {
    return NextResponse.json({ error: "Not enough spoken content. Add more right-side messages." }, { status: 400 });
  }

  try {
    // Generate voiceover
    const voiceover = await generateVoiceover(voiceoverText, voiceId);
    if (!voiceover.success || !voiceover.audioBuffer) {
      return NextResponse.json({ error: voiceover.error || "Voiceover failed" }, { status: 500 });
    }

    // Build script text for captions from all messages
    const scriptText = messages.map(m => m.text).join(". ");

    // Generate video with fakechat template
    const tplId = templateId || "ai-cartoon"; // Default template for chat videos
    const video = await generateVideo({
      templateId: tplId,
      script: scriptText,
      voiceoverBuffer: voiceover.audioBuffer,
      wordTimings: voiceover.wordTimings,
      captionStyleId: "tiktok-classic",
      title: title || "Fake Chat Video",
    });

    if (!video.success || !video.videoBuffer) {
      return NextResponse.json({ error: video.error || "Video generation failed" }, { status: 500 });
    }

    // Upload to Supabase Storage
    const adminClient = createSupabaseAdminClient();
    const fileName = `${user.id}/fakechat_${Date.now()}.mp4`;
    const { error: uploadError } = await adminClient.storage
      .from("media")
      .upload(fileName, video.videoBuffer, {
        contentType: "video/mp4",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    // Get signed URL
    const { data: urlData, error: urlError } = await adminClient.storage
      .from("media")
      .createSignedUrl(fileName, 3600);

    if (urlError) {
      return NextResponse.json({ error: `URL generation failed: ${urlError.message}` }, { status: 500 });
    }

    // Create post record
    const { data: post } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        title: title || "Fake Chat Video",
        content: scriptText,
        platform: "tiktok",
        content_type: "video",
        status: "draft",
        hashtags: ["faketext", "chat", "storytime"],
        ai_generated: true,
      })
      .select()
      .single();

    // Deduct credits
    const CREDIT_COST = 10;
    const deductResult = await deductCredits(
      user,
      CREDIT_COST,
      `Fake chat video: "${title || "Fake Chat Video"}"`
    );

    return NextResponse.json({
      success: true,
      post,
      videoUrl: urlData?.signedUrl,
      duration: video.duration,
      messagesCount: messages.length,
      creditsDeducted: CREDIT_COST,
      newBalance: deductResult.balance,
    });
  } catch (error) {
    console.error("[video/fakechat] Error:", error);
    return NextResponse.json(
      { error: `Video generation failed: ${error instanceof Error ? error.message : "Unknown"}` },
      { status: 500 }
    );
  }
}, {
  rateLimit: { limit: 5, windowMs: 60 * 60 * 1000 },
  rateLimitKey: "video:fakechat",
  requireCredits: 10,
  auditAction: "fakechat_video",
});
