import { usePlayer } from "@/contexts/PlayerContext";
import { StationLogo } from "./StationLogo";
import { Play, Pause, Loader2, ChevronUp } from "lucide-react";
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
        className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 px-2 pb-1 md:px-4 md:pb-2"
      >
        <div
          className="glass rounded-2xl p-2.5 flex items-center gap-3 shadow-lg cursor-pointer max-w-2xl mx-auto"
          onClick={toggleNowPlaying}
        >
          <StationLogo src={currentStation.favicon} name={currentStation.name} size="sm" pulse={isPlaying} />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">{currentStation.name}</p>
            <p className="text-xs text-muted-foreground truncate">{currentStation.country}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); isPlaying ? pause() : resume(); }}
              className={cn("p-2.5 rounded-full transition-all", isPlaying ? "gradient-bg text-primary-foreground" : "bg-primary/10 text-primary")}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> :
               isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <ChevronUp size={18} className="text-muted-foreground" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
