import { usePlayer } from "@/contexts/PlayerContext";
import { StationLogo } from "./StationLogo";
import { Play, Pause, Loader2, ChevronDown, Heart, SkipBack, SkipForward, Share2, Radio, Music2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { VolumeSlider } from "./VolumeSlider";
import { StationInfoDialog } from "./StationInfoDialog";

export const NowPlaying = () => {
  const {
    currentStation, isPlaying, isLoading, pause, resume, volume, setVolume,
    showNowPlaying, toggleNowPlaying, toggleFavorite, isFavorite, recentlyPlayed, play, settings, nowPlayingInfo,
  } = usePlayer();
  
  const [showStationInfo, setShowStationInfo] = useState(false);

  if (!currentStation || !showNowPlaying) return null;
  const fav = isFavorite(currentStation.stationuuid);

  const currentIdx = recentlyPlayed.findIndex(s => s.stationuuid === currentStation.stationuuid);
  const prevStation = currentIdx < recentlyPlayed.length - 1 ? recentlyPlayed[currentIdx + 1] : null;
  const nextStation = currentIdx > 0 ? recentlyPlayed[currentIdx - 1] : null;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: currentStation.name,
        text: `Listen to ${currentStation.name} on World Radio`,
        url: currentStation.homepage || window.location.href,
      });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 35, stiffness: 300 }}
        className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      >
        {/* Dynamic background based on playing state */}
        <div className="absolute inset-0 bg-gradient-to-b from-card via-background to-background" />
        {isPlaying && (
          <motion.div 
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-transparent" 
          />
        )}

        {/* Header */}
        <div className="relative flex items-center justify-between px-5 pt-14 pb-2">
          <button onClick={toggleNowPlaying} className="p-2 -ml-2 active:scale-90 transition-transform rounded-full hover:bg-muted">
            <ChevronDown size={28} className="text-foreground" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75",
                isPlaying ? "animate-ping bg-red-500" : "bg-muted-foreground"
              )} />
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                isPlaying ? "bg-red-500" : "bg-muted-foreground"
              )} />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {isPlaying ? "Live" : "Paused"}
            </span>
          </div>
          <button onClick={handleShare} className="p-2 -mr-2 active:scale-90 transition-transform rounded-full hover:bg-muted">
            <Share2 size={22} className="text-foreground" />
          </button>
        </div>

        {/* Main Content */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-8 gap-5 overflow-hidden">
          {/* Artwork */}
          <motion.div
            animate={isPlaying ? { scale: [1, 1.015, 1] } : { scale: 0.92, opacity: 0.8 }}
            transition={isPlaying ? { repeat: Infinity, duration: 4, ease: "easeInOut" } : { duration: 0.5 }}
            className="relative w-[260px] h-[260px] sm:w-[300px] sm:h-[300px]"
          >
            {isPlaying && (
              <div className="absolute -inset-4 bg-primary/15 rounded-[2rem] blur-3xl" />
            )}
            <StationLogo
              src={currentStation.favicon}
              name={currentStation.name}
              frequency={currentStation.bitrate > 0 ? `${currentStation.bitrate} kHz` : "Live"}
              size="xl"
              playing={isPlaying}
              className="w-full h-full rounded-[1.5rem] shadow-2xl relative z-10"
            />
          </motion.div>

          {/* Now Playing Info */}
          <div className="w-full max-w-sm text-center space-y-2">
            {/* Currently Playing Track/Program */}
            {nowPlayingInfo ? (
              <div className="flex items-center justify-center gap-2">
                <Music2 size={14} className="text-primary shrink-0" />
                <motion.p
                  key={nowPlayingInfo}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium text-primary truncate"
                >
                  {nowPlayingInfo}
                </motion.p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                {isPlaying && (
                  <div className="flex gap-[3px] items-end">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scaleY: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.08 }}
                        className="w-[3px] h-3.5 bg-primary rounded-full origin-bottom"
                      />
                    ))}
                  </div>
                )}
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {isPlaying ? "Now Playing" : "Paused"}
                </span>
              </div>
            )}

            {/* Station Name */}
            <button 
              onClick={() => setShowStationInfo(true)}
              className="w-full active:opacity-70 transition-opacity group"
            >
              <h2 className="text-2xl font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {currentStation.name}
              </h2>
            </button>

            {/* Country info */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              {currentStation.countrycode && (
                <img
                  src={`https://flagcdn.com/24x18/${currentStation.countrycode.toLowerCase()}.png`}
                  alt={currentStation.country}
                  className="h-3.5 rounded-[2px]"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
              <span className="text-sm">{currentStation.country}</span>
            </div>

            {/* Favorite */}
            <button
              onClick={() => toggleFavorite(currentStation)}
              className="inline-flex items-center gap-1.5 mx-auto mt-1"
            >
              <Heart size={18} className={cn(
                "transition-all",
                fav ? "fill-primary text-primary scale-110" : "text-muted-foreground"
              )} />
              <span className={cn("text-xs font-medium", fav ? "text-primary" : "text-muted-foreground")}>
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
            <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground/70">
              <span>Live Stream</span>
              <span className="flex items-center gap-1">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isPlaying ? "bg-red-500 animate-pulse" : "bg-muted-foreground"
                )} />
                {isPlaying ? "LIVE" : "OFFLINE"}
              </span>
            </div>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center gap-5 mt-1">
            <button
              onClick={() => prevStation && play(prevStation)}
              disabled={!prevStation}
              className="p-3 active:scale-90 transition-all disabled:opacity-20 rounded-full hover:bg-muted"
            >
              <SkipBack size={26} className="text-foreground" fill="currentColor" />
            </button>
            
            <button
              onClick={() => isPlaying ? pause() : resume()}
              className="p-5 rounded-full bg-primary active:scale-90 transition-transform shadow-xl shadow-primary/25"
            >
              {isLoading ? (
                <Loader2 size={36} className="animate-spin text-primary-foreground" />
              ) : isPlaying ? (
                <Pause size={36} className="text-primary-foreground" fill="currentColor" />
              ) : (
                <Play size={36} className="text-primary-foreground ml-1" fill="currentColor" />
              )}
            </button>
            
            <button
              onClick={() => nextStation && play(nextStation)}
              disabled={!nextStation}
              className="p-3 active:scale-90 transition-all disabled:opacity-20 rounded-full hover:bg-muted"
            >
              <SkipForward size={26} className="text-foreground" fill="currentColor" />
            </button>
          </div>

          {/* Volume */}
          <VolumeSlider value={volume} onChange={setVolume} className="mt-1" />
        </div>

        <div className="h-8" />

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
