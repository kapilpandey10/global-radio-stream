import { usePlayer } from "@/contexts/PlayerContext";
import { StationLogo } from "./StationLogo";
import { Play, Pause, Loader2, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const MiniPlayer = () => {
  const { currentStation, isPlaying, isLoading, pause, resume, toggleNowPlaying } = usePlayer();

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
          className="rounded-2xl bg-card/98 backdrop-blur-xl border border-border/60 shadow-xl flex items-center gap-3 p-2 cursor-pointer max-w-xl mx-auto"
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
            <div className="flex items-center gap-1.5">
              {isPlaying && (
                <div className="flex gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scaleY: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                      className="w-0.5 h-3 bg-primary rounded-full origin-bottom"
                    />
                  ))}
                </div>
              )}
              <p className="text-sm font-semibold truncate text-foreground">{currentStation.name}</p>
            </div>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <Radio size={10} className={isPlaying ? "text-red-500" : ""} />
              <span className={isPlaying ? "text-red-500 font-medium" : ""}>
                {isPlaying ? "Live" : "Paused"}
              </span>
              <span className="mx-1">·</span>
              {currentStation.country}
            </p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); isPlaying ? pause() : resume(); }}
            className="p-3 rounded-full bg-primary active:scale-90 transition-transform shadow-lg shadow-primary/20"
          >
            {isLoading ? <Loader2 size={22} className="animate-spin text-primary-foreground" /> :
             isPlaying ? <Pause size={22} className="text-primary-foreground" fill="currentColor" /> :
             <Play size={22} className="text-primary-foreground ml-0.5" fill="currentColor" />}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
