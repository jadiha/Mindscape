/**
 * lib/contextExtractor.ts
 *
 * Scans calendar event titles for keywords and extracts the dominant
 * meditation context. Also determines whether any event is "soon"
 * (starting within 30 minutes) which triggers shorter recommendations.
 */

import { CalendarEvent } from "@/app/api/calendar/route";

// ─── Context types ─────────────────────────────────────────────────────────────

export type CalendarContext =
  | "interview"
  | "presentation"
  | "meeting"
  | "deadline"
  | "workout"
  | "travel"
  | "review"
  | null;

export interface ExtractedContext {
  context:    CalendarContext;
  eventTitle: string | null;  // the event that triggered the context
  isSoon:     boolean;        // event starts within 30 minutes
  minutesUntil: number | null;
}

// ─── Keyword → context mapping ────────────────────────────────────────────────

const KEYWORD_MAP: Array<{ keywords: string[]; context: CalendarContext }> = [
  { keywords: ["interview", "interviewing"],                          context: "interview"     },
  { keywords: ["presentation", "present", "demo", "showcase", "pitch"], context: "presentation" },
  { keywords: ["meeting", "sync", "standup", "1:1", "call", "chat"], context: "meeting"      },
  { keywords: ["deadline", "due", "submit", "submission", "launch"], context: "deadline"     },
  { keywords: ["workout", "gym", "run", "yoga", "pilates", "training", "class"], context: "workout" },
  { keywords: ["flight", "travel", "trip", "airport", "transit"],    context: "travel"       },
  { keywords: ["review", "performance", "appraisal", "evaluation"],  context: "review"       },
];

// ─── Main extractor ────────────────────────────────────────────────────────────

export function extractCalendarContext(events: CalendarEvent[]): ExtractedContext {
  if (!events.length) {
    return { context: null, eventTitle: null, isSoon: false, minutesUntil: null };
  }

  const now = Date.now();

  // Find the soonest event, and the first event that matches a keyword
  let dominantContext: CalendarContext = null;
  let matchedTitle: string | null = null;
  let isSoon = false;
  let minutesUntil: number | null = null;

  for (const event of events) {
    const titleLower = event.title.toLowerCase();

    // Check timing
    const start = new Date(event.startTime).getTime();
    const mins  = Math.round((start - now) / 60_000);

    if (mins >= 0 && mins <= 30) {
      isSoon = true;
      minutesUntil = mins;
    }

    // Match keywords — first match wins (events are sorted by start time)
    if (!dominantContext) {
      for (const { keywords, context } of KEYWORD_MAP) {
        if (keywords.some((kw) => titleLower.includes(kw))) {
          dominantContext = context;
          matchedTitle    = event.title;
          break;
        }
      }
    }
  }

  return {
    context:      dominantContext,
    eventTitle:   matchedTitle,
    isSoon,
    minutesUntil,
  };
}
