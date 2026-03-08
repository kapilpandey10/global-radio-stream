import { usePlayer } from "@/contexts/PlayerContext";
import { StationLogo } from "./StationLogo";
import { Play, Pause, Loader2, ChevronDown, Heart, Volume2, Globe, Radio, Music } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const NowPlaying = () => {
  const { currentStation, isPlaying, isLoading, pause, resume, volume, setVolume, showNowPlaying, toggleNowPlaying, toggleFavorite, isFavorite } = usePlayer();

  if (!currentStation || !showNowPlaying) return null;

  const tags = currentStation.tags?.split(",").filter(Boolean).slice(0, 4);
  const fav = isFavorite(currentStation.stationuuid);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-0 z-50 bg-background flex flex-col"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full gradient-bg opacity-10 blur-[120px]" />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between p-4 pt-6">
          <button onClick={toggleNowPlaying} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ChevronDown size={24} className="text-foreground" />
          </button>
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Now Playing</span>
          <button
            onClick={() => toggleFavorite(currentStation)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Heart size={20} className={cn(fav ? "fill-accent text-accent" : "text-muted-foreground")} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8 relative">
          {/* Station Logo */}
          <motion.div
            animate={isPlaying ? { scale: [1, 1.02, 1] } : { scale: 1 }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <StationLogo
              src={currentStation.favicon}
              name={currentStation.name}
              size="xl"
              pulse={isPlaying}
              className="shadow-2xl"
            />
          </motion.div>

          {/* Station Info */}
          <div className="text-center space-y-2 max-w-sm">
            <h2 className="text-2xl font-display font-bold text-foreground">{currentStation.name}</h2>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
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
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {tags.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-full bg-secondary text-xs text-muted-foreground">{t.trim()}</span>
                ))}
              </div>
            )}
          </div>

          {/* Play Controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => isPlaying ? pause() : resume()}
              className={cn(
                "p-5 rounded-full transition-all shadow-lg",
                "gradient-bg text-primary-foreground",
                isPlaying && "animate-pulse-glow"
              )}
            >
              {isLoading ? <Loader2 size={32} className="animate-spin" /> :
               isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3 w-full max-w-xs">
            <Volume2 size={16} className="text-muted-foreground shrink-0" />
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={([v]) => setVolume(v / 100)}
              className="flex-1"
            />
          </div>
        </div>

        {/* Station Details */}
        <div className="relative p-6 space-y-3">
          <div className="glass rounded-xl p-4 space-y-2">
            {currentStation.codec && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Music size={14} /> <span>{currentStation.codec} {currentStation.bitrate > 0 && `• ${currentStation.bitrate} kbps`}</span>
              </div>
            )}
            {currentStation.language && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe size={14} /> <span>{currentStation.language}</span>
              </div>
            )}
            {currentStation.homepage && (
              <div className="flex items-center gap-2 text-sm">
                <Radio size={14} className="text-muted-foreground" />
                <a href={currentStation.homepage} target="_blank" rel="noopener noreferrer" className="text-primary truncate hover:underline">
                  Visit Website
                </a>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
