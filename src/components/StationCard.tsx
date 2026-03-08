import { RadioStation } from "@/types/radio";
import { StationLogo } from "./StationLogo";
import { usePlayer } from "@/contexts/PlayerContext";
import { Heart, Play, Pause, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StationCardProps {
  station: RadioStation;
  onSelect?: (station: RadioStation) => void;
  compact?: boolean;
}

export const StationCard = ({ station, onSelect, compact }: StationCardProps) => {
  const { currentStation, isPlaying, isLoading, play, pause, resume, toggleFavorite, isFavorite } = usePlayer();
  const isActive = currentStation?.stationuuid === station.stationuuid;
  const fav = isFavorite(station.stationuuid);
  const tags = station.tags?.split(",").filter(Boolean).slice(0, 2);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive && isPlaying) pause();
    else if (isActive) resume();
    else play(station);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect?.(station)}
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
        "glass hover:bg-muted/60",
        isActive && "ring-1 ring-primary/50 bg-primary/5",
        compact ? "gap-2 p-2" : "",
      )}
    >
      <StationLogo src={station.favicon} name={station.name} size={compact ? "sm" : "md"} />

      <div className="flex-1 min-w-0">
        <p className={cn("font-medium truncate text-foreground", compact && "text-sm")}>{station.name}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {station.countrycode && (
            <img
              src={`https://flagcdn.com/16x12/${station.countrycode.toLowerCase()}.png`}
              alt={station.country}
              className="h-3 rounded-[2px]"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          <span className="truncate">{station.country}</span>
          {station.bitrate > 0 && <span>• {station.bitrate}kbps</span>}
        </div>
        {!compact && tags && tags.length > 0 && (
          <div className="flex gap-1 mt-1">
            {tags.map(t => (
              <span key={t} className="px-1.5 py-0.5 rounded-md bg-secondary text-[10px] text-muted-foreground">{t.trim()}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(station); }}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <Heart size={16} className={cn(fav ? "fill-accent text-accent" : "text-muted-foreground")} />
        </button>
        <button
          onClick={handlePlay}
          className={cn(
            "p-2 rounded-full transition-all",
            isActive && isPlaying ? "gradient-bg text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
          )}
        >
          {isActive && isLoading ? <Loader2 size={16} className="animate-spin" /> :
           isActive && isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>
    </motion.div>
  );
};
