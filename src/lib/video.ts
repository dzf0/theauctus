// Video Composition Service - FFmpeg-based 9:16 short-form video generator
import { execSync } from "child_process";
import { writeFileSync, readFileSync, unlinkSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  bgColor: string;
  captionColor: string;
  captionSize: number;
}

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  { id: "minecraft-parkour", name: "Minecraft Parkour", description: "Minecraft gameplay with AI story", category: "gameplay", bgColor: "#1a1a2e", captionColor: "#ffffff", captionSize: 48 },
  { id: "subway-surfers", name: "Subway Surfers", description: "Subway Surfers gameplay with voiceover", category: "gameplay", bgColor: "#87CEEB", captionColor: "#FFD700", captionSize: 46 },
  { id: "gta-gameplay", name: "GTA V Gameplay", description: "GTA V driving with voiceover", category: "gameplay", bgColor: "#2C3E50", captionColor: "#FFFFFF", captionSize: 44 },
  { id: "satisfying-loops", name: "Satisfying Loops", description: "Satisfying visuals with voiceover", category: "satisfying", bgColor: "#667eea", captionColor: "#FFFFFF", captionSize: 50 },
  { id: "nature-stock", name: "Nature / Stock", description: "Nature background with voiceover", category: "stock", bgColor: "#2C5F2D", captionColor: "#FFFFFF", captionSize: 42 },
  { id: "ai-cartoon", name: "AI Cartoon", description: "Family Guy inspired AI cartoon", category: "custom", bgColor: "#FF6B6B", captionColor: "#FFFFFF", captionSize: 48 },
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

function toSRT(text: string, durMs: number): string {
  const words = text.split(/\s+/);
  const segs: string[] = [];
  for (let i = 0; i < words.length; i += 6) segs.push(words.slice(i, i + 6).join(" "));
  const segDur = durMs / segs.length;
  return segs.map((s, i) => {
    const st = fmt(i * segDur);
    const en = fmt(Math.min((i + 1) * segDur, durMs));
    return `${i + 1}\n${st} --> ${en}\n${s}\n`;
  }).join("\n");
}

function fmt(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const ml = ms % 1000;
  return `${p(h)}:${p(m)}:${p(s)},${p(ml, 3)}`;
}
function p(n: number, w = 2) { return String(n).padStart(w, "0"); }

export async function generateVideo(opts: VideoGenOptions): Promise<{ success: boolean; videoBuffer?: Buffer; duration?: number; error?: string }> {
  const tpl = VIDEO_TEMPLATES.find(t => t.id === opts.templateId);
  if (!tpl) return { success: false, error: `Template not found: ${opts.templateId}` };
  ensureDir();
  const id = `v_${Date.now()}`;
  const audioPath = join(TEMP, `${id}.mp3`);
  const videoPath = join(TEMP, `${id}.mp4`);
  const srtPath = join(TEMP, `${id}.srt`);
  try {
    writeFileSync(audioPath, opts.voiceoverBuffer);
    const durStr = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`, { encoding: "utf-8" }).trim();
    const dur = parseFloat(durStr);
    if (isNaN(dur) || dur < 1) return { success: false, error: "Invalid audio duration" };
    writeFileSync(srtPath, toSRT(opts.script, Math.round(dur * 1000)));
    const bg = `color=c=${tpl.bgColor}:s=1080x1920:d=${dur}`;
    const cmd = [
      "ffmpeg -y", `-f lavfi -i "${bg}"`, `-i "${audioPath}"`,
      `-vf "subtitles='${srtPath}':force_style='FontSize=${tpl.captionSize},PrimaryColour=&H${tpl.captionColor.slice(1)},OutlineColour=&H000000,Outline=3,Alignment=2,MarginV=100'"`,
      `-c:v libx264 -preset fast -crf 23`, `-c:a aac -b:a 128k`,
      `-t ${dur}`, `-movflags +faststart`, `-pix_fmt yuv420p`, `"${videoPath}"`,
    ].join(" ");
    execSync(cmd, { encoding: "utf-8", timeout: 120000, stdio: "pipe" });
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
