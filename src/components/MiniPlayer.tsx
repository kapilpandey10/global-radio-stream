import { usePlayer } from "@/contexts/PlayerContext";
import { StationLogo } from "./StationLogo";
import { Play, Pause, Loader2, Music2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const MiniPlayer = () => {
  const { currentStation, isPlaying, isLoading, pause, resume, toggleNowPlaying, nowPlayingInfo } = usePlayer();

  if (!currentStation) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        className="fixed bottom-[68px] left-0 right-0 z-40 px-3"
      >
        <div
          className="rounded-2xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-lg flex items-center gap-3 p-2.5 cursor-pointer max-w-xl mx-auto"
          onClick={toggleNowPlaying}
        >
          <StationLogo
            src={currentStation.favicon}
            name={currentStation.name}
            frequency={currentStation.bitrate > 0 ? `${currentStation.bitrate} kHz` : undefined}
            size="xs"
            playing={isPlaying}
            className="rounded-xl"
          />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">{currentStation.name}</p>
            {nowPlayingInfo ? (
              <p className="text-xs text-primary truncate flex items-center gap-1">
                <Music2 size={10} />
                {nowPlayingInfo}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full inline-block",
                  isPlaying ? "bg-red-500" : "bg-muted-foreground"
                )} />
                <span className={isPlaying ? "text-muted-foreground" : ""}>
                  {isPlaying ? "Live" : "Paused"}
                </span>
                <span className="mx-0.5">·</span>
                {currentStation.country}
              </p>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); isPlaying ? pause() : resume(); }}
            className="p-3 rounded-full bg-primary active:scale-90 transition-transform shadow-md shadow-primary/20"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin text-primary-foreground" /> :
             isPlaying ? <Pause size={20} className="text-primary-foreground" fill="currentColor" /> :
             <Play size={20} className="text-primary-foreground ml-0.5" fill="currentColor" />}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
