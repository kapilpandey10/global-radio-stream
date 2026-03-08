import { useTopStations, useTrendingStations, useLocalStations, useUserCountry } from "@/hooks/useRadioAPI";
import { usePlayer } from "@/contexts/PlayerContext";
import { StationCard } from "@/components/StationCard";
import { StationLogo } from "@/components/StationLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, TrendingUp, Star, ChevronRight, Clock } from "lucide-react";

const Index = () => {
  const { data: userCountry } = useUserCountry();
  const { data: localStations, isLoading: loadingLocal } = useLocalStations(userCountry || null);
  const { data: topStations, isLoading: loadingTop } = useTopStations(10);
  const { data: trending, isLoading: loadingTrending } = useTrendingStations(10);
  const { recentlyPlayed, play } = usePlayer();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-5 pt-14 pb-2">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Listen Now</h1>
      </div>

      {/* Recently Played Horizontal Scroll */}
      {recentlyPlayed.length > 0 && (
        <section className="mt-4">
          <div className="flex items-center justify-between px-5 mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <Clock size={18} className="text-primary" /> Recently Played
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-2">
            {recentlyPlayed.slice(0, 10).map(s => (
              <motion.button
                key={s.stationuuid}
                whileTap={{ scale: 0.95 }}
                onClick={() => play(s)}
                className="flex flex-col items-center gap-2 min-w-[80px] max-w-[80px]"
              >
                <StationLogo src={s.favicon} name={s.name} size="md" className="rounded-xl" />
                <span className="text-[11px] text-muted-foreground text-center leading-tight line-clamp-2 w-full">
                  {s.name}
                </span>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* Local Stations */}
      {userCountry && (
        <section className="mt-6">
          <div className="flex items-center justify-between px-5 mb-1">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <MapPin size={18} className="text-primary" /> Near You
            </h2>
            <button
              onClick={() => navigate(`/countries/${userCountry}`)}
              className="text-primary text-sm font-medium flex items-center active:opacity-60"
            >
              See All <ChevronRight size={16} />
            </button>
          </div>
          <div className="px-4">
            {loadingLocal ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[60px] rounded-xl mb-1" />
            )) : localStations?.slice(0, 5).map(s => (
              <StationCard key={s.stationuuid} station={s} />
            ))}
          </div>
        </section>
      )}

      {/* Top Stations */}
      <section className="mt-6">
        <div className="flex items-center justify-between px-5 mb-1">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <Star size={18} className="text-primary" /> Top Stations
          </h2>
        </div>
        <div className="px-4">
          {loadingTop ? Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[60px] rounded-xl mb-1" />
          )) : topStations?.map(s => (
            <StationCard key={s.stationuuid} station={s} />
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="mt-6">
        <div className="flex items-center justify-between px-5 mb-1">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <TrendingUp size={18} className="text-primary" /> Trending
          </h2>
        </div>
        <div className="px-4">
          {loadingTrending ? Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[60px] rounded-xl mb-1" />
          )) : trending?.map(s => (
            <StationCard key={s.stationuuid} station={s} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
