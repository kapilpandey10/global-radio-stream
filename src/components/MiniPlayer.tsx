import { usePlayer } from "@/contexts/PlayerContext";
import { StationLogo } from "./StationLogo";
import { Play, Pause, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const MiniPlayer = () => {
  const { currentStation, isPlaying, isLoading, pause, resume, toggleNowPlaying } = usePlayer();

  if (!currentStation) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        className="fixed bottom-[52px] md:bottom-0 left-0 right-0 z-40"
      >
        <div
          className="mx-2 mb-1 rounded-xl bg-card/95 backdrop-blur-xl border border-border/60 shadow-lg flex items-center gap-3 p-2 cursor-pointer max-w-xl md:mx-auto"
          onClick={toggleNowPlaying}
        >
          <StationLogo
            src={currentStation.favicon}
            name={currentStation.name}
            size="xs"
            playing={isPlaying}
            className="rounded-lg"
          />

          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate text-foreground">{currentStation.name}</p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); isPlaying ? pause() : resume(); }}
            className="p-1.5 active:scale-90 transition-transform"
          >
            {isLoading ? <Loader2 size={22} className="animate-spin text-primary" /> :
             isPlaying ? <Pause size={22} className="text-foreground" fill="currentColor" /> :
             <Play size={22} className="text-foreground" fill="currentColor" />}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
