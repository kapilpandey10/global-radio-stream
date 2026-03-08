import { useTopStations, useTrendingStations } from "@/hooks/useRadioAPI";
import { StationCard } from "@/components/StationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Radio, TrendingUp, Star, Globe, Search } from "lucide-react";

const genres = ["pop", "rock", "jazz", "classical", "news", "electronic", "hip hop", "country", "latin", "ambient"];

const Index = () => {
  const { data: topStations, isLoading: loadingTop } = useTopStations(15);
  const { data: trending, isLoading: loadingTrending } = useTrendingStations(15);
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-6 space-y-8 max-w-2xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3 py-6"
      >
        <div className="mx-auto w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-lg mb-4">
          <Radio size={32} className="text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-display font-bold gradient-text">World Radio</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Discover and stream 30,000+ radio stations from around the globe
        </p>
        <button
          onClick={() => navigate("/search")}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Search size={16} /> Search stations...
        </button>
      </motion.div>

      {/* Browse by Genre */}
      <section>
        <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
          <Star size={18} className="text-primary" /> Browse by Genre
        </h2>
        <div className="flex flex-wrap gap-2">
          {genres.map(g => (
            <button
              key={g}
              onClick={() => navigate(`/search?tag=${g}`)}
              className="px-3.5 py-2 rounded-full glass text-sm capitalize hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {g}
            </button>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/countries")}
          className="glass rounded-xl p-4 text-left hover:bg-muted/60 transition-colors"
        >
          <Globe size={24} className="text-primary mb-2" />
          <p className="font-display font-semibold text-sm">Countries</p>
          <p className="text-xs text-muted-foreground">Browse by region</p>
        </button>
        <button
          onClick={() => navigate("/favorites")}
          className="glass rounded-xl p-4 text-left hover:bg-muted/60 transition-colors"
        >
          <Star size={24} className="text-accent mb-2" />
          <p className="font-display font-semibold text-sm">Favorites</p>
          <p className="text-xs text-muted-foreground">Your saved stations</p>
        </button>
      </div>

      {/* Top Stations */}
      <section>
        <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-primary" /> Top Voted
        </h2>
        <div className="space-y-2">
          {loadingTop ? Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-xl" />
          )) : topStations?.map(s => (
            <StationCard key={s.stationuuid} station={s} />
          ))}
        </div>
      </section>

      {/* Trending */}
      <section>
        <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
          <TrendingUp size={18} className="text-accent" /> Trending Now
        </h2>
        <div className="space-y-2">
          {loadingTrending ? Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-xl" />
          )) : trending?.map(s => (
            <StationCard key={s.stationuuid} station={s} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
