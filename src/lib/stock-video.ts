// Stock Video Service - Background footage for video compositions
// Priority: 1) Custom MP4 files, 2) Pexels stock footage, 3) null (use FFmpeg animated bg)

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const CACHE_DIR = join(tmpdir(), "theauctus-stock-bg");
// Custom backgrounds: place MP4 files in public/backgrounds/{templateId}.mp4
const CUSTOM_BG_DIR = join(process.cwd(), "public", "backgrounds");

// Map template IDs to Pexels search queries (for generic templates)
const PEXELS_SEARCH_QUERIES: Record<string, string[]> = {
  "satisfying-loops": ["satisfying loop", "abstract animation", "fluid simulation"],
  "nature-stock": ["nature landscape", "forest drone", "mountain timelapse"],
};

// Desired video properties for 9:16 vertical format
const DESIRED_WIDTH = 1080;
const DESIRED_HEIGHT = 1920;

interface PexelsVideo {
  id: number;
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }[];
}

interface PexelsSearchResponse {
  videos: PexelsVideo[];
  total_results: number;
}

function getCachePath(templateId: string): string {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
  return join(CACHE_DIR, `${templateId}.mp4`);
}

/** Find the best video file from a Pexels video object */
function pickBestFile(video: PexelsVideo): PexelsVideo["video_files"][0] | null {
  const files = video.video_files.filter(f => f.file_type === "video/mp4");
  if (files.length === 0) return null;

  const scored = files.map(f => {
    const isPortrait = f.height > f.width;
    const sizeDiff = Math.abs(f.width - DESIRED_WIDTH) + Math.abs(f.height - DESIRED_HEIGHT);
    const qualityBonus = f.quality === "hd" ? -1000 : f.quality === "sd" ? 1000 : 0;
    return { file: f, score: sizeDiff + qualityBonus + (isPortrait ? -500 : 0) };
  });

  scored.sort((a, b) => a.score - b.score);
  return scored[0].file;
}

/** Search Pexels for videos */
async function searchPexels(query: string, apiKey: string): Promise<PexelsVideo[]> {
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5&orientation=portrait`;
  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) return [];
  const data: PexelsSearchResponse = await res.json();
  return data.videos || [];
}

/** Download a video from URL to a local file */
async function downloadVideo(url: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(destPath, buffer);
    console.log(`[stock-video] Downloaded ${url} -> ${destPath} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
    return true;
  } catch (err) {
    console.warn(`[stock-video] Download failed:`, err);
    return false;
  }
}

export interface BackgroundResult {
  path: string;
  source: "custom" | "pexels" | "cached";
}

/**
 * Get a background video for a template.
 * Priority: custom MP4 -> Pexels stock -> cached -> null (use FFmpeg animated bg)
 */
export async function getBackgroundVideo(templateId: string): Promise<BackgroundResult | null> {
  const cachePath = getCachePath(templateId);

  // 1. Check custom background folder: public/backgrounds/{templateId}.mp4
  const customPath = join(CUSTOM_BG_DIR, `${templateId}.mp4`);
  if (existsSync(customPath)) {
    console.log(`[stock-video] Using custom background: ${customPath}`);
    return { path: customPath, source: "custom" };
  }

  // 2. Check cache
  if (existsSync(cachePath)) {
    console.log(`[stock-video] Using cached background for ${templateId}`);
    return { path: cachePath, source: "cached" };
  }

  // 3. Try Pexels (only for templates with generic search queries)
  const apiKey = process.env.PEXELS_API_KEY;
  const queries = PEXELS_SEARCH_QUERIES[templateId];
  if (!apiKey || !queries) return null;

  for (const query of queries) {
    const videos = await searchPexels(query, apiKey);
    if (videos.length === 0) continue;

    for (const video of videos) {
      const bestFile = pickBestFile(video);
      if (!bestFile) continue;
      const success = await downloadVideo(bestFile.link, cachePath);
      if (success) return { path: cachePath, source: "pexels" };
    }
  }

  return null;
}
