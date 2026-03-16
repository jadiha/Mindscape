"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";

// ─── Fixed floating dot data (avoids hydration mismatch from Math.random) ───
// Each dot has: width, height, left%, top%, color index, animation duration, delay
const DOTS = [
  { w: 6,  h: 6,  l: 12, t: 18, c: 0, dur: 5.2, del: 0.2 },
  { w: 8,  h: 8,  l: 78, t: 12, c: 1, dur: 4.1, del: 0.8 },
  { w: 4,  h: 4,  l: 45, t: 8,  c: 2, dur: 6.3, del: 1.5 },
  { w: 7,  h: 7,  l: 25, t: 72, c: 0, dur: 5.5, del: 0.0 },
  { w: 5,  h: 5,  l: 88, t: 55, c: 1, dur: 4.8, del: 2.0 },
  { w: 9,  h: 9,  l: 62, t: 82, c: 2, dur: 7.1, del: 0.5 },
  { w: 4,  h: 4,  l: 35, t: 42, c: 0, dur: 4.0, del: 1.2 },
  { w: 6,  h: 6,  l: 92, t: 28, c: 1, dur: 6.0, del: 0.9 },
  { w: 5,  h: 5,  l: 8,  t: 85, c: 2, dur: 5.0, del: 1.8 },
  { w: 7,  h: 7,  l: 55, t: 22, c: 0, dur: 4.5, del: 0.3 },
  { w: 4,  h: 4,  l: 72, t: 68, c: 1, dur: 6.5, del: 2.2 },
  { w: 8,  h: 8,  l: 20, t: 52, c: 2, dur: 5.8, del: 1.0 },
];

// Three soft nature-inspired dot colors
const DOT_COLORS = [
  "rgba(106, 158, 120, 0.65)",  // sage green
  "rgba(158, 207, 232, 0.70)",  // sky blue
  "rgba(212, 160, 168, 0.55)",  // soft rose
];

// The title letters — each one animates in individually for a graceful reveal
const TITLE = "MINDSCAPE";

interface LandingPageProps {
  onBegin: () => void;
}

export default function LandingPage({ onBegin }: LandingPageProps) {
  // Resolves to null on server, then fills in on the client
  const tod = useTimeOfDay();

  // Fall back to the afternoon gradient until the hook resolves on the client
  const gradient =
    tod?.gradient ??
    "linear-gradient(180deg, #7BAFD0 0%, #9EC8E0 14%, #C0DAE8 28%, #DCD5CA 48%, #BDD0AD 68%, #8FAF8A 88%, #6A9470 100%)";

  const textPrimary = tod?.textPrimary ?? "#263432";
  const textSecondary = tod?.textSecondary ?? "#3E5450";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.9 }}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ background: gradient }}
    >
      {/* ── Atmospheric background glow orbs ── */}

      {/* Sky orb — top left */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-15%",
          left: "-12%",
          width: "65vw",
          height: "65vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(155, 210, 238, 0.55) 0%, transparent 70%)",
          filter: "blur(55px)",
        }}
      />

      {/* Meadow orb — bottom right */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-15%",
          right: "-8%",
          width: "55vw",
          height: "55vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(90, 158, 110, 0.55) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* Blush orb — center right */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "25%",
          right: "3%",
          width: "35vw",
          height: "35vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(210, 150, 162, 0.38) 0%, transparent 70%)",
          filter: "blur(45px)",
        }}
      />

      {/* ── Floating botanical dots ── */}
      {DOTS.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${dot.w}px`,
            height: `${dot.h}px`,
            left: `${dot.l}%`,
            top: `${dot.t}%`,
            background: DOT_COLORS[dot.c],
          }}
          animate={{
            y: [0, -16, 0],
            opacity: [0.45, 0.85, 0.45],
          }}
          transition={{
            duration: dot.dur,
            repeat: Infinity,
            delay: dot.del,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* ── Main centered content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-2xl mx-auto">

        {/* Small organic mark above the title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          className="mb-10"
        >
          {/* Simple leaf cross mark */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <ellipse cx="14" cy="14" rx="1.8" ry="10" fill="rgba(74, 124, 90, 0.65)" />
            <ellipse cx="14" cy="14" rx="10" ry="1.8" fill="rgba(74, 124, 90, 0.35)" />
            <circle cx="14" cy="14" r="3" fill="rgba(74, 124, 90, 0.8)" />
          </svg>
        </motion.div>

        {/* Title — each letter fades + slides up with a slight stagger */}
        <h1
          className="font-display font-light tracking-[0.3em] mb-0 whitespace-nowrap"
          style={{
            fontSize: "clamp(1.8rem, 7vw, 6rem)",
            letterSpacing: "0.28em",
            color: textPrimary,
          }}
          aria-label="Mindscape"
        >
          {TITLE.split("").map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.5 + i * 0.07,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="inline-block"
            >
              {letter}
            </motion.span>
          ))}
        </h1>

        {/* Time-of-day greeting — fades in after the title finishes */}
        <AnimatePresence>
          {tod && (
            <motion.p
              key={tod.period}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              className="font-body mt-4 mb-0"
              style={{
                fontSize: "0.78rem",
                letterSpacing: "0.18em",
                color: textSecondary,
              }}
            >
              {tod.greeting} {tod.emoji}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Thin divider line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-6 mb-7 w-14 h-px origin-center"
          style={{ background: "rgba(74, 124, 90, 0.5)" }}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 1.7 }}
          className="font-display italic font-light leading-relaxed mb-16"
          style={{
            fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
            color: textSecondary,
          }}
        >
          A meditation for the moment you&apos;re in.
        </motion.p>

        {/* Begin Journey button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.8 }}
          whileHover={{
            scale: 1.04,
            boxShadow: "0 10px 36px rgba(74, 124, 90, 0.38)",
          }}
          whileTap={{ scale: 0.97 }}
          onClick={onBegin}
          className="relative px-14 py-4 rounded-full font-body text-xs tracking-[0.22em] uppercase text-[#263432] overflow-hidden transition-shadow duration-300"
          style={{
            background: "rgba(143, 184, 154, 0.32)",
            border: "1px solid rgba(106, 148, 112, 0.48)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          Begin Journey
        </motion.button>
      </div>

      {/* ── Rolling grass wave at the bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 130"
          preserveAspectRatio="none"
          className="w-full"
          style={{ height: "clamp(60px, 10vw, 130px)" }}
        >
          <path
            d="M0,65 C200,105 400,30 600,65 C800,100 1000,25 1200,55 C1320,70 1380,58 1440,62 L1440,130 L0,130 Z"
            fill="rgba(74, 124, 90, 0.18)"
          />
          <path
            d="M0,85 C300,50 600,108 900,78 C1100,60 1280,90 1440,82 L1440,130 L0,130 Z"
            fill="rgba(74, 124, 90, 0.12)"
          />
        </svg>
      </div>
    </motion.div>
  );
}
