import { usePlayer } from "@/contexts/PlayerContext";
import { StationCard } from "@/components/StationCard";
import { SEO } from "@/components/SEO";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

const Favorites = () => {
  const { favorites } = usePlayer();

  return (
    <>
      <SEO 
        title="Your Favorite Radio Stations | Mero Radio"
        description="Access your saved favorite radio stations. Quickly play your most-loved stations from around the world."
        path="/favorites"
      />
      <div className="max-w-2xl mx-auto">
      <div className="px-5 pt-14 pb-2">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Library</h1>
      </div>

      {favorites.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-28">
          <Heart size={40} className="mx-auto mb-3 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">Your favorite stations will appear here</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Tap the heart on any station to add it</p>
        </motion.div>
      ) : (
        <div className="px-4 mt-2">
          <p className="text-sm text-muted-foreground px-1 mb-2">{favorites.length} station{favorites.length !== 1 && 's'}</p>
          {favorites.map(s => (
            <StationCard key={s.stationuuid} station={s} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
