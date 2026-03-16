"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import LandingPage from "@/components/LandingPage";
import FeelingCheckIn from "@/components/FeelingCheckIn";
import RecommendationScreen from "@/components/RecommendationScreen";
import MeditationScreen from "@/components/MeditationScreen";
import { Feeling, Meditation } from "@/data/meditations";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { CalendarEvent } from "@/app/api/calendar/route";

type Screen = "landing" | "checkin" | "recommendations" | "meditation";

export default function Home() {
  const [screen, setScreen]                     = useState<Screen>("landing");
  const [selectedFeeling, setSelectedFeeling]   = useState<Feeling | null>(null);
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
  const [calendarEvents, setCalendarEvents]     = useState<CalendarEvent[] | null>(null);

  const { data: session } = useSession();

  const tod = useTimeOfDay();
  const gradient =
    tod?.gradient ??
    "linear-gradient(180deg, #7BAFD0 0%, #9EC8E0 14%, #C0DAE8 28%, #DCD5CA 48%, #BDD0AD 68%, #8FAF8A 88%, #6A9470 100%)";

  // Called after Google sign-in — fetch calendar events immediately
  async function handleCalendarConnected(accessToken: string) {
    try {
      const res = await fetch("/api/calendar", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) { setCalendarEvents([]); return; }
      const data = await res.json();
      setCalendarEvents(data.events ?? []);
    } catch {
      setCalendarEvents([]);
    }
  }

  function handleBeginJourney() {
    // If already signed in but haven't fetched events yet, fetch now
    if (session?.accessToken && calendarEvents === null) {
      handleCalendarConnected(session.accessToken);
    }
    setScreen("checkin");
  }

  function handleSelectFeeling(feeling: Feeling) {
    setSelectedFeeling(feeling);
    setScreen("recommendations");
  }

  function handleSelectMeditation(meditation: Meditation) {
    setSelectedMeditation(meditation);
    setScreen("meditation");
  }

  return (
    <main style={{ background: gradient, minHeight: "100vh" }}>
      <AnimatePresence mode="wait">

        {screen === "landing" && (
          <LandingPage
            key="landing"
            onBegin={handleBeginJourney}
            onCalendarConnected={handleCalendarConnected}
            calendarConnected={calendarEvents !== null}
          />
        )}

        {screen === "checkin" && (
          <FeelingCheckIn
            key="checkin"
            onSelect={handleSelectFeeling}
            onBack={() => setScreen("landing")}
          />
        )}

        {screen === "recommendations" && selectedFeeling && (
          <RecommendationScreen
            key="recommendations"
            feeling={selectedFeeling}
            calendarEvents={calendarEvents ?? []}
            onSelectMeditation={handleSelectMeditation}
            onBack={() => setScreen("checkin")}
          />
        )}

        {screen === "meditation" && selectedMeditation && (
          <MeditationScreen
            key="meditation"
            meditation={selectedMeditation}
            onBack={() => setScreen("recommendations")}
          />
        )}

      </AnimatePresence>
    </main>
  );
}
