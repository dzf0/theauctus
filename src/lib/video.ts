// Video Composition Service - FFmpeg-based 9:16 short-form video generator
import { execSync } from "child_process";
import { writeFileSync, readFileSync, unlinkSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { getBackgroundVideo } from "./stock-video";
import { WordTiming, groupWordsIntoSegments } from "./voiceover";
import { getCaptionStyle, CaptionStyle } from "./caption-styles";

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
  wordTimings?: WordTiming[];
  captionStyleId?: string;
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
 * Supports caption style presets with different colors, positions, and animations.
 */
function buildDrawtextFilter(
  segments: { text: string; startMs: number; endMs: number }[],
  captionColor: string,
  captionSize: number,
  style?: CaptionStyle
): string {
  const fallback: CaptionStyle = { id: "", name: "", description: "", fontColor: `0x${captionColor.replace("#", "")}`, borderColor: "0x000000", borderWidth: 3, fontSize: captionSize, position: "center", capitalize: false };
  const s = style || fallback;
  const ffmpegColor = s.fontColor || `0x${captionColor.replace("#", "")}`;
  const ffmpegBorder = s.borderColor || "0x000000";
  const fontSize = s.fontSize || captionSize;
  const borderW = s.borderWidth ?? 3;

  // Position mapping
  let yPos = "(h-text_h)/2"; // center default
  if (s.position === "bottom") yPos = "h-h/5";
  else if (s.position === "top") yPos = "h/8";
  else if (s.position === "word-highlight") yPos = "(h-text_h)/2";

  // Background box (for highlight styles like Hormozi)
  const bgBoxFilter = s.bgBox ? `:box=1:boxcolor=${s.bgBox}@0.8:boxborderw=${s.bgBoxPadding || 6}` : "";

  return segments
    .map((seg) => {
      let text = seg.text;
      if (s.capitalize) text = text.toUpperCase();
      const escaped = escapeDrawtext(text);
      const startSec = (seg.startMs / 1000).toFixed(3);
      const endSec = (seg.endMs / 1000).toFixed(3);
      return `drawtext=text='${escaped}':fontsize=${fontSize}:fontcolor=${ffmpegColor}:borderw=${borderW}:bordercolor=${ffmpegBorder}:x=(w-text_w)/2:y=${yPos}${bgBoxFilter}:enable='between(t,${startSec},${endSec})'`;
    })
    .join(",");
}

/**
 * Create themed animated background filter chains for each template.
 * Uses FFmpeg filters to create unique visual effects per template.
 */
function getThemedBackgroundFilter(templateId: string, duration: number): string {
  switch (templateId) {
    case "minecraft-parkour": {
      // Scrolling colored blocks grid — mimics pixelated parkour
      const blockSize = 120;
      const cols = Math.ceil(1080 / blockSize);
      const rows = Math.ceil(1920 / blockSize);
      const colors = ["#1a1a2e", "#16213e", "#0f3460", "#533483", "#2b2d42"];
      const parts: string[] = [];
      // Base dark gradient
      parts.push(`drawbox=x=0:y=0:w=1080:h=1920:color=#0a0a1a:t=fill`);
      // Scrolling colored blocks
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const color = colors[(r + c) % colors.length];
          const y = ((r * blockSize) % 1920);
          const speed = 80 + (c % 3) * 40; // different scroll speeds
          const yOffset = `mod(${y}+t*${speed},1920)`;
          parts.push(`drawbox=x=${c * blockSize}:y=${yOffset}:w=${blockSize - 2}:h=${blockSize - 2}:color=${color}@0.6:t=fill`);
        }
      }
      return parts.join(",");
    }

    case "subway-surfers": {
      // Fast-moving colorful horizontal speed lines
      const parts: string[] = [];
      parts.push(`drawbox=x=0:y=0:w=1080:h=1920:color=#0f3460:t=fill`);
      const lineColors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"];
      for (let i = 0; i < 12; i++) {
        const color = lineColors[i % lineColors.length];
        const y = 160 * i;
        const speed = 200 + (i % 3) * 100;
        const yOffset = `mod(${y}+t*${speed},1920)`;
        parts.push(`drawbox=x=0:y=${yOffset}:w=1080:h=40:color=${color}@0.4:t=fill`);
      }
      // Perspective-like converging lines
      parts.push(`drawtext=text='▶':fontsize=60:fontcolor=white@0.1:x=540:y=mod(t*300\,1920):enable='between(t,0,${duration})'`);
      return parts.join(",");
    }

    case "gta-gameplay": {
      // Dark city with moving neon lights
      const parts: string[] = [];
      parts.push(`drawbox=x=0:y=0:w=1080:h=1920:color=#1a1a2e:t=fill`);
      // Moving neon light streaks
      const neonColors = ["#e94560", "#0f3460", "#533483", "#C9A87C"];
      for (let i = 0; i < 8; i++) {
        const color = neonColors[i % neonColors.length];
        const speed = 150 + i * 80;
        const yPos = `mod(t*${speed},1920)`;
        parts.push(`drawbox=x=0:y=${yPos}:w=1080:h=3:color=${color}@0.7:t=fill`);
      }
      // Occasional flash effect
      parts.push(`drawbox=x=0:y=0:w=1080:h=1920:color=white@0.03*gt(mod(t\,4)\,3.9):t=fill`);
      return parts.join(",");
    }

    case "satisfying-loops": {
      // Pulsing concentric circles — hypnotic effect
      const parts: string[] = [];
      parts.push(`drawbox=x=0:y=0:w=1080:h=1920:color=#1a0a2e:t=fill`);
      for (let i = 1; i <= 8; i++) {
        const radius = i * 100;
        const color = i % 2 === 0 ? "#667eea" : "#764ba2";
        const pulsePhase = i * 0.5;
        parts.push(`drawtext=text='○':fontsize=${radius}:fontcolor=${color}@0.15:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,0,${duration})'`);
      }
      // Rotating gradient approximation with moving boxes
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * 360;
        const color = i % 2 === 0 ? "#667eea" : "#764ba2";
        const xPos = `mod(540+cos(t+${i})*400\,1080)`;
        const yPos = `mod(960+sin(t+${i})*600\,1920)`;
        parts.push(`drawbox=x=${xPos}:y=${yPos}:w=60:h=60:color=${color}@0.2:t=fill`);
      }
      return parts.join(",");
    }

    case "nature-stock": {
      // Flowing aurora-like gradient
      const parts: string[] = [];
      parts.push(`drawbox=x=0:y=0:w=1080:h=1920:color=#134e5e:t=fill`);
      // Aurora bands
      for (let i = 0; i < 5; i++) {
        const color = ["#71b280", "#134e5e", "#2d8659", "#48bf84", "#1a936f"][i];
        const yBase = 300 + i * 250;
        const waveOffset = `sin(t*0.5+${i})*100`;
        parts.push(`drawbox=x=0:y=${yBase}+${waveOffset}:w=1080:h=80:color=${color}@0.3:t=fill`);
      }
      return parts.join(",");
    }

    case "ai-cartoon": {
      // Colorful bouncing shapes
      const parts: string[] = [];
      parts.push(`drawbox=x=0:y=0:w=1080:h=1920:color=#2d1b69:t=fill`);
      const colors = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#6BCB77", "#FF8B94"];
      for (let i = 0; i < 6; i++) {
        const color = colors[i % colors.length];
        const xSpeed = 100 + i * 60;
        const ySpeed = 80 + i * 50;
        const xPos = `mod(abs(sin(t*0.3+${i}))*1080\,1080)`;
        const yPos = `mod(abs(cos(t*0.25+${i}))*1920\,1920)`;
        parts.push(`drawbox=x=${xPos}:y=${yPos}:w=80:h=80:color=${color}@0.25:t=fill`);
      }
      return parts.join(",");
    }

    default: {
      // Generic animated gradient
      return `drawbox=x=0:y=0:w=1080:h=960:color=${VIDEO_TEMPLATES[0].bgGradientEnd}@0.5:t=fill`;
    }
  }
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

    // Build caption segments — use word timings if available, otherwise estimate
    let segments: { text: string; startMs: number; endMs: number }[];
    if (opts.wordTimings && opts.wordTimings.length > 0) {
      segments = groupWordsIntoSegments(opts.wordTimings, 6);
      console.log(`[video] Using ${segments.length} word-synced caption segments`);
    } else {
      segments = getCaptionSegments(opts.script, Math.round(dur * 1000));
      console.log(`[video] Using ${segments.length} estimated caption segments (no word timings)`);
    }

    // Try to get a stock/custom background video
    let bgVideoPath: string | null = null;
    try {
      const bg = await getBackgroundVideo(opts.templateId);
      if (bg) {
        bgVideoPath = bg.path;
        console.log(`[video] Using ${bg.source} background for ${opts.templateId}`);
      }
    } catch (err) {
      console.warn("[video] Failed to get stock background:", err);
    }

    // Build video filter chain
    const bgFilter = `color=c=${tpl.bgColor}:s=1080x1920:d=${dur}`;
    const gradientOverlay = getThemedBackgroundFilter(opts.templateId, dur);

    // Build drawtext filter for captions using selected style
    const captionStyle = opts.captionStyleId ? getCaptionStyle(opts.captionStyleId) : undefined;
    const drawtextFilter = segments.length > 0
      ? buildDrawtextFilter(segments, tpl.captionColor, tpl.captionSize, captionStyle)
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
