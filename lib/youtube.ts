/**
 * lib/youtube.ts — Query Builder + YouTube API types
 *
 * STEP 1: Query Builder
 * ─────────────────────
 * buildSearchQuery(period, category, feeling) produces natural search
 * phrases that YouTube understands well, e.g.:
 *
 *   "morning intention meditation 10 minutes guided"
 *   "afternoon stress relief meditation 5 minutes guided"
 *   "evening anxiety relief meditation 10 minutes guided"
 *   "sleep meditation deep relaxation peaceful rest guided"
 *
 * Three inputs combine into one phrase:
 *   period   → sets the time prefix and duration hint
 *   category → sets the core meditation type (derived from feeling)
 *   feeling  → adds a context word for night queries
 *
 * STEP 2: YouTube API types
 * ──────────────────────────
 * Types for the raw YouTube Data API v3 search response and our
 * cleaned-up VideoResult that the client receives.
 *
 * No side-effects in this file — only pure functions and types.
 * The actual HTTP call lives in app/api/meditations/route.ts.
 */

import { Feeling } from "@/data/meditations";
import { TimePeriod } from "@/hooks/useTimeOfDay";

// ─── Meditation categories ─────────────────────────────────────────────────────

/**
 * The six meditation categories used to build precise search queries.
 * Each maps to a core phrase that YouTube responds to reliably.
 */
export type MeditationCategory =
  | "mindfulness"
  | "stress-relief"
  | "anxiety-relief"
  | "intention-setting"
  | "restorative"
  | "sleep";

/**
 * Maps the user's emotional state to a meditation category.
 * This is the bridge between the check-in screen and the query builder.
 *
 *   calm        → mindfulness       (deepen existing peace)
 *   stressed    → stress-relief     (release tension)
 *   overwhelmed → anxiety-relief    (ground and calm)
 *   hopeful     → intention-setting (channel positive energy)
 *   tired       → restorative       (gentle restoration)
 */
export const FEELING_TO_CATEGORY: Record<Feeling, MeditationCategory> = {
  calm:        "mindfulness",
  stressed:    "stress-relief",
  overwhelmed: "anxiety-relief",
  hopeful:     "intention-setting",
  tired:       "restorative",
};

// ─── Query builder internals ───────────────────────────────────────────────────

/**
 * Core phrase for each category — the meditation type as YouTube expects it.
 */
const CATEGORY_PHRASES: Record<MeditationCategory, string> = {
  "mindfulness":       "mindfulness",
  "stress-relief":     "stress relief",
  "anxiety-relief":    "anxiety relief calming",
  "intention-setting": "intention",
  "restorative":       "restorative",
  "sleep":             "relaxation",
};

/**
 * Time-of-day prefix and suggested duration for standard (non-night) queries.
 * Duration is included as a search keyword — YouTube uses it to surface
 * appropriately-lengthed videos even without an API duration filter.
 */
const PERIOD_CONFIG: Record<Exclude<TimePeriod, "night">, { prefix: string; duration: string }> = {
  morning:   { prefix: "morning",   duration: "10 minutes" },
  afternoon: { prefix: "afternoon", duration: "5 minutes"  },
  evening:   { prefix: "evening",   duration: "10 minutes" },
};

/**
 * For night, we swap to "sleep" as the lead keyword — it consistently surfaces
 * better sleep meditation content than "night". Each feeling adds a context
 * word so the query stays specific.
 */
const NIGHT_CONTEXT: Record<Feeling, string> = {
  calm:        "peaceful rest",
  stressed:    "stress relief",
  overwhelmed: "calm mind",
  hopeful:     "positive rest",
  tired:       "deep rest",
};

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Builds a natural YouTube search query from three context inputs.
 *
 * Example outputs:
 *   ("morning",   "intention-setting", "hopeful")
 *     → "morning intention meditation 10 minutes guided"
 *
 *   ("afternoon", "stress-relief",     "stressed")
 *     → "afternoon stress relief meditation 5 minutes guided"
 *
 *   ("evening",   "anxiety-relief",    "overwhelmed")
 *     → "evening anxiety relief calming meditation 10 minutes guided"
 *
 *   ("night",     "restorative",       "tired")
 *     → "sleep meditation deep relaxation deep rest guided"
 */
export function buildSearchQuery(
  period: TimePeriod,
  category: MeditationCategory,
  feeling: Feeling
): string {
  // Night queries lead with "sleep" — performs better than "night [category]"
  if (period === "night") {
    return `sleep meditation deep relaxation ${NIGHT_CONTEXT[feeling]} guided`;
  }

  const { prefix, duration } = PERIOD_CONFIG[period];
  const categoryPhrase = CATEGORY_PHRASES[category];

  return `${prefix} ${categoryPhrase} meditation ${duration} guided`;
}

// ─── YouTube Data API v3 response types ───────────────────────────────────────

interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

interface YouTubeSnippet {
  title: string;
  description: string;
  channelTitle: string;
  thumbnails: {
    default: YouTubeThumbnail;
    medium:  YouTubeThumbnail;
    high:    YouTubeThumbnail;
  };
}

interface YouTubeSearchItem {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: YouTubeSnippet;
}

export interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
  error?: {
    message: string;
    code: number;
  };
}

// ─── Cleaned result shape returned to the client ───────────────────────────────

export interface VideoResult {
  videoId:      string;
  title:        string;
  channelTitle: string;
  thumbnail:    string; // medium quality ~320×180
}

/**
 * Strips the raw YouTube response down to only the fields the UI needs.
 * Filters out any item missing a videoId (channels, playlists).
 */
export function parseSearchResults(response: YouTubeSearchResponse): VideoResult[] {
  return response.items
    .filter((item) => item.id?.videoId)
    .map((item) => ({
      videoId:      item.id.videoId,
      title:        item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail:    item.snippet.thumbnails.medium?.url
                    ?? item.snippet.thumbnails.default.url,
    }));
}
