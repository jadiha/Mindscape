/**
 * app/api/meditations/route.ts — YouTube API Route Handler
 *
 * Runs on the SERVER only. The browser never sees the API key.
 *
 * ── Two modes ─────────────────────────────────────────────────────────────────
 *
 *   1. Recommendation list (RecommendationScreen)
 *      GET /api/meditations?feeling=stressed&period=afternoon
 *      → { results: VideoResult[] }   (up to 3 videos)
 *
 *   2. Single video lookup (MeditationScreen fallback)
 *      GET /api/meditations?q=10+minute+guided+breathing+meditation
 *      → { result: VideoResult | null }
 *
 * ── Error responses ───────────────────────────────────────────────────────────
 *   400  missing params
 *   501  API key not configured → client falls back to curated titles
 *   502  YouTube API error
 */

import { NextRequest, NextResponse } from "next/server";
import {
  buildSearchQuery,
  parseSearchResults,
  YouTubeSearchResponse,
  FEELING_TO_CATEGORY,
} from "@/lib/youtube";
import { Feeling } from "@/data/meditations";
import { TimePeriod } from "@/hooks/useTimeOfDay";

const API_KEY_PLACEHOLDER = "your_api_key_here";

async function searchYouTube(
  query: string,
  maxResults: number,
  apiKey: string
): Promise<YouTubeSearchResponse> {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part",              "snippet");
  url.searchParams.set("q",                query);
  url.searchParams.set("type",              "video");
  url.searchParams.set("videoEmbeddable",   "true");
  url.searchParams.set("maxResults",        String(maxResults));
  url.searchParams.set("relevanceLanguage", "en");
  url.searchParams.set("safeSearch",        "strict");
  url.searchParams.set("key",               apiKey);

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    const body = await response.json();
    console.error("[YouTube API error]", body);
    throw new Error(body?.error?.message ?? "YouTube API error");
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey || apiKey === API_KEY_PLACEHOLDER) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY not configured" },
      { status: 501 }
    );
  }

  // ── Mode 1: recommendation list ───────────────────────────────────────────
  const feeling = searchParams.get("feeling") as Feeling | null;
  const period  = searchParams.get("period")  as TimePeriod | null;

  if (feeling && period) {
    const category = FEELING_TO_CATEGORY[feeling];
    const query    = buildSearchQuery(period, category, feeling);

    try {
      const data    = await searchYouTube(query, 6, apiKey);
      const results = parseSearchResults(data).slice(0, 3);
      return NextResponse.json({ results, query });
    } catch (err) {
      console.error("[YouTube fetch failed]", err);
      return NextResponse.json({ error: "Failed to reach YouTube" }, { status: 502 });
    }
  }

  // ── Mode 2: single video lookup ───────────────────────────────────────────
  const q = searchParams.get("q");

  if (q) {
    try {
      const data   = await searchYouTube(q, 5, apiKey);
      const result = parseSearchResults(data)[0] ?? null;
      return NextResponse.json({ result });
    } catch (err) {
      console.error("[YouTube fetch failed]", err);
      return NextResponse.json({ error: "Failed to reach YouTube" }, { status: 502 });
    }
  }

  return NextResponse.json(
    { error: "Provide ?feeling=&period= or ?q=" },
    { status: 400 }
  );
}
