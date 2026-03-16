/**
 * useTimeOfDay
 *
 * Detects the user's local hour and returns everything the UI needs
 * to adapt to the time of day: greeting text, emoji, gradient, and
 * text colors. All pages import from here — one source of truth.
 */

import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TimePeriod = "morning" | "afternoon" | "evening" | "night";

export interface TimeOfDay {
  period: TimePeriod;
  greeting: string;   // e.g. "Good Morning"
  emoji: string;      // e.g. "☀️"
  gradient: string;   // CSS linear-gradient for the page background
  textPrimary: string;   // main heading color
  textSecondary: string; // subtitle / body color
}

// ─── Per-period config ────────────────────────────────────────────────────────

const TIME_CONFIG: Record<TimePeriod, Omit<TimeOfDay, "period">> = {

  // 05:00 – 11:59  →  warm peachy sunrise, gold horizon, fresh meadow
  morning: {
    greeting: "Good Morning",
    emoji: "☀️",
    gradient:
      "linear-gradient(180deg, #E8A060 0%, #F0BC88 15%, #F8D8B8 30%, #E8D8C8 48%, #C0CC98 68%, #8AAE7A 88%, #629458 100%)",
    textPrimary: "#2C3020",
    textSecondary: "#4A5038",
  },

  // 12:00 – 16:59  →  bright cerulean sky, white haze, vivid greens (the default look)
  afternoon: {
    greeting: "Good Afternoon",
    emoji: "🌿",
    gradient:
      "linear-gradient(180deg, #7BAFD0 0%, #9EC8E0 14%, #C0DAE8 28%, #DCD5CA 48%, #BDD0AD 68%, #8FAF8A 88%, #6A9470 100%)",
    textPrimary: "#263432",
    textSecondary: "#3E5450",
  },

  // 17:00 – 20:59  →  amber/coral sky, rose-purple twilight, dark meadow
  evening: {
    greeting: "Good Evening",
    emoji: "🌙",
    gradient:
      "linear-gradient(180deg, #C86848 0%, #D88860 15%, #E0A880 30%, #C8B0A8 48%, #9090A0 68%, #607080 88%, #485868 100%)",
    textPrimary: "#2A2030",
    textSecondary: "#5A4858",
  },

  // 21:00 – 04:59  →  deep midnight blue, indigo dusk, dark forest floor
  night: {
    greeting: "Good Night",
    emoji: "✨",
    gradient:
      "linear-gradient(180deg, #1E2E50 0%, #283858 14%, #324870 28%, #3A4865 48%, #2E3850 68%, #243040 88%, #1A2830 100%)",
    textPrimary: "#E4E0D8",
    textSecondary: "#A8B8B4",
  },
};

// ─── Helper: maps an hour (0–23) to a period ─────────────────────────────────

function getPeriod(hour: number): TimePeriod {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Returns null on the first server render (to avoid hydration mismatch),
 * then resolves to the correct TimeOfDay object on the client.
 */
export function useTimeOfDay(): TimeOfDay | null {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    const period = getPeriod(hour);
    setTimeOfDay({ period, ...TIME_CONFIG[period] });
  }, []);

  return timeOfDay;
}
