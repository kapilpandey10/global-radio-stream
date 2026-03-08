import { usePlayer } from "@/contexts/PlayerContext";
import { StationLogo } from "./StationLogo";
import { Play, Pause, Loader2, ChevronDown, Heart, SkipBack, SkipForward, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VolumeSlider } from "./VolumeSlider";

export const NowPlaying = () => {
  const {
    currentStation, isPlaying, isLoading, pause, resume, volume, setVolume,
    showNowPlaying, toggleNowPlaying, toggleFavorite, isFavorite, recentlyPlayed, play,
  } = usePlayer();
  
  const [showStationInfo, setShowStationInfo] = useState(false);

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
        className="fixed inset-0 z-50 bg-gradient-to-b from-primary/10 via-background to-background flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-2">
          <button onClick={toggleNowPlaying} className="p-2 -ml-2 active:scale-90 transition-transform rounded-full hover:bg-muted">
            <ChevronDown size={28} className="text-foreground" />
          </button>
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Now Playing
          </span>
          <button onClick={() => toggleFavorite(currentStation)} className="p-2 -mr-2 active:scale-90 transition-transform rounded-full hover:bg-muted">
            <Heart size={24} className={cn(fav ? "fill-primary text-primary" : "text-foreground")} />
          </button>
        </div>

        {/* Artwork */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
          <motion.div
            animate={isPlaying ? { scale: [1, 1.02, 1] } : { scale: 0.95 }}
            transition={isPlaying ? { repeat: Infinity, duration: 3, ease: "easeInOut" } : { duration: 0.4 }}
            className="w-full max-w-[300px] aspect-square"
          >
            <StationLogo
              src={currentStation.favicon}
              name={currentStation.name}
              frequency={currentStation.bitrate > 0 ? `${currentStation.bitrate} kHz` : "Live"}
              size="xl"
              playing={isPlaying}
              className="w-full h-full rounded-3xl shadow-2xl shadow-primary/20"
            />
          </motion.div>

          {/* Station Info - Clickable for details */}
          <button 
            onClick={() => setShowStationInfo(true)}
            className="text-center w-full max-w-sm space-y-2 active:opacity-70 transition-opacity"
          >
            <h2 className="text-2xl font-bold text-foreground truncate flex items-center justify-center gap-2">
              {currentStation.name}
              <Info size={16} className="text-muted-foreground" />
            </h2>
            <div className="flex items-center justify-center gap-2 text-base text-muted-foreground">
              {currentStation.countrycode && (
                <img
                  src={`https://flagcdn.com/24x18/${currentStation.countrycode.toLowerCase()}.png`}
                  alt={currentStation.country}
                  className="h-4 rounded-[2px]"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
              <span>{currentStation.country}</span>
            </div>
            {/* Now Playing Track Info */}
            <p className="text-sm text-primary animate-pulse">
              🎵 Live Radio Stream
            </p>
          </button>

          {/* Transport Controls */}
          <div className="flex items-center gap-10">
            <button
              onClick={() => prevStation && play(prevStation)}
              disabled={!prevStation}
              className="p-3 active:scale-90 transition-all disabled:opacity-20 rounded-full hover:bg-muted"
            >
              <SkipBack size={32} className="text-foreground" fill="currentColor" />
            </button>
            <button
              onClick={() => isPlaying ? pause() : resume()}
              className="p-5 rounded-full bg-primary active:scale-90 transition-transform shadow-lg shadow-primary/30"
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
              <SkipForward size={32} className="text-foreground" fill="currentColor" />
            </button>
          </div>

          {/* Volume Slider */}
          <VolumeSlider value={volume} onChange={setVolume} />
        </div>

        <div className="h-16" />

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
