# Mindscape

A context-aware meditation app that recommends the right practice for the right moment.

Mindscape understands that a good meditation recommendation isn't one-size-fits-all. Rather than surfacing a generic library, it looks at the full picture of your day — connecting to Google Calendar to understand what's on your plate, learning which meditations you've enjoyed before, asking how you're feeling right now, and factoring in the time of day — then surfaces three targeted sessions that genuinely fit where you are.

## How it works

- **Emotional check-in** — You're asked how you're feeling before anything is recommended. Calm, stressed, overwhelmed, hopeful, or tired each unlock a different set of practices.
- **Time-of-day awareness** — The app knows whether it's morning, afternoon, evening, or night and adjusts both the visual atmosphere and the recommended sessions accordingly.
- **Context from your calendar** *(coming soon)* — By connecting Google Calendar, Mindscape can see what kind of day you've had or what's coming up and factor that into its suggestions.
- **Personal history** *(coming soon)* — The more you use it, the more it learns which styles of meditation resonate with you and prioritises those.

## Tech stack

- [Next.js 14](https://nextjs.org/) — App Router, server components, API routes
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) — screen transitions and animations
- [YouTube Data API v3](https://developers.google.com/youtube/v3) — fetches real meditation videos matched to each recommendation

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/jadiha/mindscape.git
cd mindscape
npm install
```

### 2. Add your YouTube API key

```bash
cp .env.local.example .env.local
```

Open `.env.local` and replace `your_api_key_here` with a YouTube Data API v3 key.
Get one free at [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → YouTube Data API v3 → Credentials.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  page.tsx              # Root screen state machine
  api/meditations/      # YouTube API route (server-side, key never exposed)
components/
  LandingPage.tsx
  FeelingCheckIn.tsx
  RecommendationScreen.tsx
  MeditationScreen.tsx
  BreathingCircle.tsx
data/
  meditations.ts        # Curated meditation library with per-card YouTube queries
hooks/
  useTimeOfDay.ts       # Resolves current period + gradient + greeting
lib/
  youtube.ts            # Query builder + YouTube response types
```
