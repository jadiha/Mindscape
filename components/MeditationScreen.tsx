"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BreathingCircle from "./BreathingCircle";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { Meditation } from "@/data/meditations";
import { VideoResult } from "@/lib/youtube";

const DOTS = [
  { w: 5,  h: 5,  l: 8,  t: 20, c: 0, dur: 5.0, del: 0.4 },
  { w: 7,  h: 7,  l: 82, t: 10, c: 1, dur: 4.5, del: 1.1 },
  { w: 4,  h: 4,  l: 55, t: 6,  c: 2, dur: 6.2, del: 0.8 },
  { w: 6,  h: 6,  l: 18, t: 78, c: 0, dur: 5.8, del: 0.2 },
  { w: 8,  h: 8,  l: 90, t: 60, c: 1, dur: 4.8, del: 2.0 },
  { w: 5,  h: 5,  l: 68, t: 85, c: 2, dur: 7.0, del: 0.6 },
];

const DOT_COLORS = [
  "rgba(106, 158, 120, 0.55)",
  "rgba(158, 207, 232, 0.65)",
  "rgba(212, 160, 168, 0.50)",
];

interface MeditationScreenProps {
  meditation: Meditation;
  onBack: () => void;
}

type PlayState = "idle" | "loading" | "playing" | "unavailable";

export default function MeditationScreen({ meditation, onBack }: MeditationScreenProps) {
  const tod = useTimeOfDay();

  const [playState, setPlayState] = useState<PlayState>("idle");
  // If the meditation already has a videoId (from YouTube fetch), use it directly
  const [videoId, setVideoId] = useState<string | null>(meditation.videoId ?? null);

  const gradient =
    tod?.gradient ??
    "linear-gradient(180deg, #7BAFD0 0%, #9EC8E0 14%, #C0DAE8 28%, #DCD5CA 48%, #BDD0AD 68%, #8FAF8A 88%, #6A9470 100%)";
  const textPrimary   = tod?.textPrimary   ?? "#263432";
  const textSecondary = tod?.textSecondary ?? "#3E5450";

  async function handlePlay() {
    // If we already have a videoId, play immediately
    if (videoId) {
      setPlayState("playing");
      return;
    }

    // Otherwise fetch via the card's youtubeQuery
    setPlayState("loading");

    try {
      const res = await fetch(
        `/api/meditations?q=${encodeURIComponent(meditation.youtubeQuery)}`
      );

      if (!res.ok) {
        setPlayState("unavailable");
        return;
      }

      const data: { result: VideoResult | null } = await res.json();

      if (data.result?.videoId) {
        setVideoId(data.result.videoId);
        setPlayState("playing");
      } else {
        setPlayState("unavailable");
      }
    } catch {
      setPlayState("unavailable");
    }
  }

  function handleClose() {
    setPlayState("idle");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 1.0, ease: "easeOut" }}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ background: gradient }}
    >
      {/* ── Background orbs ── */}
      <div className="absolute pointer-events-none" style={{
        top: "-12%", left: "-10%",
        width: "55vw", height: "55vw",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(155, 210, 238, 0.45) 0%, transparent 70%)",
        filter: "blur(55px)",
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: "-12%", right: "-6%",
        width: "50vw", height: "50vw",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(90, 158, 110, 0.50) 0%, transparent 70%)",
        filter: "blur(65px)",
      }} />

      {/* ── Floating dots ── */}
      {DOTS.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${dot.w}px`, height: `${dot.h}px`,
            left: `${dot.l}%`, top: `${dot.t}%`,
            background: DOT_COLORS[dot.c],
          }}
          animate={{ y: [0, -14, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: dot.dur, repeat: Infinity, delay: dot.del, ease: "easeInOut" }}
        />
      ))}

      {/* ── Back button ── */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={onBack}
        className="absolute top-8 left-8 z-20 font-body text-xs tracking-[0.18em] uppercase flex items-center gap-2"
        style={{
          color: textSecondary,
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(106, 148, 112, 0.3)",
          padding: "8px 16px",
          borderRadius: "999px",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Return
      </motion.button>

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-xl mx-auto w-full py-20 max-h-screen overflow-y-auto">

        {/* Greeting */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: tod ? 1 : 0, y: tod ? 0 : 8 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-body mb-3"
          style={{ fontSize: "0.82rem", letterSpacing: "0.2em", color: textSecondary }}
        >
          {tod && (
            <>
              {tod.greeting} {tod.emoji}
              <span className="mx-3 opacity-40">·</span>
              <span className="italic font-light opacity-70">be present</span>
            </>
          )}
        </motion.p>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.6 }}
          className="font-display font-light leading-snug mb-2"
          style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", color: textPrimary }}
        >
          {meditation.title}
        </motion.h2>

        {/* Channel / duration */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="font-body mb-14"
          style={{ fontSize: "0.8rem", letterSpacing: "0.14em", color: textSecondary }}
        >
          {meditation.channelTitle ?? meditation.duration}
          {meditation.duration && meditation.channelTitle && (
            <>
              <span className="mx-2 opacity-40">·</span>
              <span className="italic font-light opacity-75">{meditation.duration}</span>
            </>
          )}
        </motion.p>

        {/* Breathing circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.3, delay: 0.9, ease: "easeOut" }}
          className="mb-14"
        >
          <BreathingCircle />
        </motion.div>

        {/* Play button / unavailable notice */}
        <AnimatePresence>
          {playState === "unavailable" ? (
            <motion.p
              key="unavailable"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="font-body italic"
              style={{ fontSize: "0.82rem", color: textSecondary, opacity: 0.65 }}
            >
              No video found for this meditation.
            </motion.p>
          ) : playState !== "playing" ? (
            <motion.button
              key="play-btn"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, scale: 0.95 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              whileHover={playState === "loading" ? {} : { scale: 1.04, boxShadow: "0 10px 34px rgba(74, 124, 90, 0.38)" }}
              whileTap={playState === "loading" ? {} : { scale: 0.97 }}
              onClick={playState === "idle" ? handlePlay : undefined}
              disabled={playState === "loading"}
              className="flex items-center gap-3 px-12 py-4 rounded-full font-body text-xs tracking-[0.22em] uppercase"
              style={{
                color: textPrimary,
                background: "rgba(143, 184, 154, 0.32)",
                border: "1px solid rgba(106, 148, 112, 0.48)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                opacity: playState === "loading" ? 0.7 : 1,
                cursor: playState === "loading" ? "default" : "pointer",
              }}
            >
              {playState === "loading" ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ display: "inline-block", width: 13, height: 13 }}
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 10" />
                    </svg>
                  </motion.span>
                  Finding your video...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M3 2L11 7L3 12V2Z"
                      fill="rgba(38, 52, 50, 0.8)"
                      stroke="rgba(38, 52, 50, 0.8)"
                      strokeWidth="0.5" strokeLinejoin="round"
                    />
                  </svg>
                  Play Meditation
                </>
              )}
            </motion.button>
          ) : null}
        </AnimatePresence>

        {/* YouTube embed */}
        <AnimatePresence>
          {playState === "playing" && videoId && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="w-full max-w-lg"
            >
              <div
                className="relative w-full rounded-2xl overflow-hidden"
                style={{
                  paddingBottom: "56.25%",
                  boxShadow: "0 20px 60px rgba(38, 52, 50, 0.22), 0 4px 16px rgba(38, 52, 50, 0.12)",
                }}
              >
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white`}
                  title="Guided Meditation"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={handleClose}
                whileHover={{ scale: 1.02 }}
                className="mt-4 w-full py-3 rounded-xl font-body text-xs tracking-[0.18em] uppercase"
                style={{
                  color: textSecondary,
                  background: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                Close
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
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
