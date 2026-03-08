import { usePlayer } from "@/contexts/PlayerContext";
import { StationLogo } from "./StationLogo";
import { Play, Pause, Loader2, ChevronDown, Heart, Volume2, Globe, Radio, Music, Forward, Rewind } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const NowPlaying = () => {
  const {
    currentStation, isPlaying, isLoading, pause, resume, volume, setVolume,
    showNowPlaying, toggleNowPlaying, toggleFavorite, isFavorite, recentlyPlayed, play,
  } = usePlayer();

  if (!currentStation || !showNowPlaying) return null;
  const fav = isFavorite(currentStation.stationuuid);

  // Find next/prev in recently played
  const currentIdx = recentlyPlayed.findIndex(s => s.stationuuid === currentStation.stationuuid);
  const prevStation = currentIdx < recentlyPlayed.length - 1 ? recentlyPlayed[currentIdx + 1] : null;
  const nextStation = currentIdx > 0 ? recentlyPlayed[currentIdx - 1] : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 35, stiffness: 300 }}
        className="fixed inset-0 z-50 bg-background flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-2">
          <button onClick={toggleNowPlaying} className="p-1 active:scale-90 transition-transform">
            <ChevronDown size={28} className="text-muted-foreground" />
          </button>
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Now Playing
          </span>
          <button onClick={() => toggleFavorite(currentStation)} className="p-1 active:scale-90 transition-transform">
            <Heart size={22} className={cn(fav ? "fill-primary text-primary" : "text-muted-foreground")} />
          </button>
        </div>

        {/* Artwork */}
        <div className="flex-1 flex flex-col items-center justify-center px-10 gap-10">
          <motion.div
            animate={isPlaying ? { scale: [1, 1.015, 1] } : { scale: 0.95 }}
            transition={isPlaying ? { repeat: Infinity, duration: 4, ease: "easeInOut" } : { duration: 0.4 }}
            className="w-full max-w-[280px] aspect-square"
          >
            <StationLogo
              src={currentStation.favicon}
              name={currentStation.name}
              size="xl"
              playing={isPlaying}
              className="w-full h-full rounded-3xl shadow-2xl"
            />
          </motion.div>

          {/* Info */}
          <div className="text-center w-full max-w-sm space-y-1">
            <h2 className="text-xl font-semibold text-foreground truncate">{currentStation.name}</h2>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              {currentStation.countrycode && (
                <img
                  src={`https://flagcdn.com/20x15/${currentStation.countrycode.toLowerCase()}.png`}
                  alt={currentStation.country}
                  className="h-3.5 rounded-[2px]"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
              <span>{currentStation.country}</span>
              {currentStation.bitrate > 0 && <span>· {currentStation.bitrate} kbps</span>}
            </div>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => prevStation && play(prevStation)}
              disabled={!prevStation}
              className="p-2 active:scale-90 transition-transform disabled:opacity-20"
            >
              <Rewind size={28} className="text-foreground" fill="currentColor" />
            </button>
            <button
              onClick={() => isPlaying ? pause() : resume()}
              className="p-4 rounded-full bg-foreground active:scale-90 transition-transform"
            >
              {isLoading ? (
                <Loader2 size={30} className="animate-spin text-background" />
              ) : isPlaying ? (
                <Pause size={30} className="text-background" fill="currentColor" />
              ) : (
                <Play size={30} className="text-background" fill="currentColor" />
              )}
            </button>
            <button
              onClick={() => nextStation && play(nextStation)}
              disabled={!nextStation}
              className="p-2 active:scale-90 transition-transform disabled:opacity-20"
            >
              <Forward size={28} className="text-foreground" fill="currentColor" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 w-full max-w-xs">
            <Volume2 size={14} className="text-muted-foreground shrink-0" />
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={([v]) => setVolume(v / 100)}
              className="flex-1"
            />
          </div>
        </div>

        {/* Station Details Footer */}
        <div className="px-6 pb-10 space-y-1.5">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            {currentStation.codec && (
              <span className="flex items-center gap-1"><Music size={12} /> {currentStation.codec}</span>
            )}
            {currentStation.language && (
              <span className="flex items-center gap-1"><Globe size={12} /> {currentStation.language}</span>
            )}
            {currentStation.homepage && (
              <a href={currentStation.homepage} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary">
                <Radio size={12} /> Website
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
