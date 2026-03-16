/**
 * lib/recommendationEngine.ts
 *
 * Scoring-based meditation recommendation engine.
 *
 * Each meditation type receives a score from three signals:
 *   1. emotion_checkin  (how the user feels right now)
 *   2. time_of_day      (morning / afternoon / evening / night)
 *   3. calendar_context (upcoming event keyword, if any)
 *
 * The top 3 scoring types are returned as Meditation objects,
 * each with a targeted youtubeQuery ready to fetch a video.
 *
 * If an event is "soon" (< 30 min), shorter queries are used.
 */

import { Feeling } from "@/data/meditations";
import { TimePeriod } from "@/hooks/useTimeOfDay";
import { CalendarContext } from "@/lib/contextExtractor";
import { Meditation } from "@/data/meditations";

// ─── Meditation types ─────────────────────────────────────────────────────────

export type MeditationType =
  | "breathing"
  | "body-scan"
  | "visualization"
  | "focus"
  | "loving-kindness"
  | "grounding"
  | "anxiety-relief"
  | "sleep"
  | "energy"
  | "intention-setting";

// ─── Per-type config ──────────────────────────────────────────────────────────

interface MeditationTypeConfig {
  title:       string;
  description: string;
  duration:    string;
  query:       string; // standard YouTube search query
  queryShort:  string; // used when event is < 30 min away
  durationShort: string;
}

const MEDITATION_TYPES: Record<MeditationType, MeditationTypeConfig> = {
  "breathing": {
    title:         "Gentle Breath Awareness",
    description:   "Release tension with slow, conscious breathing.",
    duration:      "10 min",
    query:         "breathing meditation for stress and anxiety guided",
    queryShort:    "quick breathing exercise calm nerves guided",
    durationShort: "3 min",
  },
  "body-scan": {
    title:         "Body Scan for Rest",
    description:   "Soften each part of your body into stillness.",
    duration:      "15 min",
    query:         "body scan meditation for deep relaxation guided",
    queryShort:    "short body scan relaxation guided",
    durationShort: "5 min",
  },
  "visualization": {
    title:         "Confidence Visualization",
    description:   "See yourself grounded, capable, and clear.",
    duration:      "10 min",
    query:         "confidence visualization guided meditation",
    queryShort:    "quick confidence visualization before performance guided",
    durationShort: "4 min",
  },
  "focus": {
    title:         "Focus & Clarity",
    description:   "Clear your mind and sharpen your attention.",
    duration:      "8 min",
    query:         "focus clarity meditation guided mindfulness",
    queryShort:    "quick focus meditation before meeting guided",
    durationShort: "3 min",
  },
  "loving-kindness": {
    title:         "Loving Kindness",
    description:   "Turn warmth toward yourself and those around you.",
    duration:      "10 min",
    query:         "loving kindness metta meditation guided",
    queryShort:    "short loving kindness meditation guided",
    durationShort: "5 min",
  },
  "grounding": {
    title:         "Grounded in Nature",
    description:   "Come back to the present, steady and rooted.",
    duration:      "12 min",
    query:         "grounding meditation anxiety relief guided",
    queryShort:    "quick grounding meditation guided present moment",
    durationShort: "4 min",
  },
  "anxiety-relief": {
    title:         "Ease the Anxious Mind",
    description:   "Gently untangle worry with breath and stillness.",
    duration:      "12 min",
    query:         "anxiety relief calming meditation guided breath",
    queryShort:    "quick anxiety relief meditation guided breathing",
    durationShort: "4 min",
  },
  "sleep": {
    title:         "Drift into Sleep",
    description:   "A gentle voice to guide you into deep rest.",
    duration:      "20 min",
    query:         "sleep meditation deep rest guided voice",
    queryShort:    "sleep meditation guided rest",
    durationShort: "10 min",
  },
  "energy": {
    title:         "Morning Energy",
    description:   "Rise with warmth and set a clear tone for the day.",
    duration:      "8 min",
    query:         "morning energy positive guided meditation",
    queryShort:    "quick energizing meditation morning guided",
    durationShort: "3 min",
  },
  "intention-setting": {
    title:         "Set Your Intention",
    description:   "Begin with purpose. Choose how you want to show up.",
    duration:      "8 min",
    query:         "intention setting morning meditation guided",
    queryShort:    "quick intention setting meditation guided",
    durationShort: "3 min",
  },
};

// ─── Scoring matrices ─────────────────────────────────────────────────────────

type ScoreMap = Partial<Record<MeditationType, number>>;

const EMOTION_SCORES: Record<Feeling, ScoreMap> = {
  stressed: {
    "breathing":      5,
    "anxiety-relief": 4,
    "body-scan":      3,
    "grounding":      3,
  },
  overwhelmed: {
    "grounding":      5,
    "anxiety-relief": 5,
    "breathing":      4,
    "body-scan":      3,
  },
  calm: {
    "loving-kindness":  4,
    "intention-setting": 4,
    "focus":            3,
    "visualization":    3,
  },
  hopeful: {
    "visualization":     5,
    "intention-setting": 5,
    "loving-kindness":   4,
    "focus":             3,
  },
  tired: {
    "body-scan": 5,
    "sleep":     5,
    "breathing": 3,
    "grounding": 3,
  },
};

const CALENDAR_SCORES: Record<NonNullable<CalendarContext>, ScoreMap> = {
  interview: {
    "visualization": 5,
    "breathing":     4,
    "focus":         3,
    "grounding":     2,
  },
  presentation: {
    "visualization": 5,
    "breathing":     4,
    "focus":         3,
    "grounding":     2,
  },
  meeting: {
    "focus":             5,
    "breathing":         3,
    "intention-setting": 3,
  },
  deadline: {
    "breathing":      5,
    "anxiety-relief": 4,
    "focus":          3,
  },
  workout: {
    "energy":    5,
    "breathing": 4,
    "grounding": 3,
  },
  travel: {
    "anxiety-relief": 4,
    "grounding":      4,
    "breathing":      3,
  },
  review: {
    "visualization": 4,
    "breathing":     4,
    "focus":         3,
  },
};

const PERIOD_SCORES: Record<TimePeriod, ScoreMap> = {
  morning:   { "intention-setting": 4, "focus": 3, "energy": 3, "loving-kindness": 2 },
  afternoon: { "focus": 4, "breathing": 3, "grounding": 3 },
  evening:   { "body-scan": 4, "loving-kindness": 3, "breathing": 3 },
  night:     { "sleep": 5, "body-scan": 4, "breathing": 3 },
};

// ─── Scoring engine ───────────────────────────────────────────────────────────

function addScores(totals: Record<MeditationType, number>, partial: ScoreMap) {
  for (const [type, score] of Object.entries(partial) as [MeditationType, number][]) {
    totals[type] = (totals[type] ?? 0) + score;
  }
}

export interface RecommendationInput {
  feeling:         Feeling;
  period:          TimePeriod;
  calendarContext: CalendarContext;
  isSoon:          boolean;
}

export function getRecommendationsFromEngine(
  input: RecommendationInput,
  count = 3
): Meditation[] {
  const { feeling, period, calendarContext, isSoon } = input;

  // Initialise all types at 0
  const scores = Object.fromEntries(
    Object.keys(MEDITATION_TYPES).map((t) => [t, 0])
  ) as Record<MeditationType, number>;

  // Apply signal scores
  addScores(scores, EMOTION_SCORES[feeling]);
  addScores(scores, PERIOD_SCORES[period]);
  if (calendarContext) addScores(scores, CALENDAR_SCORES[calendarContext]);

  // Sort descending, take top N
  const ranked = (Object.entries(scores) as [MeditationType, number][])
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([type]) => type);

  // Map to Meditation objects
  return ranked.map((type) => {
    const config = MEDITATION_TYPES[type];
    return {
      id:           type,
      title:        config.title,
      duration:     isSoon ? config.durationShort : config.duration,
      description:  config.description,
      youtubeQuery: isSoon ? config.queryShort : config.query,
      feelings:     [feeling],
      periods:      [period],
    };
  });
}
