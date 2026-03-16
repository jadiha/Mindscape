"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Breathing phase durations (in milliseconds) ───
const INHALE_MS = 4000;  // 4 seconds to breathe in
const EXHALE_MS = 4000;  // 4 seconds to breathe out

type Phase = "inhale" | "exhale";

export default function BreathingCircle() {
  const [phase, setPhase] = useState<Phase>("inhale");

  // Alternate between inhale and exhale every 4 seconds
  useEffect(() => {
    const duration = phase === "inhale" ? INHALE_MS : EXHALE_MS;
    const timer = setTimeout(() => {
      setPhase((prev) => (prev === "inhale" ? "exhale" : "inhale"));
    }, duration);
    return () => clearTimeout(timer);
  }, [phase]);

  // Expanding on inhale, contracting on exhale
  const isExpanding = phase === "inhale";

  return (
    <div
      className="relative flex items-center justify-center mx-auto"
      style={{ width: 260, height: 260 }}
      role="img"
      aria-label={`Breathing guide: ${phase}`}
    >
      {/* ── Outermost ripple ring — slowest, most transparent ── */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 240,
          height: 240,
          border: "1px solid rgba(106, 158, 120, 0.22)",
        }}
        animate={{
          scale: isExpanding ? 1.22 : 1,
          opacity: isExpanding ? 0.65 : 0.25,
        }}
        transition={{ duration: 4, ease: "easeInOut" }}
      />

      {/* ── Second ring ── */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 200,
          height: 200,
          border: "1px solid rgba(106, 158, 120, 0.38)",
        }}
        animate={{
          scale: isExpanding ? 1.18 : 1,
          opacity: isExpanding ? 0.72 : 0.35,
        }}
        transition={{ duration: 4, ease: "easeInOut", delay: 0.08 }}
      />

      {/* ── Third ring ── */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 165,
          height: 165,
          border: "1.5px solid rgba(106, 158, 120, 0.5)",
        }}
        animate={{
          scale: isExpanding ? 1.15 : 1,
          opacity: isExpanding ? 0.8 : 0.45,
        }}
        transition={{ duration: 4, ease: "easeInOut", delay: 0.15 }}
      />

      {/* ── Core breathing circle — fills/shrinks with the breath ── */}
      <motion.div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          width: 120,
          height: 120,
          background:
            "radial-gradient(circle at 40% 38%, rgba(210, 235, 218, 0.95) 0%, rgba(140, 188, 158, 0.75) 100%)",
        }}
        animate={{
          scale: isExpanding ? 1.25 : 1,
          boxShadow: isExpanding
            ? "0 0 40px rgba(106, 158, 120, 0.45), 0 0 80px rgba(106, 158, 120, 0.20)"
            : "0 0 15px rgba(106, 158, 120, 0.20)",
        }}
        transition={{ duration: 4, ease: "easeInOut", delay: 0.18 }}
      >
        {/* Phase label — fades between "inhale" and "exhale" */}
        <AnimatePresence mode="wait">
          <motion.span
            key={phase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display italic text-[#2C4840] select-none"
            style={{ fontSize: "0.85rem", letterSpacing: "0.12em" }}
          >
            {phase}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
