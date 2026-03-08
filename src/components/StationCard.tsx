import { RadioStation } from "@/types/radio";
import { StationLogo } from "./StationLogo";
import { usePlayer } from "@/contexts/PlayerContext";
import { Heart, Play, Pause, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StationCardProps {
  station: RadioStation;
  compact?: boolean;
}

export const StationCard = ({ station, compact }: StationCardProps) => {
  const { currentStation, isPlaying, isLoading, play, pause, resume, toggleFavorite, isFavorite } = usePlayer();
  const isActive = currentStation?.stationuuid === station.stationuuid;
  const fav = isFavorite(station.stationuuid);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive && isPlaying) pause();
    else if (isActive) resume();
    else play(station);
  };

  const handleCardClick = () => {
    if (isActive && isPlaying) pause();
    else if (isActive) resume();
    else play(station);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className={cn(
        "group relative flex items-center gap-3 py-3 px-1 cursor-pointer transition-all",
        "border-b border-border/50 last:border-b-0",
        isActive && "bg-primary/[0.03]",
        compact ? "gap-2 py-2" : "",
      )}
    >
      <StationLogo
        src={station.favicon}
        name={station.name}
        size={compact ? "sm" : "sm"}
        playing={isActive && isPlaying}
      />

      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium truncate",
          isActive ? "text-primary" : "text-foreground",
          compact ? "text-sm" : "text-[15px]",
        )}>
          {station.name}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
          {station.countrycode && (
            <img
              src={`https://flagcdn.com/16x12/${station.countrycode.toLowerCase()}.png`}
              alt={station.country}
              className="h-3 rounded-[1px]"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          <span className="truncate">{station.country}</span>
          {station.bitrate > 0 && <span className="text-muted-foreground/60">· {station.bitrate}k</span>}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(station); }}
          className="p-2 rounded-full transition-colors active:scale-90"
        >
          <Heart size={16} className={cn(
            "transition-colors",
            fav ? "fill-primary text-primary" : "text-muted-foreground/40"
          )} />
        </button>
        <button onClick={handlePlay} className="p-2 rounded-full transition-all active:scale-90">
          {isActive && isLoading ? (
            <Loader2 size={18} className="animate-spin text-primary" />
          ) : isActive && isPlaying ? (
            <Pause size={18} className="text-primary" />
          ) : (
            <Play size={18} className="text-muted-foreground" />
          )}
        </button>
      </div>
    </motion.div>
  );
};
