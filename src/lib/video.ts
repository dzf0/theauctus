// Video Composition Service - FFmpeg-based 9:16 short-form video generator
import { execSync } from "child_process";
import { writeFileSync, readFileSync, unlinkSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { getBackgroundVideo } from "./stock-video";

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  bgColor: string;
  bgGradientEnd: string; // gradient endpoint for visual interest
  captionColor: string;
  captionSize: number;
}

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  { id: "minecraft-parkour", name: "Minecraft Parkour", description: "Minecraft gameplay with AI story", category: "gameplay", bgColor: "#1a1a2e", bgGradientEnd: "#16213e", captionColor: "#ffffff", captionSize: 48 },
  { id: "subway-surfers", name: "Subway Surfers", description: "Subway Surfers gameplay with voiceover", category: "gameplay", bgColor: "#0f3460", bgGradientEnd: "#1a508b", captionColor: "#FFD700", captionSize: 46 },
  { id: "gta-gameplay", name: "GTA V Gameplay", description: "GTA V driving with voiceover", category: "gameplay", bgColor: "#1a1a2e", bgGradientEnd: "#e94560", captionColor: "#FFFFFF", captionSize: 44 },
  { id: "satisfying-loops", name: "Satisfying Loops", description: "Satisfying visuals with voiceover", category: "satisfying", bgColor: "#667eea", bgGradientEnd: "#764ba2", captionColor: "#FFFFFF", captionSize: 50 },
  { id: "nature-stock", name: "Nature / Stock", description: "Nature background with voiceover", category: "stock", bgColor: "#134e5e", bgGradientEnd: "#71b280", captionColor: "#FFFFFF", captionSize: 42 },
  { id: "ai-cartoon", name: "AI Cartoon", description: "Family Guy inspired AI cartoon", category: "custom", bgColor: "#2d1b69", bgGradientEnd: "#e94560", captionColor: "#FFFFFF", captionSize: 48 },
];

export interface VideoGenOptions {
  templateId: string;
  script: string;
  voiceoverBuffer: Buffer;
  title?: string;
  hashtags?: string[];
}

const TEMP = join(tmpdir(), "theauctus-video");

function ensureDir() { if (!existsSync(TEMP)) mkdirSync(TEMP, { recursive: true }); }

/** Split script into caption segments (6 words each) with timing */
function getCaptionSegments(text: string, durMs: number): { text: string; startMs: number; endMs: number }[] {
  const words = text.split(/\s+/).filter(Boolean);
  const segs: { text: string; startMs: number; endMs: number }[] = [];
  for (let i = 0; i < words.length; i += 6) {
    const chunk = words.slice(i, i + 6).join(" ");
    const startMs = (i / words.length) * durMs;
    const endMs = ((i + 6) / words.length) * durMs;
    segs.push({ text: chunk, startMs, endMs: Math.min(endMs, durMs) });
  }
  return segs;
}

function fmtSrtTime(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const ml = ms % 1000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ml).padStart(3, "0")}`;
}

function toSRT(text: string, durMs: number): string {
  return getCaptionSegments(text, durMs)
    .map((seg, i) => `${i + 1}\n${fmtSrtTime(seg.startMs)} --> ${fmtSrtTime(seg.endMs)}\n${seg.text}\n`)
    .join("\n");
}

/**
 * Escape text for FFmpeg drawtext filter.
 * Backslashes first, then colons, then single/double quotes.
 */
function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/%/g, "%%"); // % is special in drawtext
}

/**
 * Build FFmpeg drawtext filter chain for captions.
 * Uses drawtext instead of subtitles filter for reliable cross-platform rendering.
 */
function buildDrawtextFilter(segments: { text: string; startMs: number; endMs: number }[], captionColor: string, captionSize: number): string {
  // Convert hex color to FFmpeg format: #RRGGBB -> 0xRRGGBB
  const ffmpegColor = `0x${captionColor.replace("#", "")}`;

  return segments
    .map((seg) => {
      const escaped = escapeDrawtext(seg.text);
      const startSec = (seg.startMs / 1000).toFixed(3);
      const endSec = (seg.endMs / 1000).toFixed(3);
      return `drawtext=text='${escaped}':fontsize=${captionSize}:fontcolor=${ffmpegColor}:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h-h/5:enable='between(t,${startSec},${endSec})'`;
    })
    .join(",");
}

export async function generateVideo(opts: VideoGenOptions): Promise<{ success: boolean; videoBuffer?: Buffer; duration?: number; error?: string }> {
  const tpl = VIDEO_TEMPLATES.find(t => t.id === opts.templateId);
  if (!tpl) return { success: false, error: `Template not found: ${opts.templateId}` };
  ensureDir();
  const id = `v_${Date.now()}`;
  const audioPath = join(TEMP, `${id}.mp3`);
  const videoPath = join(TEMP, `${id}.mp4`);
  const srtPath = join(TEMP, `${id}.srt`);

  try {
    // Write audio file
    writeFileSync(audioPath, opts.voiceoverBuffer);

    // Get audio duration
    const durStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`, { encoding: "utf-8" }).trim();
    const dur = parseFloat(durStr);
    if (isNaN(dur) || dur < 1) return { success: false, error: "Invalid audio duration" };

    // Write SRT file (for reference/fallback)
    writeFileSync(srtPath, toSRT(opts.script, Math.round(dur * 1000)));

    // Build caption segments
    const segments = getCaptionSegments(opts.script, Math.round(dur * 1000));

    // Try to get a stock background video
    let bgVideoPath: string | null = null;
    try {
      const bg = await getBackgroundVideo(opts.templateId);
      if (bg) {
        bgVideoPath = bg.path;
        console.log(`[video] Using ${bg.fromCache ? "cached" : "new"} stock background for ${opts.templateId}`);
      }
    } catch (err) {
      console.warn("[video] Failed to get stock background:", err);
    }

    // Build video filter chain
    const bgFilter = `color=c=${tpl.bgColor}:s=1080x1920:d=${dur}`;
    const gradientOverlay = `drawbox=x=0:y=0:w=1080:h=960:color=${tpl.bgGradientEnd}@0.5:t=fill`;

    // Build drawtext filter for captions
    const drawtextFilter = segments.length > 0
      ? buildDrawtextFilter(segments, tpl.captionColor, tpl.captionSize)
      : null;

    // Escape the SRT path for subtitles filter (fallback)
    const srtEscaped = srtPath.replace(/\\/g, "/").replace(/^([A-Z]):/i, "$1\\:");

    console.log(`[video] Generating with ${segments.length} caption segments, ${dur.toFixed(1)}s duration, bg=${bgVideoPath ? "stock" : "gradient"}`);

    // Helper to build the video filter chain
    const buildVf = (withCaptions: boolean): string => {
      const parts: string[] = [];

      if (bgVideoPath) {
        // Stock background: scale to 1080x1920, crop to fit, loop if shorter than audio
        parts.push(`scale=1080:1920:force_original_aspect_ratio=increase`);
        parts.push(`crop=1080:1920`);
        // Slight darken overlay so captions are readable
        parts.push(`drawbox=x=0:y=0:w=1080:h=1920:color=black@0.3:t=fill`);
      } else {
        // Fallback: animated gradient background
        parts.push(gradientOverlay);
      }

      if (withCaptions && drawtextFilter) {
        parts.push(drawtextFilter);
      }

      return parts.join(",");
    };

    // Build the FFmpeg command
    const buildCmd = (vf: string): string => {
      const inputs: string[] = [];

      if (bgVideoPath) {
        // Use stock video as background, loop it to cover full duration
        inputs.push(`-stream_loop -1 -i "${bgVideoPath}"`);
      } else {
        // Use generated color background
        inputs.push(`-f lavfi -i "${bgFilter}"`);
      }

      inputs.push(`-i "${audioPath}"`);

      return [
        "ffmpeg -y",
        ...inputs,
        `-vf "${vf}"`,
        `-c:v libx264 -preset fast -crf 23`,
        `-c:a aac -b:a 128k`,
        `-t ${dur}`,
        `-movflags +faststart`,
        `-pix_fmt yuv420p`,
        `-shortest`,
        `"${videoPath}"`,
      ].join(" ");
    };

    // Try: drawtext captions -> subtitles fallback -> no captions
    const vfWithCaptions = buildVf(true);
    const vfNoCaptions = buildVf(false);

    try {
      const cmd = buildCmd(vfWithCaptions);
      execSync(cmd, { encoding: "utf-8", timeout: 120000, stdio: "pipe" });
    } catch (drawtextErr) {
      console.warn("[video] drawtext failed, trying subtitles filter:", drawtextErr instanceof Error ? drawtextErr.message : drawtextErr);

      // Try subtitles filter fallback
      const subtitlesVf = bgVideoPath
        ? `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,drawbox=x=0:y=0:w=1080:h=1920:color=black@0.3:t=fill,subtitles='${srtEscaped}':force_style='FontSize=${tpl.captionSize},PrimaryColour=&H${tpl.captionColor.slice(1)},OutlineColour=&H000000,Outline=3,Alignment=2,MarginV=100'`
        : `subtitles='${srtEscaped}':force_style='FontSize=${tpl.captionSize},PrimaryColour=&H${tpl.captionColor.slice(1)},OutlineColour=&H000000,Outline=3,Alignment=2,MarginV=100'`;

      try {
        const cmd = buildCmd(subtitlesVf);
        execSync(cmd, { encoding: "utf-8", timeout: 120000, stdio: "pipe" });
      } catch (subtitleErr) {
        // Last resort: no captions at all
        console.warn("[video] subtitles also failed, generating without captions:", subtitleErr instanceof Error ? subtitleErr.message : subtitleErr);
        const cmd = buildCmd(vfNoCaptions);
        execSync(cmd, { encoding: "utf-8", timeout: 120000, stdio: "pipe" });
      }
    }

    const videoBuffer = readFileSync(videoPath);
    try { unlinkSync(audioPath); unlinkSync(srtPath); unlinkSync(videoPath); } catch {}
    return { success: true, videoBuffer, duration: dur };
  } catch (error) {
    try { unlinkSync(audioPath); } catch {}
    try { unlinkSync(videoPath); } catch {}
    try { unlinkSync(srtPath); } catch {}
    return { success: false, error: `Video failed: ${error instanceof Error ? error.message : "Unknown"}` };
  }
}
