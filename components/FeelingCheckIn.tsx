"use client";

import { motion } from "framer-motion";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { Feeling, FEELING_CONFIG } from "@/data/meditations";

// Turn the config object into an ordered array for rendering
const FEELINGS = Object.entries(FEELING_CONFIG) as [
  Feeling,
  (typeof FEELING_CONFIG)[Feeling]
][];

interface FeelingCheckInProps {
  onSelect: (feeling: Feeling) => void;
  onBack: () => void;
}

export default function FeelingCheckIn({ onSelect, onBack }: FeelingCheckInProps) {
  const tod = useTimeOfDay();

  const gradient =
    tod?.gradient ??
    "linear-gradient(180deg, #7BAFD0 0%, #9EC8E0 14%, #C0DAE8 28%, #DCD5CA 48%, #BDD0AD 68%, #8FAF8A 88%, #6A9470 100%)";

  const textPrimary = tod?.textPrimary ?? "#263432";
  const textSecondary = tod?.textSecondary ?? "#3E5450";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ background: gradient }}
    >
      {/* ── Background orbs (same as other screens) ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-12%", left: "-10%",
          width: "55vw", height: "55vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(155, 210, 238, 0.45) 0%, transparent 70%)",
          filter: "blur(55px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-12%", right: "-6%",
          width: "50vw", height: "50vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(90, 158, 110, 0.50) 0%, transparent 70%)",
          filter: "blur(65px)",
        }}
      />

      {/* ── Back button ── */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={onBack}
        className="absolute top-8 left-8 z-20 font-body flex items-center gap-2"
        style={{
          fontSize: "0.72rem",
          letterSpacing: "0.18em",
          color: textSecondary,
          textTransform: "uppercase",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.22)",
          padding: "8px 16px",
          borderRadius: "999px",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Return
      </motion.button>

      {/* ── Main content — scrollable so pills are never clipped on small screens ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-lg mx-auto w-full py-20 max-h-screen overflow-y-auto">

        {/* Small label above the question */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="font-body mb-5"
          style={{
            fontSize: "0.72rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: textSecondary,
            opacity: 0.75,
          }}
        >
          check in
        </motion.p>

        {/* Main question */}
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.5 }}
          className="font-display font-light leading-snug mb-14"
          style={{
            fontSize: "clamp(1.8rem, 5vw, 3rem)",
            color: textPrimary,
          }}
        >
          How are you feeling
          <br />
          <span className="italic">right now?</span>
        </motion.h2>

        {/* ── Feeling pills ── */}
        <div className="flex flex-wrap justify-center gap-3 max-w-sm">
          {FEELINGS.map(([key, config], i) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 + i * 0.09 }}
              whileHover={{
                scale: 1.06,
                boxShadow: `0 8px 28px ${config.accentColor}`,
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(key)}
              className="font-body flex items-center gap-2 px-6 py-3 rounded-full"
              style={{
                fontSize: "0.82rem",
                letterSpacing: "0.1em",
                color: textPrimary,
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.28)",
                transition: "box-shadow 0.25s ease",
              }}
            >
              <span>{config.emoji}</span>
              <span>{config.label}</span>
            </motion.button>
          ))}
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
