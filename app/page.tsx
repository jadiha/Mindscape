"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import LandingPage from "@/components/LandingPage";
import FeelingCheckIn from "@/components/FeelingCheckIn";
import RecommendationScreen from "@/components/RecommendationScreen";
import MeditationScreen from "@/components/MeditationScreen";
import { Feeling, Meditation } from "@/data/meditations";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";

// ─── All possible screens in the app ─────────────────────────────────────────
type Screen = "landing" | "checkin" | "recommendations" | "meditation";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [selectedFeeling, setSelectedFeeling] = useState<Feeling | null>(null);
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);

  // Keep the same gradient on <main> so the body never shows through
  // during the gap between one screen exiting and the next entering.
  const tod = useTimeOfDay();
  const gradient =
    tod?.gradient ??
    "linear-gradient(180deg, #7BAFD0 0%, #9EC8E0 14%, #C0DAE8 28%, #DCD5CA 48%, #BDD0AD 68%, #8FAF8A 88%, #6A9470 100%)";

  // ── Navigation handlers ──────────────────────────────────────────────────
  function handleBeginJourney() {
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
      {/*
        AnimatePresence "wait" mode: the exiting screen fully fades out
        before the entering screen starts — keeps transitions clean.
      */}
      <AnimatePresence mode="wait">

        {screen === "landing" && (
          <LandingPage
            key="landing"
            onBegin={handleBeginJourney}
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
