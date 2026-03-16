"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import {
  Feeling,
  Meditation,
  FEELING_CONFIG,
  getRecommendations,
} from "@/data/meditations";
import { VideoResult } from "@/lib/youtube";

interface RecommendationScreenProps {
  feeling: Feeling;
  onSelectMeditation: (meditation: Meditation) => void;
  onBack: () => void;
}

export default function RecommendationScreen({
  feeling,
  onSelectMeditation,
  onBack,
}: RecommendationScreenProps) {
  const tod = useTimeOfDay();

  const gradient =
    tod?.gradient ??
    "linear-gradient(180deg, #7BAFD0 0%, #9EC8E0 14%, #C0DAE8 28%, #DCD5CA 48%, #BDD0AD 68%, #8FAF8A 88%, #6A9470 100%)";
  const textPrimary   = tod?.textPrimary   ?? "#263432";
  const textSecondary = tod?.textSecondary ?? "#3E5450";

  const feelingConfig = FEELING_CONFIG[feeling];

  const [loading, setLoading] = useState(true);
  const [meditations, setMeditations] = useState<Meditation[]>([]);

  useEffect(() => {
    if (!tod) return;

    // Step 1 — pick 3 curated recommendations for this feeling + time of day
    const recommendations = getRecommendations(feeling, tod.period);

    // Step 2 — for each recommendation, fetch its own YouTube video in parallel
    Promise.all(
      recommendations.map(async (m): Promise<Meditation> => {
        try {
          const res = await fetch(
            `/api/meditations?q=${encodeURIComponent(m.youtubeQuery)}`
          );
          if (!res.ok) return m; // no API key or error → keep curated card as-is

          const data: { result: VideoResult | null } = await res.json();
          if (!data.result) return m;

          // Attach the video data to the curated card
          return {
            ...m,
            videoId:      data.result.videoId,
            thumbnail:    data.result.thumbnail,
            channelTitle: data.result.channelTitle,
          };
        } catch {
          return m; // network error → keep curated card as-is
        }
      })
    ).then((results) => {
      setMeditations(results);
      setLoading(false);
    });
  }, [feeling, tod]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ background: gradient }}
    >
      {/* ── Background orbs ── */}
      <div className="absolute pointer-events-none" style={{
        top: "-12%", left: "-10%", width: "55vw", height: "55vw",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(155, 210, 238, 0.45) 0%, transparent 70%)",
        filter: "blur(55px)",
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: "-12%", right: "-6%", width: "50vw", height: "50vw",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(90, 158, 110, 0.50) 0%, transparent 70%)",
        filter: "blur(65px)",
      }} />

      {/* ── Back button ── */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
        onClick={onBack}
        className="absolute top-8 left-8 z-20 font-body flex items-center gap-2"
        style={{
          fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase",
          color: textSecondary,
          background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.22)",
          padding: "8px 16px", borderRadius: "999px",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </motion.button>

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-lg mx-auto w-full py-24 max-h-screen overflow-y-auto">

        {/* Feeling badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full"
          style={{ background: feelingConfig.accentColor, border: "1px solid rgba(255,255,255,0.25)" }}
        >
          <span>{feelingConfig.emoji}</span>
          <span className="font-body" style={{
            fontSize: "0.72rem", letterSpacing: "0.16em",
            color: textPrimary, textTransform: "uppercase",
          }}>
            {feelingConfig.label}
          </span>
        </motion.div>

        {/* Supportive message */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.5 }}
          className="font-display italic font-light leading-relaxed mb-4"
          style={{ fontSize: "clamp(1.2rem, 3.5vw, 1.8rem)", color: textPrimary }}
        >
          &ldquo;{feelingConfig.supportMessage}&rdquo;
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="w-10 h-px mb-8 origin-center"
          style={{ background: "rgba(74, 124, 90, 0.5)" }}
        />

        {/* Section label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="font-body mb-6"
          style={{
            fontSize: "0.7rem", letterSpacing: "0.24em",
            textTransform: "uppercase", color: textSecondary, opacity: 0.7,
          }}
        >
          recommended for you
        </motion.p>

        {/* Cards */}
        <div className="w-full flex flex-col gap-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} index={i} />
              ))
            : meditations.map((meditation, i) => (
                <MeditationCard
                  key={meditation.id}
                  meditation={meditation}
                  index={i}
                  accentColor={feelingConfig.accentColor}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  onSelect={() => onSelectMeditation(meditation)}
                />
              ))
          }
        </div>
      </div>

      {/* ── Grass wave ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 130" preserveAspectRatio="none" className="w-full"
          style={{ height: "clamp(55px, 9vw, 120px)" }}>
          <path d="M0,65 C200,105 400,30 600,65 C800,100 1000,25 1200,55 C1320,70 1380,58 1440,62 L1440,130 L0,130 Z"
            fill="rgba(74, 124, 90, 0.18)" />
          <path d="M0,85 C300,50 600,108 900,78 C1100,60 1280,90 1440,82 L1440,130 L0,130 Z"
            fill="rgba(74, 124, 90, 0.12)" />
        </svg>
      </div>
    </motion.div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
      className="w-full rounded-2xl overflow-hidden flex"
      style={{
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      {/* Accent strip placeholder */}
      <div className="w-1 shrink-0 animate-pulse"
        style={{ background: "rgba(255,255,255,0.2)" }} />
      <div className="p-5 flex-1">
        <div className="h-4 rounded-full mb-2 animate-pulse"
          style={{ background: "rgba(255,255,255,0.18)", width: "75%" }} />
        <div className="h-3 rounded-full mb-4 animate-pulse"
          style={{ background: "rgba(255,255,255,0.12)", width: "40%" }} />
        <div className="h-3 rounded-full mb-4 animate-pulse"
          style={{ background: "rgba(255,255,255,0.10)", width: "90%" }} />
        <div className="flex justify-end">
          <div className="h-7 w-20 rounded-full animate-pulse"
            style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Meditation card ──────────────────────────────────────────────────────────

interface MeditationCardProps {
  meditation: Meditation;
  index: number;
  accentColor: string;
  textPrimary: string;
  textSecondary: string;
  onSelect: () => void;
}

function MeditationCard({
  meditation,
  index,
  accentColor,
  textPrimary,
  textSecondary,
  onSelect,
}: MeditationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 1.1 + index * 0.12 }}
      className="w-full text-left rounded-2xl overflow-hidden flex"
      style={{
        background: "rgba(255,255,255,0.14)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.26)",
      }}
    >
      {/* Accent strip — feeling color, full card height */}
      <div
        className="w-1 shrink-0"
        style={{ background: accentColor.replace("0.45)", "0.7)") }}
      />

      <div className="p-5 flex-1">
        {/* Title */}
        <h3 className="font-display font-light leading-snug mb-1"
          style={{ fontSize: "1.0rem", color: textPrimary }}>
          {meditation.title}
        </h3>

        {/* Channel name or duration */}
        <p className="font-body mb-3"
          style={{ fontSize: "0.7rem", letterSpacing: "0.08em", color: textSecondary, opacity: 0.6 }}>
          {meditation.channelTitle ?? meditation.duration}
        </p>

        {/* Description */}
        <p className="font-body mb-4 leading-relaxed"
          style={{ fontSize: "0.8rem", color: textSecondary }}>
          {meditation.description}
        </p>

        {/* Begin button */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.04, x: 2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSelect}
            className="font-body flex items-center gap-2 px-5 py-2 rounded-full"
            style={{
              fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase",
              color: textPrimary,
              background: accentColor.replace("0.45)", "0.25)"),
              border: `1px solid ${accentColor.replace("0.45)", "0.45)")}`,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            Begin
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M2 5H8M8 5L5.5 2.5M8 5L5.5 7.5" stroke="currentColor"
                strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
