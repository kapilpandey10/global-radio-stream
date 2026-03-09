import { usePlayer } from "@/contexts/PlayerContext";
import { StationLogo } from "./StationLogo";
import { SEO } from "./SEO";
import { Play, Pause, Loader2, ChevronDown, Heart, X, Music2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { VolumeSlider } from "./VolumeSlider";
import { StationInfoDialog } from "./StationInfoDialog";

const SkipIcon = ({ seconds, direction }: { seconds: number; direction: "back" | "forward" }) => (
  <div className="relative flex items-center justify-center w-10 h-10">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-foreground">
      {direction === "back" ? (
        <>
          <path d="M2.5 2v6h6" />
          <path d="M2.5 13a10 10 0 1 0 2.26-6.33L2.5 8" />
        </>
      ) : (
        <>
          <path d="M21.5 2v6h-6" />
          <path d="M21.5 13a10 10 0 1 1-2.26-6.33L21.5 8" />
        </>
      )}
    </svg>
    <span className="absolute text-[9px] font-bold text-foreground" style={{ marginTop: '2px' }}>
      {seconds}
    </span>
  </div>
);

export const NowPlaying = () => {
  const {
    currentStation, isPlaying, isLoading, pause, resume, stop, volume, setVolume,
    showNowPlaying, toggleNowPlaying, toggleFavorite, isFavorite, recentlyPlayed, play, settings, nowPlayingInfo,
    skipBack, skipForward,
  } = usePlayer();
  
  const [showStationInfo, setShowStationInfo] = useState(false);

  if (!currentStation || !showNowPlaying) return null;
  const fav = isFavorite(currentStation.stationuuid);

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
        className="fixed inset-0 z-50 flex flex-col bg-background"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        {isPlaying && (
          <motion.div 
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" 
          />
        )}

        {/* Header */}
        <div className="relative flex items-center justify-between px-5 pt-12 pb-2 shrink-0">
          <button onClick={toggleNowPlaying} className="p-2 -ml-2 active:scale-90 transition-transform rounded-full hover:bg-muted">
            <ChevronDown size={28} className="text-foreground" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75",
                isPlaying ? "animate-ping bg-primary" : "bg-muted-foreground"
              )} />
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                isPlaying ? "bg-primary" : "bg-muted-foreground"
              )} />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {isPlaying ? "Live" : "Paused"}
            </span>
          </div>
          <button onClick={stop} className="p-2 -mr-2 active:scale-90 transition-transform rounded-full hover:bg-destructive/10" title="Close player">
            <X size={22} className="text-foreground" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="relative flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col items-center px-6 py-4 gap-4 min-h-full">
            {/* Artwork */}
            <motion.div
              animate={isPlaying ? { scale: [1, 1.02, 1] } : { scale: 0.92, opacity: 0.7 }}
              transition={isPlaying ? { repeat: Infinity, duration: 4, ease: "easeInOut" } : { duration: 0.5 }}
              className="relative w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] shrink-0"
            >
              {isPlaying && (
                <div className="absolute -inset-4 bg-primary/20 rounded-[2rem] blur-3xl" />
              )}
              <StationLogo
                src={currentStation.favicon}
                name={currentStation.name}
                frequency={currentStation.bitrate > 0 ? `${currentStation.bitrate} kHz` : "Live"}
                size="xl"
                playing={isPlaying}
                className="w-full h-full rounded-[2rem] shadow-2xl relative z-10"
              />
            </motion.div>

            {/* Currently Playing Track */}
            <div className="w-full max-w-sm text-center space-y-2">
              {nowPlayingInfo ? (
                <div className="flex items-center justify-center gap-2 bg-primary/10 rounded-2xl px-4 py-2.5 border border-primary/20">
                  <Music2 size={14} className="text-primary shrink-0" />
                  <motion.p
                    key={nowPlayingInfo}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-semibold text-primary truncate"
                  >
                    {nowPlayingInfo}
                  </motion.p>
                </div>
              ) : isPlaying ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="flex gap-[3px] items-end">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scaleY: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.08 }}
                        className="w-[3px] h-3 bg-primary rounded-full origin-bottom"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">Now Playing</span>
                </div>
              ) : (
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Paused</span>
              )}

              {/* Station Name */}
              <button 
                onClick={() => setShowStationInfo(true)}
                className="w-full active:opacity-70 transition-opacity group"
              >
                <h2 className="text-2xl font-extrabold text-foreground truncate group-hover:text-primary transition-colors">
                  {currentStation.name}
                </h2>
              </button>

              {/* Country */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                {currentStation.countrycode && (
                  <img
                    src={`https://flagcdn.com/24x18/${currentStation.countrycode.toLowerCase()}.png`}
                    alt={currentStation.country}
                    className="h-3.5 rounded-[2px]"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
                <span className="text-sm font-medium">{currentStation.country}</span>
              </div>

              {/* Favorite */}
              <button
                onClick={() => toggleFavorite(currentStation)}
                className="inline-flex items-center gap-1.5 mx-auto"
              >
                <Heart size={16} className={cn(
                  "transition-all",
                  fav ? "fill-primary text-primary scale-110" : "text-muted-foreground"
                )} />
                <span className={cn("text-xs font-semibold", fav ? "text-primary" : "text-muted-foreground")}>
                  {fav ? "Saved" : "Save"}
                </span>
              </button>
            </div>

            {/* Live indicator bar */}
            <div className="w-full max-w-sm">
              <div className="h-[3px] bg-muted rounded-full overflow-hidden">
                <motion.div
                  animate={isPlaying ? { x: ["-100%", "100%"] } : {}}
                  transition={isPlaying ? { repeat: Infinity, duration: 2.5, ease: "linear" } : {}}
                  className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground/70 font-medium">
                <span>Live Stream</span>
                <span className="flex items-center gap-1">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isPlaying ? "bg-primary animate-pulse" : "bg-muted-foreground"
                  )} />
                  {isPlaying ? "LIVE" : "OFFLINE"}
                </span>
              </div>
            </div>

            {/* Transport Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => prevStation && play(prevStation)}
                disabled={!prevStation}
                className="p-2 active:scale-90 transition-all disabled:opacity-20 rounded-full hover:bg-muted"
                title="Previous station"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-foreground"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>

              <button
                onClick={skipBack}
                className="p-2 active:scale-90 transition-all rounded-full hover:bg-muted"
                title={`Skip back ${settings.skipBackward}s`}
              >
                <SkipIcon seconds={settings.skipBackward} direction="back" />
              </button>
              
              {/* Play/Pause */}
              <button
                onClick={() => isPlaying ? pause() : resume()}
                className="p-5 rounded-full gradient-primary active:scale-90 transition-transform shadow-xl shadow-primary/30"
              >
                {isLoading ? (
                  <Loader2 size={32} className="animate-spin text-white" />
                ) : isPlaying ? (
                  <Pause size={32} className="text-white" fill="currentColor" />
                ) : (
                  <Play size={32} className="text-white ml-1" fill="currentColor" />
                )}
              </button>
              
              <button
                onClick={skipForward}
                className="p-2 active:scale-90 transition-all rounded-full hover:bg-muted"
                title={`Skip forward ${settings.skipForward}s`}
              >
                <SkipIcon seconds={settings.skipForward} direction="forward" />
              </button>

              <button
                onClick={() => nextStation && play(nextStation)}
                disabled={!nextStation}
                className="p-2 active:scale-90 transition-all disabled:opacity-20 rounded-full hover:bg-muted"
                title="Next station"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-foreground"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              </button>
            </div>

            {/* Volume */}
            <VolumeSlider value={volume} onChange={setVolume} />

            <div className="h-6 shrink-0" />
          </div>
        </div>

        {/* Station Info Dialog */}
        <StationInfoDialog
          station={currentStation}
          open={showStationInfo}
          onOpenChange={setShowStationInfo}
        />
      </motion.div>
    </AnimatePresence>
  );
};
