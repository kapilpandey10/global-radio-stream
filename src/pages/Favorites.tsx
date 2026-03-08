import { usePlayer } from "@/contexts/PlayerContext";
import { StationCard } from "@/components/StationCard";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

const Favorites = () => {
  const { favorites } = usePlayer();

  return (
    <div className="px-4 pt-6 space-y-4 max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-2xl flex items-center gap-2">
        <Heart size={24} className="text-accent" /> Favorites
      </h1>

      {favorites.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-muted-foreground">
          <Heart size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm">No favorites yet</p>
          <p className="text-xs mt-1">Tap the heart icon on any station to save it</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {favorites.map(s => (
            <StationCard key={s.stationuuid} station={s} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
