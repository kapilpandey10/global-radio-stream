import { usePlayer } from "@/contexts/PlayerContext";
import { StationLogo } from "./StationLogo";
import { SEO } from "./SEO";
import { Play, Pause, Loader2, ChevronDown, Heart, Share2, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { StationInfoDialog } from "./StationInfoDialog";
import { AudioVisualizer } from "./AudioVisualizer";
import { shareStation } from "@/utils/share";
import { VolumeSlider } from "./VolumeSlider";

const SkipIcon = ({ seconds, direction }: { seconds: number; direction: "back" | "forward" }) => (
  <div className="relative flex items-center justify-center w-8 h-8">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-foreground/80">
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
    <span className="absolute text-[8px] font-bold text-foreground/80" style={{ marginTop: '2px' }}>
      {seconds}
    </span>
  </div>
);

export const NowPlaying = () => {
  const {
    currentStation, isPlaying, isLoading, pause, resume, stop, volume, setVolume,
    showNowPlaying, toggleNowPlaying, toggleFavorite, isFavorite, recentlyPlayed, play, settings, nowPlayingInfo,
    skipBack, skipForward, analyserNode,
  } = usePlayer();
  
  const [showStationInfo, setShowStationInfo] = useState(false);

  if (!currentStation || !showNowPlaying) return null;
  const fav = isFavorite(currentStation.stationuuid);

  const currentIdx = recentlyPlayed.findIndex(s => s.stationuuid === currentStation.stationuuid);
  const prevStation = currentIdx < recentlyPlayed.length - 1 ? recentlyPlayed[currentIdx + 1] : null;
  const nextStation = currentIdx > 0 ? recentlyPlayed[currentIdx - 1] : null;

  return (
    <AnimatePresence>
      <SEO station={currentStation} path={`/station/${currentStation.stationuuid}`} />
      <motion.div
        key="now-playing"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
        className="fixed inset-0 z-50 flex flex-col bg-background overflow-hidden"
      >
        {/* Subtle ambient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-background" />

        {/* Top bar — minimal */}
        <div className="relative flex items-center justify-between px-6 pt-14 pb-4 shrink-0">
          <button 
            onClick={toggleNowPlaying} 
            className="p-1.5 -ml-1.5 rounded-full active:scale-90 transition-transform"
          >
            <ChevronDown size={26} className="text-muted-foreground" />
          </button>
          <div className="flex items-center gap-1.5">
            {isLoading ? (
              <>
                <Loader2 size={10} className="animate-spin text-primary" />
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Buffering
                </span>
              </>
            ) : isPlaying ? (
              <>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Live
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Paused
                </span>
              </>
            )}
          </div>
          <button 
            onClick={() => setShowStationInfo(true)}
            className="p-1.5 -mr-1.5 rounded-full active:scale-90 transition-transform"
          >
            <Radio size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Main content — scrollable */}
        <div className="relative flex-1 overflow-y-auto overflow-x-hidden -webkit-overflow-scrolling-touch" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex flex-col items-center px-8 py-2" style={{ minHeight: 'min-content' }}>
            
            {/* Top section: Artwork + Info */}
            <div className="flex flex-col items-center w-full max-w-sm gap-6 flex-1 justify-center">
              {/* Artwork */}
              <motion.div
                animate={isPlaying ? { scale: 1 } : { scale: 0.88 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative w-full aspect-square max-w-[280px] sm:max-w-[320px]"
              >
                {isPlaying && (
                  <motion.div 
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="absolute -inset-6 bg-primary/15 rounded-[2.5rem] blur-3xl" 
                  />
                )}
                <StationLogo
                  src={currentStation.favicon}
                  name={currentStation.name}
                  frequency={currentStation.bitrate > 0 ? `${currentStation.bitrate} kbps` : "Live"}
                  size="xl"
                  playing={isPlaying}
                  className="w-full h-full rounded-3xl shadow-2xl shadow-black/20 relative z-10"
                />
              </motion.div>

              {/* Station info */}
              <div className="w-full text-center space-y-1">
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1 min-w-0 text-left">
                    <button 
                      onClick={() => setShowStationInfo(true)}
                      className="w-full active:opacity-70 transition-opacity text-left"
                    >
                      <h2 className="text-xl font-bold text-foreground truncate leading-tight">
                        {currentStation.name}
                      </h2>
                    </button>
                    
                    {/* Now playing info or country */}
                    <AnimatePresence mode="wait">
                      {nowPlayingInfo ? (
                        <motion.p
                          key={nowPlayingInfo}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-sm text-primary font-medium truncate mt-0.5"
                        >
                          {nowPlayingInfo}
                        </motion.p>
                      ) : (
                        <motion.div
                          key="country"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-1.5 mt-0.5"
                        >
                          {currentStation.countrycode && (
                            <img
                              src={`https://flagcdn.com/16x12/${currentStation.countrycode.toLowerCase()}.png`}
                              alt={currentStation.country}
                              className="h-3 rounded-[1px]"
                              onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                          )}
                          <span className="text-sm text-muted-foreground">{currentStation.country}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <button
                      onClick={() => toggleFavorite(currentStation)}
                      className="p-2.5 rounded-full active:scale-90 transition-all hover:bg-muted"
                    >
                      <Heart size={22} className={cn(
                        "transition-all",
                        fav ? "fill-primary text-primary" : "text-muted-foreground"
                      )} />
                    </button>
                    <button
                      onClick={() => shareStation(currentStation)}
                      className="p-2.5 rounded-full active:scale-90 transition-all hover:bg-muted"
                    >
                      <Share2 size={20} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom section: Controls */}
            <div className="w-full max-w-sm space-y-6 pb-10 pt-4">
              {/* Audio Visualizer */}
              <AudioVisualizer 
                analyser={analyserNode} 
                isPlaying={isPlaying}
                className="w-full h-16"
              />

              {/* Live progress indicator */}
              <div className="w-full">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    animate={isPlaying ? { x: ["-100%", "100%"] } : {}}
                    transition={isPlaying ? { repeat: Infinity, duration: 3, ease: "linear" } : {}}
                    className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                  />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground/60 font-medium">
                  <span>LIVE</span>
                  <span>{isPlaying ? "Streaming" : "Paused"}</span>
                </div>
              </div>

              {/* Transport controls */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => prevStation && play(prevStation)}
                  disabled={!prevStation}
                  className="p-2 active:scale-90 transition-all disabled:opacity-20"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-foreground"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>

                <button
                  onClick={skipBack}
                  className="p-2 active:scale-90 transition-all"
                >
                  <SkipIcon seconds={settings.skipBackward} direction="back" />
                </button>
                
                <button
                  onClick={() => isPlaying ? pause() : resume()}
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center active:scale-90 transition-all",
                    "bg-foreground shadow-lg"
                  )}
                >
                  {isLoading ? (
                    <Loader2 size={28} className="animate-spin text-background" />
                  ) : isPlaying ? (
                    <Pause size={28} className="text-background" fill="currentColor" />
                  ) : (
                    <Play size={28} className="text-background ml-1" fill="currentColor" />
                  )}
                </button>
                
                <button
                  onClick={skipForward}
                  className="p-2 active:scale-90 transition-all"
                >
                  <SkipIcon seconds={settings.skipForward} direction="forward" />
                </button>

                <button
                  onClick={() => nextStation && play(nextStation)}
                  disabled={!nextStation}
                  className="p-2 active:scale-90 transition-all disabled:opacity-20"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-foreground"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                </button>
              </div>

              {/* Volume — horizontal Apple-style */}
              <VolumeSlider value={volume} onChange={setVolume} />
            </div>
          </div>
        </div>

        <StationInfoDialog
          station={currentStation}
          open={showStationInfo}
          onOpenChange={setShowStationInfo}
        />
      </motion.div>
    </AnimatePresence>
  );
};
