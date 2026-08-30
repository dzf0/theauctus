// ══════════════════════════════════════════════════════════════
// VOICEOVER SERVICE
// Uses ElevenLabs API for AI text-to-speech.
// Free tier: 10,000 characters/month (~20-30 short videos)
// Docs: https://elevenlabs.io/docs/api-reference/text-to-speech
// ══════════════════════════════════════════════════════════════

const ELEVENLABS_API = "https://api.elevenlabs.io/v1";

export interface WordTiming {
  word: string;
  startMs: number;
  endMs: number;
}

export interface VoiceoverResult {
  success: boolean;
  audioBuffer?: Buffer;
  error?: string;
  charactersUsed?: number;
  wordTimings?: WordTiming[];
}

// Pre-selected voices optimized for short-form video
export const VOICE_PRESETS: Record<string, { name: string; voiceId: string }> = {
  narrator: { name: "Narrator (Adam)", voiceId: "pNInz6obpgDQGcFmaJgB" },
  storyteller: { name: "Storyteller (Antoni)", voiceId: "ErXwobaYiN019PkySvjV" },
  casual: { name: "Casual (Josh)", voiceId: "TxGEqnHWrfWFTfGW9XjX" },
  energetic: { name: "Energetic (Arnold)", voiceId: "VR6AewLTigWG4xSOukaG" },
  deep: { name: "Deep (Sam)", voiceId: "yoZ06aMxZJJ28mfd3POQ" },
};

/**
 * Convert ElevenLabs character-level alignment to word-level timings.
 */
function alignmentToWordTimings(
  characters: string[],
  startTimes: number[],
  endTimes: number[],
  originalText: string
): WordTiming[] {
  const words: WordTiming[] = [];
  let charIdx = 0;

  // Walk through the original text, matching characters to alignment data
  const originalWords = originalText.split(/\s+/).filter(Boolean);

  for (const word of originalWords) {
    // Find where this word starts in the character alignment
    // Skip whitespace characters in alignment
    while (charIdx < characters.length && /\s/.test(characters[charIdx])) {
      charIdx++;
    }

    const wordStartIdx = charIdx;

    // Find the end of this word's characters
    let wordEndIdx = wordStartIdx;
    let matched = "";
    while (wordEndIdx < characters.length && matched.length < word.length) {
      matched += characters[wordEndIdx];
      wordEndIdx++;
    }

    if (wordStartIdx < startTimes.length) {
      const startMs = startTimes[wordStartIdx] * 1000;
      const endIdx = Math.min(wordEndIdx - 1, endTimes.length - 1);
      const endMs = endTimes[endIdx] * 1000;

      words.push({
        word,
        startMs: Math.round(startMs),
        endMs: Math.round(endMs),
      });
    }

    charIdx = wordEndIdx;
  }

  return words;
}

/**
 * Group word timings into caption segments for display.
 * Groups words into chunks of `wordsPerChunk` (default 5-7 words),
 * keeping natural sentence boundaries where possible.
 */
export function groupWordsIntoSegments(
  words: WordTiming[],
  wordsPerChunk: number = 6
): { text: string; startMs: number; endMs: number }[] {
  if (words.length === 0) return [];

  const segments: { text: string; startMs: number; endMs: number }[] = [];
  let currentChunk: WordTiming[] = [];

  for (const wt of words) {
    currentChunk.push(wt);

    // Break at sentence endings or when chunk is full
    const isSentenceEnd = /[.!?]$/.test(wt.word);
    if (currentChunk.length >= wordsPerChunk || isSentenceEnd) {
      segments.push({
        text: currentChunk.map(w => w.word).join(" "),
        startMs: currentChunk[0].startMs,
        endMs: currentChunk[currentChunk.length - 1].endMs,
      });
      currentChunk = [];
    }
  }

  // Flush remaining words
  if (currentChunk.length > 0) {
    segments.push({
      text: currentChunk.map(w => w.word).join(" "),
      startMs: currentChunk[0].startMs,
      endMs: currentChunk[currentChunk.length - 1].endMs,
    });
  }

  return segments;
}

/**
 * Generate voiceover audio from text using ElevenLabs.
 * Uses /with-timestamps endpoint to get word-level timing for caption sync.
 */
export async function generateVoiceover(
  text: string,
  voiceId: string = VOICE_PRESETS.narrator.voiceId,
  modelId: string = "eleven_multilingual_v2"
): Promise<VoiceoverResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return { success: false, error: "ELEVENLABS_API_KEY not configured" };
  }

  if (!text || text.trim().length === 0) {
    return { success: false, error: "No text provided for voiceover" };
  }

  // ElevenLabs has a 5000 character limit per request
  const truncatedText = text.slice(0, 5000);

  // Retry with exponential backoff for 429 rate limits
  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Use with-timestamps endpoint for word-level timing
      const response = await fetch(
        `${ELEVENLABS_API}/text-to-speech/${voiceId}/with-timestamps`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
          },
          body: JSON.stringify({
            text: truncatedText,
            model_id: modelId,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.3,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (response.status === 429) {
        const error = await response.json().catch(() => ({}));
        if (attempt < MAX_RETRIES) {
          const waitMs = Math.min(2000 * Math.pow(2, attempt - 1), 10000);
          console.log(`[voiceover] Rate limited (attempt ${attempt}/${MAX_RETRIES}), retrying in ${waitMs}ms...`);
          await new Promise(r => setTimeout(r, waitMs));
          continue;
        }
        return {
          success: false,
          error: `ElevenLabs is busy (${error.detail?.message || "rate limit"}). Please try again in a few minutes.`,
        };
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return {
          success: false,
          error: `ElevenLabs API error ${response.status}: ${JSON.stringify(error)}`,
        };
      }

      const data = await response.json();

      // Decode base64 audio
      const audioBuffer = Buffer.from(data.audio_base64, "base64");

      // Extract word timings from alignment data
      let wordTimings: WordTiming[] | undefined;
      if (data.alignment) {
        const { characters, character_start_times_seconds, character_end_times_seconds } = data.alignment;
        if (characters && character_start_times_seconds && character_end_times_seconds) {
          wordTimings = alignmentToWordTimings(
            characters,
            character_start_times_seconds,
            character_end_times_seconds,
            truncatedText
          );
          console.log(`[voiceover] Got ${wordTimings.length} word timings`);
        }
      }

      return {
        success: true,
        audioBuffer,
        charactersUsed: truncatedText.length,
        wordTimings,
      };
    } catch (error) {
      return {
        success: false,
        error: `Voiceover generation failed: ${error instanceof Error ? error.message : "Unknown"}`,
      };
    }
  }

  return { success: false, error: "Voiceover generation failed after retries" };
}

/**
 * Get remaining character count for the free tier.
 */
export async function getCharacterCount(): Promise<{
  totalChars: number;
  charsUsed: number;
  charsRemaining: number;
} | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(`${ELEVENLABS_API}/user/subscription`, {
      headers: { "xi-api-key": apiKey },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      totalChars: data.character_count || 0,
      charsUsed: data.character_count || 0,
      charsRemaining: (data.character_limit || 10000) - (data.character_count || 0),
    };
  } catch {
    return null;
  }
}
