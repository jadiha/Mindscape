import { TimePeriod } from "@/hooks/useTimeOfDay";

export type Feeling = "calm" | "stressed" | "overwhelmed" | "hopeful" | "tired";

export const FEELING_CONFIG: Record<
  Feeling,
  {
    label: string;
    emoji: string;
    supportMessage: string;
    accentColor: string;
  }
> = {
  calm: {
    label: "Calm",
    emoji: "🌿",
    supportMessage: "You're already in a peaceful place. Let's deepen it.",
    accentColor: "rgba(106, 158, 120, 0.45)",
  },
  stressed: {
    label: "Stressed",
    emoji: "⚡",
    supportMessage: "You said you're feeling stressed. Let's slow down together.",
    accentColor: "rgba(210, 165, 60, 0.45)",
  },
  overwhelmed: {
    label: "Overwhelmed",
    emoji: "🌧",
    supportMessage: "That's a lot to carry. Let's set it down, just for now.",
    accentColor: "rgba(100, 145, 195, 0.45)",
  },
  hopeful: {
    label: "Hopeful",
    emoji: "🌱",
    supportMessage: "Something new is growing in you. Let's nurture it.",
    accentColor: "rgba(120, 185, 115, 0.45)",
  },
  tired: {
    label: "Tired",
    emoji: "🌙",
    supportMessage: "Rest is not giving up. Let's restore you, gently.",
    accentColor: "rgba(140, 115, 185, 0.45)",
  },
};

// ─── Meditation Recommendation Object ─────────────────────────────────────────
//
// Each meditation is a self-contained object. The `youtubeQuery` field is the
// exact search string sent to the YouTube API when the user clicks "Begin".
// This guarantees the video always matches what the card describes.
//
// Example:
//   title:        "Gentle Breath Awareness"
//   youtubeQuery: "10 minute guided breathing meditation relaxation"
//   → YouTube returns a breathing meditation, not a generic wellness video

export interface Meditation {
  id: string;
  title: string;
  duration: string;
  description: string;
  youtubeQuery: string;
  feelings: Feeling[];
  periods: TimePeriod[];
  // Populated at runtime when fetched from YouTube
  videoId?: string;
  thumbnail?: string;
  channelTitle?: string;
}

export const MEDITATIONS: Meditation[] = [
  {
    id: "breath-awareness",
    title: "Gentle Breath Awareness",
    duration: "10 min",
    description: "Release tension with slow, conscious breathing.",
    youtubeQuery: "breathing meditation for stress and anxiety guided",
    feelings: ["stressed", "overwhelmed", "calm"],
    periods: ["morning", "afternoon", "evening", "night"],
  },
  {
    id: "body-scan",
    title: "Body Scan for Rest",
    duration: "15 min",
    description: "Soften each part of your body into stillness.",
    youtubeQuery: "body scan meditation for deep relaxation guided",
    feelings: ["tired", "overwhelmed", "stressed"],
    periods: ["evening", "night"],
  },
  {
    id: "morning-clarity",
    title: "Morning Clarity",
    duration: "8 min",
    description: "Begin your day with intention and a quiet mind.",
    youtubeQuery: "morning intention meditation guided clarity",
    feelings: ["hopeful", "calm", "tired"],
    periods: ["morning"],
  },
  {
    id: "nature-grounding",
    title: "Grounded in Nature",
    duration: "12 min",
    description: "Let the sounds of the earth hold you steady.",
    youtubeQuery: "nature sounds grounding meditation guided",
    feelings: ["stressed", "overwhelmed", "calm"],
    periods: ["afternoon", "evening"],
  },
  {
    id: "loving-kindness",
    title: "Loving Kindness",
    duration: "10 min",
    description: "Turn warmth toward yourself and those around you.",
    youtubeQuery: "loving kindness metta meditation guided",
    feelings: ["hopeful", "calm", "tired"],
    periods: ["morning", "afternoon", "evening", "night"],
  },
  {
    id: "anxiety-ease",
    title: "Ease the Anxious Mind",
    duration: "12 min",
    description: "Gently untangle worry with guided breath and stillness.",
    youtubeQuery: "anxiety relief meditation guided calming breath",
    feelings: ["stressed", "overwhelmed"],
    periods: ["morning", "afternoon", "evening", "night"],
  },
  {
    id: "evening-unwind",
    title: "Evening Unwind",
    duration: "15 min",
    description: "Let go of the day and ease softly into the night.",
    youtubeQuery: "evening unwind relaxation meditation guided",
    feelings: ["tired", "stressed", "calm"],
    periods: ["evening", "night"],
  },
  {
    id: "open-awareness",
    title: "Open Awareness",
    duration: "10 min",
    description: "Rest in the spaciousness of this present moment.",
    youtubeQuery: "open awareness mindfulness meditation present moment",
    feelings: ["hopeful", "calm"],
    periods: ["morning", "afternoon"],
  },
  {
    id: "afternoon-reset",
    title: "Afternoon Reset",
    duration: "7 min",
    description: "A short pause to clear your mind mid-day.",
    youtubeQuery: "short meditation for focus and mental reset",
    feelings: ["stressed", "overwhelmed", "tired"],
    periods: ["afternoon"],
  },
  {
    id: "sleep-drift",
    title: "Drift into Sleep",
    duration: "20 min",
    description: "A gentle voice to guide you into deep rest.",
    youtubeQuery: "sleep meditation deep rest guided voice",
    feelings: ["tired", "overwhelmed"],
    periods: ["night"],
  },
  {
    id: "morning-energy",
    title: "Morning Energy",
    duration: "10 min",
    description: "Rise with warmth and set a clear tone for the day.",
    youtubeQuery: "morning energy positive guided meditation",
    feelings: ["hopeful", "calm"],
    periods: ["morning"],
  },
  {
    id: "stress-release",
    title: "Stress Release",
    duration: "10 min",
    description: "Dissolve the weight of the day with conscious letting go.",
    youtubeQuery: "stress release meditation guided letting go",
    feelings: ["stressed"],
    periods: ["morning", "afternoon", "evening", "night"],
  },
  {
    id: "overwhelm-anchor",
    title: "Find Your Anchor",
    duration: "10 min",
    description: "When everything feels like too much, come back to now.",
    youtubeQuery: "grounding meditation for overwhelm anxiety guided",
    feelings: ["overwhelmed"],
    periods: ["morning", "afternoon", "evening", "night"],
  },
  {
    id: "gentle-restore",
    title: "Gentle Restoration",
    duration: "12 min",
    description: "A soft practice to rebuild your energy from within.",
    youtubeQuery: "restorative meditation for tiredness and fatigue guided",
    feelings: ["tired"],
    periods: ["morning", "afternoon"],
  },
  {
    id: "hopeful-heart",
    title: "Nurture Hope",
    duration: "8 min",
    description: "Tend to the seeds of possibility growing inside you.",
    youtubeQuery: "positive hopeful guided meditation visualization",
    feelings: ["hopeful"],
    periods: ["morning", "afternoon"],
  },
  {
    id: "calm-deepen",
    title: "Deepen Your Calm",
    duration: "10 min",
    description: "Settle further into the stillness you already carry.",
    youtubeQuery: "deep calm mindfulness meditation guided stillness",
    feelings: ["calm"],
    periods: ["morning", "afternoon", "evening", "night"],
  },
];

// ─── Recommendation filter ─────────────────────────────────────────────────────

/**
 * Returns up to `count` meditations matched by feeling + time period.
 * Priority: both match first, then feeling-only as fallback.
 */
export function getRecommendations(
  feeling: Feeling,
  period: TimePeriod,
  count = 3
): Meditation[] {
  const exactMatch = MEDITATIONS.filter(
    (m) => m.feelings.includes(feeling) && m.periods.includes(period)
  );
  const feelingOnly = MEDITATIONS.filter(
    (m) => m.feelings.includes(feeling) && !exactMatch.includes(m)
  );
  return [...exactMatch, ...feelingOnly].slice(0, count);
}
