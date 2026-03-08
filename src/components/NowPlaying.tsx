import { usePlayer } from "@/contexts/PlayerContext";
import { StationLogo } from "./StationLogo";
import { Play, Pause, Loader2, ChevronDown, Heart, SkipBack, SkipForward, Info, Share2, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VolumeSlider } from "./VolumeSlider";

export const NowPlaying = () => {
  const {
    currentStation, isPlaying, isLoading, pause, resume, volume, setVolume,
    showNowPlaying, toggleNowPlaying, toggleFavorite, isFavorite, recentlyPlayed, play, settings,
  } = usePlayer();
  
  const [showStationInfo, setShowStationInfo] = useState(false);

  if (!currentStation || !showNowPlaying) return null;
  const fav = isFavorite(currentStation.stationuuid);

  // Find next/prev in recently played
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
        className="fixed inset-0 z-50 bg-gradient-to-b from-primary/5 via-background to-background flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-2">
          <button onClick={toggleNowPlaying} className="p-2 -ml-2 active:scale-90 transition-transform rounded-full hover:bg-muted">
            <ChevronDown size={28} className="text-foreground" />
          </button>
          <div className="flex items-center gap-1 text-primary">
            <Radio size={14} className="animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em]">
              Live
            </span>
          </div>
          <button onClick={handleShare} className="p-2 -mr-2 active:scale-90 transition-transform rounded-full hover:bg-muted">
            <Share2 size={22} className="text-foreground" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          {/* Artwork with glow */}
          <div className="relative">
            <motion.div
              animate={isPlaying ? { scale: [1, 1.02, 1] } : { scale: 0.95 }}
              transition={isPlaying ? { repeat: Infinity, duration: 3, ease: "easeInOut" } : { duration: 0.4 }}
              className="w-[280px] h-[280px] relative"
            >
              {/* Background glow */}
              {isPlaying && (
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl scale-110 animate-pulse" />
              )}
              <StationLogo
                src={currentStation.favicon}
                name={currentStation.name}
                frequency={currentStation.bitrate > 0 ? `${currentStation.bitrate} kHz` : "Live"}
                size="xl"
                playing={isPlaying}
                className="w-full h-full rounded-3xl shadow-2xl relative z-10"
              />
            </motion.div>
          </div>

          {/* Currently Playing Info */}
          <div className="w-full max-w-sm space-y-3 text-center">
            {/* Now Playing Label */}
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={isPlaying ? { scaleY: [0.3, 1, 0.3] } : { scaleY: 0.3 }}
                    transition={isPlaying ? { repeat: Infinity, duration: 0.5, delay: i * 0.1 } : {}}
                    className="w-1 h-4 bg-primary rounded-full origin-bottom"
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Currently Playing
              </span>
            </div>
            
            {/* Station Name - Clickable */}
            <button 
              onClick={() => setShowStationInfo(true)}
              className="w-full active:opacity-70 transition-opacity group"
            >
              <h2 className="text-2xl font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {currentStation.name}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1 text-muted-foreground">
                {currentStation.countrycode && (
                  <img
                    src={`https://flagcdn.com/24x18/${currentStation.countrycode.toLowerCase()}.png`}
                    alt={currentStation.country}
                    className="h-4 rounded-[2px]"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
                <span className="text-sm">{currentStation.country}</span>
                <Info size={14} className="text-muted-foreground/60" />
              </div>
            </button>
          </div>

          {/* Progress-like bar (visual only for live radio) */}
          <div className="w-full max-w-sm">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                animate={isPlaying ? { x: ["-100%", "100%"] } : {}}
                transition={isPlaying ? { repeat: Infinity, duration: 2, ease: "linear" } : {}}
                className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Live Stream</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                LIVE
              </span>
            </div>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center gap-6 mt-2">
            <button
              onClick={() => prevStation && play(prevStation)}
              disabled={!prevStation}
              className="p-4 active:scale-90 transition-all disabled:opacity-20 rounded-full hover:bg-muted flex flex-col items-center"
            >
              <SkipBack size={28} className="text-foreground" fill="currentColor" />
              <span className="text-[10px] text-muted-foreground mt-1">{settings.skipBackward}s</span>
            </button>
            
            <button
              onClick={() => isPlaying ? pause() : resume()}
              className="p-6 rounded-full bg-primary active:scale-90 transition-transform shadow-xl shadow-primary/30"
            >
              {isLoading ? (
                <Loader2 size={40} className="animate-spin text-primary-foreground" />
              ) : isPlaying ? (
                <Pause size={40} className="text-primary-foreground" fill="currentColor" />
              ) : (
                <Play size={40} className="text-primary-foreground ml-1" fill="currentColor" />
              )}
            </button>
            
            <button
              onClick={() => nextStation && play(nextStation)}
              disabled={!nextStation}
              className="p-4 active:scale-90 transition-all disabled:opacity-20 rounded-full hover:bg-muted flex flex-col items-center"
            >
              <SkipForward size={28} className="text-foreground" fill="currentColor" />
              <span className="text-[10px] text-muted-foreground mt-1">{settings.skipForward}s</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-6 mt-2">
            <button
              onClick={() => toggleFavorite(currentStation)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                fav ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Heart size={24} className={fav ? "fill-current" : ""} />
              <span className="text-[10px] font-medium">{fav ? "Saved" : "Save"}</span>
            </button>
          </div>

          {/* Volume Slider */}
          <VolumeSlider value={volume} onChange={setVolume} className="mt-2" />
        </div>

        <div className="h-10" />

        {/* Station Details Dialog */}
        <Dialog open={showStationInfo} onOpenChange={setShowStationInfo}>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <StationLogo
                  src={currentStation.favicon}
                  name={currentStation.name}
                  size="sm"
                  className="rounded-lg"
                />
                <span className="truncate">{currentStation.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <InfoRow label="Country" value={currentStation.country} />
              {currentStation.state && <InfoRow label="State" value={currentStation.state} />}
              {currentStation.language && <InfoRow label="Language" value={currentStation.language} />}
              {currentStation.codec && <InfoRow label="Codec" value={currentStation.codec} />}
              {currentStation.bitrate > 0 && <InfoRow label="Bitrate" value={`${currentStation.bitrate} kbps`} />}
              {currentStation.tags && <InfoRow label="Tags" value={currentStation.tags.split(",").slice(0, 5).join(", ")} />}
              {currentStation.votes > 0 && <InfoRow label="Votes" value={currentStation.votes.toLocaleString()} />}
              {currentStation.homepage && (
                <a 
                  href={currentStation.homepage} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full py-3 text-center bg-primary text-primary-foreground rounded-xl font-medium active:scale-95 transition-transform"
                >
                  Visit Website
                </a>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-start gap-4">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm text-foreground text-right font-medium">{value}</span>
  </div>
);
