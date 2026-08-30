// Stock Video Service - Downloads free stock footage for video backgrounds
// Uses the Pexels API (free tier: 200 req/hour, 20K req/month)
// Get a free key at: https://www.pexels.com/api/

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const CACHE_DIR = join(tmpdir(), "theauctus-stock-bg");

// Map template IDs to Pexels search queries
const TEMPLATE_SEARCH_QUERIES: Record<string, string[]> = {
  "minecraft-parkour": ["minecraft gameplay", "parkour game", "video game gameplay"],
  "subway-surfers": ["subway surfers", "runner game", "arcade game"],
  "gta-gameplay": ["gta driving", "city driving night", "car driving gameplay"],
  "satisfying-loops": ["satisfying loop", "abstract animation", "fluid simulation"],
  "nature-stock": ["nature landscape", "forest drone", "mountain timelapse"],
  "ai-cartoon": ["cartoon animation", "colorful animation", "cartoon character"],
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

/**
 * Find the best video file from a Pexels video object.
 * Prefers HD quality in portrait/vertical orientation.
 */
function pickBestFile(video: PexelsVideo): PexelsVideo["video_files"][0] | null {
  const files = video.video_files.filter(f => f.file_type === "video/mp4");
  if (files.length === 0) return null;

  // Prefer files closest to 1080x1920 (portrait)
  const scored = files.map(f => {
    const isPortrait = f.height > f.width;
    const sizeDiff = Math.abs(f.width - DESIRED_WIDTH) + Math.abs(f.height - DESIRED_HEIGHT);
    const qualityBonus = f.quality === "hd" ? -1000 : f.quality === "sd" ? 1000 : 0;
    return { file: f, score: sizeDiff + qualityBonus + (isPortrait ? -500 : 0) };
  });

  scored.sort((a, b) => a.score - b.score);
  return scored[0].file;
}

/**
 * Search Pexels for videos matching a query.
 */
async function searchPexels(query: string, apiKey: string): Promise<PexelsVideo[]> {
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5&orientation=portrait`;
  const res = await fetch(url, {
    headers: { Authorization: apiKey },
  });

  if (!res.ok) {
    console.warn(`[stock-video] Pexels search failed (${res.status}): ${query}`);
    return [];
  }

  const data: PexelsSearchResponse = await res.json();
  return data.videos || [];
}

/**
 * Download a video from URL to a local file.
 */
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

/**
 * Get a background video for a template.
 * Checks cache first, then searches Pexels, falls back to null.
 */
export async function getBackgroundVideo(templateId: string): Promise<{ path: string; fromCache: boolean } | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  const cachePath = getCachePath(templateId);

  // Check cache first
  if (existsSync(cachePath)) {
    console.log(`[stock-video] Using cached background for ${templateId}`);
    return { path: cachePath, fromCache: true };
  }

  // No API key? Can't fetch
  if (!apiKey) {
    console.log(`[stock-video] No PEXELS_API_KEY set, skipping stock backgrounds`);
    return null;
  }

  // Search for videos using template-specific queries
  const queries = TEMPLATE_SEARCH_QUERIES[templateId] || ["abstract background"];
  for (const query of queries) {
    const videos = await searchPexels(query, apiKey);
    if (videos.length === 0) continue;

    // Try each video until one downloads successfully
    for (const video of videos) {
      const bestFile = pickBestFile(video);
      if (!bestFile) continue;

      const success = await downloadVideo(bestFile.link, cachePath);
      if (success) return { path: cachePath, fromCache: false };
    }
  }

  console.log(`[stock-video] No background found for ${templateId}`);
  return null;
}

/**
 * Clear the background video cache.
 */
export function clearBackgroundCache(): void {
  const { readdirSync, unlinkSync } = require("fs");
  if (!existsSync(CACHE_DIR)) return;
  for (const file of readdirSync(CACHE_DIR)) {
    unlinkSync(join(CACHE_DIR, file));
  }
}
