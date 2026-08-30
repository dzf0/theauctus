// ══════════════════════════════════════════════════════════════
// CAPTION STYLE PRESETS
// 14+ styles inspired by popular creators
// ══════════════════════════════════════════════════════════════

export interface CaptionStyle {
  id: string;
  name: string;
  creator?: string; // Inspired by
  description: string;
  // FFmpeg drawtext parameters
  fontSize: number;
  fontColor: string;       // FFmpeg color format: 0xRRGGBB
  borderColor: string;
  borderWidth: number;
  position: "center" | "bottom" | "top" | "word-highlight";
  bgBox?: string;          // Background box color (optional)
  bgBoxPadding?: number;
  capitalize?: boolean;    // ALL CAPS
  shadowEnabled?: boolean;
  animation?: "pop" | "fade" | "typewriter" | "highlight-word";
}

export const CAPTION_STYLES: CaptionStyle[] = [
  // ══════════════════════════════════════════════════════════════
  // POPULAR CREATOR STYLES
  // ══════════════════════════════════════════════════════════════
  {
    id: "hormozi",
    name: "Hormozi Bold",
    creator: "Alex Hormozi",
    description: "Yellow highlight words, bold white text, black outline",
    fontSize: 52,
    fontColor: "0xFFFFFF",
    borderColor: "0x000000",
    borderWidth: 4,
    position: "word-highlight",
    bgBox: "0xFFD700",
    bgBoxPadding: 8,
    capitalize: true,
    animation: "highlight-word",
  },
  {
    id: "mrbeast",
    name: "MrBeast Colorful",
    creator: "MrBeast",
    description: "Colorful word-by-word with pop animation",
    fontSize: 50,
    fontColor: "0xFFFFFF",
    borderColor: "0x000000",
    borderWidth: 5,
    position: "center",
    capitalize: true,
    animation: "pop",
  },
  {
    id: "grant-cardone",
    name: "Grant Cardone Clean",
    creator: "Grant Cardone",
    description: "Clean white text, minimal outline, bottom position",
    fontSize: 44,
    fontColor: "0xFFFFFF",
    borderColor: "0x000000",
    borderWidth: 3,
    position: "bottom",
    capitalize: false,
  },
  {
    id: "gary-vee",
    name: "GaryVee Energetic",
    creator: "Gary Vaynerchuk",
    description: "Bold yellow text, heavy outline, centered",
    fontSize: 48,
    fontColor: "0xFFD700",
    borderColor: "0x000000",
    borderWidth: 5,
    position: "center",
    capitalize: true,
  },
  {
    id: "noel-deyzel",
    name: "Noel Deyzel Fitness",
    creator: "Noel Deyzel",
    description: "White text with red highlight on key words",
    fontSize: 46,
    fontColor: "0xFFFFFF",
    borderColor: "0x000000",
    borderWidth: 4,
    position: "center",
    bgBox: "0xE06C75",
    bgBoxPadding: 6,
    capitalize: true,
    animation: "highlight-word",
  },

  // ══════════════════════════════════════════════════════════════
  // STYLE CATEGORIES
  // ══════════════════════════════════════════════════════════════
  {
    id: "clean-white",
    name: "Clean White",
    description: "Simple, elegant white text with subtle outline",
    fontSize: 42,
    fontColor: "0xFFFFFF",
    borderColor: "0x000000",
    borderWidth: 2,
    position: "bottom",
    capitalize: false,
  },
  {
    id: "bold-outline",
    name: "Bold Outline",
    description: "Heavy outline for maximum readability",
    fontSize: 48,
    fontColor: "0xFFFFFF",
    borderColor: "0x000000",
    borderWidth: 6,
    position: "center",
    capitalize: true,
  },
  {
    id: "neon-glow",
    name: "Neon Glow",
    description: "Cyan text with dark outline — futuristic feel",
    fontSize: 46,
    fontColor: "0x00FFFF",
    borderColor: "0x000033",
    borderWidth: 4,
    position: "center",
    capitalize: false,
    shadowEnabled: true,
  },
  {
    id: "gold-premium",
    name: "Gold Premium",
    description: "Gold text with dark outline — luxury feel",
    fontSize: 44,
    fontColor: "0xC9A87C",
    borderColor: "0x000000",
    borderWidth: 4,
    position: "center",
    capitalize: true,
  },
  {
    id: "red-alert",
    name: "Red Alert",
    description: "Red text with white outline — urgency",
    fontSize: 50,
    fontColor: "0xE06C75",
    borderColor: "0xFFFFFF",
    borderWidth: 4,
    position: "center",
    capitalize: true,
  },
  {
    id: "minimal-top",
    name: "Minimal Top",
    description: "Small, clean text at the top — non-intrusive",
    fontSize: 32,
    fontColor: "0xFFFFFF",
    borderColor: "0x000000",
    borderWidth: 2,
    position: "top",
    capitalize: false,
  },
  {
    id: "tiktok-classic",
    name: "TikTok Classic",
    description: "White text with black outline, centered — the TikTok standard",
    fontSize: 46,
    fontColor: "0xFFFFFF",
    borderColor: "0x000000",
    borderWidth: 5,
    position: "center",
    capitalize: false,
  },
  {
    id: "youtube-shorts",
    name: "YouTube Shorts",
    description: "Bold white with thick outline, bottom third",
    fontSize: 48,
    fontColor: "0xFFFFFF",
    borderColor: "0x000000",
    borderWidth: 5,
    position: "bottom",
    capitalize: true,
  },
  {
    id: "word-by-word",
    name: "Word by Word",
    description: "Shows one word at a time, centered — high engagement",
    fontSize: 56,
    fontColor: "0xFFFFFF",
    borderColor: "0x000000",
    borderWidth: 4,
    position: "center",
    capitalize: true,
    animation: "typewriter",
  },
];

/**
 * Get a caption style by ID
 */
export function getCaptionStyle(id: string): CaptionStyle {
  return CAPTION_STYLES.find(s => s.id === id) || CAPTION_STYLES[0];
}

/**
 * Convert hex color to FFmpeg ASS color format (AABBGGRR)
 */
export function hexToAssColor(hex: string): string {
  const clean = hex.replace("#", "").replace("0x", "");
  const r = clean.slice(0, 2);
  const g = clean.slice(2, 4);
  const b = clean.slice(4, 6);
  return `&H00${b}${g}${r}`.toUpperCase();
}
