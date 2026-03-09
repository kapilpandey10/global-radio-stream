

# Plan: PWA + Audio Visualizer + Station Sharing

## 1. PWA (Progressive Web App) — Install as App

**What:** Create a `public/manifest.json` web app manifest and register a service worker so users can install Mero Radio as a standalone app on Android and iOS.

**Changes:**
- Create `public/manifest.json` with app name, icons (reuse favicon.ico and apple-touch-icon.png at multiple sizes), theme color (#7c3aed), display: "standalone", start_url, background_color
- Add `<link rel="manifest" href="/manifest.json">` to `index.html`
- Create a minimal `public/sw.js` service worker for offline caching of the app shell
- Register the service worker in `src/main.tsx`

---

## 2. Audio Visualizer

**What:** Add an animated audio frequency visualizer using the Web Audio API's `AnalyserNode`. Display colorful bars that react to the music in the NowPlaying screen.

**Changes:**
- Create `src/components/AudioVisualizer.tsx` — a canvas-based component that:
  - Accepts an `AudioContext` + `AnalyserNode` (or audio element ref)
  - Draws frequency bars with a gradient matching the primary purple theme
  - Animates via `requestAnimationFrame`
- Update `PlayerContext.tsx`:
  - Create and expose an `AudioContext` and `AnalyserNode`
  - Connect the audio source (from both IcecastMetadataPlayer and fallback HTMLAudioElement) to the analyser node
  - Expose `analyserNode` via context
- Update `NowPlaying.tsx`:
  - Add the `AudioVisualizer` component behind or around the station artwork
  - Show it only when playing

**Note:** Web Audio API has CORS restrictions. If the stream doesn't support CORS headers, the visualizer will gracefully fall back to the existing animated bars.

---

## 3. Station Sharing

**What:** Add a share button on both StationCard and NowPlaying that uses the Web Share API (with clipboard fallback) to share the currently playing station.

**Changes:**
- Create `src/utils/share.ts` — a helper function that:
  - Uses `navigator.share()` if available (mobile)
  - Falls back to copying a shareable URL to clipboard with a toast notification
  - Generates a share text like "I'm listening to Radio Kantipur on Mero Radio! 🎵"
  - Links to `https://radio.pandeykapil.com.np/search?q=<station_name>`
- Update `NowPlaying.tsx`: Add a Share button (lucide `Share2` icon) next to the favorite button
- Update `StationCard.tsx`: Add a share button in the action buttons area
- Show a sonner toast on successful copy

---

## Summary of files to create/edit

| Action | File |
|--------|------|
| Create | `public/manifest.json` |
| Create | `public/sw.js` |
| Create | `src/components/AudioVisualizer.tsx` |
| Create | `src/utils/share.ts` |
| Edit   | `index.html` — add manifest link |
| Edit   | `src/main.tsx` — register service worker |
| Edit   | `src/contexts/PlayerContext.tsx` — expose analyser node |
| Edit   | `src/components/NowPlaying.tsx` — add visualizer + share button |
| Edit   | `src/components/StationCard.tsx` — add share button |

