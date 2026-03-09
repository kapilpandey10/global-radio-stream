import { useTopStations, useTrendingStations, useLocalStations, useUserCountry } from "@/hooks/useRadioAPI";
import { usePlayer } from "@/contexts/PlayerContext";
import { StationCard } from "@/components/StationCard";
import { StationLogo } from "@/components/StationLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, TrendingUp, Star, ChevronRight, Clock, Radio, Play, Pause, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const FeaturedCard = ({ station, index }: { station: any; index: number }) => {
  const { currentStation, isPlaying, isLoading, play, pause, resume } = usePlayer();
  const isActive = currentStation?.stationuuid === station.stationuuid;

  const handlePlay = () => {
    if (isActive && isPlaying) pause();
    else if (isActive) resume();
    else play(station);
  };

  const gradients = [
    "from-primary to-[hsl(290_70%_60%)]",
    "from-[hsl(200_80%_50%)] to-[hsl(220_70%_60%)]",
    "from-[hsl(340_70%_55%)] to-[hsl(20_80%_55%)]",
    "from-[hsl(160_60%_40%)] to-[hsl(190_70%_50%)]",
  ];

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={handlePlay}
      className={cn(
        "relative min-w-[160px] h-[200px] rounded-3xl overflow-hidden flex flex-col justify-end p-4 text-left snap-start",
        "bg-gradient-to-br shadow-lg",
        gradients[index % gradients.length]
      )}
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute top-3 right-3 z-10">
        {station.favicon && (
          <img src={station.favicon} alt="" className="h-10 w-10 rounded-xl object-cover shadow-md bg-white/20 backdrop-blur-sm" onError={(e) => e.currentTarget.style.display = 'none'} />
        )}
      </div>
      <div className="absolute top-3 left-3 z-10">
        <div className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center transition-all",
          isActive && isPlaying ? "bg-white/30 backdrop-blur-sm" : "bg-white/20 backdrop-blur-sm"
        )}>
          {isActive && isLoading ? (
            <Loader2 size={16} className="animate-spin text-white" />
          ) : isActive && isPlaying ? (
            <Pause size={16} className="text-white" />
          ) : (
            <Play size={16} className="text-white ml-0.5" />
          )}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-md">{station.name}</p>
        <p className="text-white/70 text-xs mt-1 font-medium">{station.country}</p>
        {station.bitrate > 0 && <p className="text-white/50 text-[10px] mt-0.5">{station.bitrate}kbps</p>}
      </div>
      {isActive && isPlaying && (
        <div className="absolute bottom-3 right-3 z-10 flex items-end gap-0.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-0.5 bg-white/80 rounded-full" style={{
              height: '12px',
              animation: `eq 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
            }} />
          ))}
        </div>
      )}
    </motion.button>
  );
};

const WidgetCard = ({ title, icon: Icon, children, onSeeAll, className }: {
  title: string; icon: any; children: React.ReactNode; onSeeAll?: () => void; className?: string;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("bg-card rounded-3xl border border-border/50 overflow-hidden shadow-sm", className)}
  >
    <div className="flex items-center justify-between px-5 pt-5 pb-2">
      <h2 className="text-sm font-bold flex items-center gap-2 text-foreground">
        <div className="h-7 w-7 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon size={14} className="text-primary" />
        </div>
        {title}
      </h2>
      {onSeeAll && (
        <button onClick={onSeeAll} className="text-primary text-xs font-semibold flex items-center gap-0.5 active:opacity-60">
          See All <ChevronRight size={14} />
        </button>
      )}
    </div>
    <div className="px-4 pb-3">{children}</div>
  </motion.section>
);

const Index = () => {
  const { data: userCountry } = useUserCountry();
  const { data: localStations, isLoading: loadingLocal } = useLocalStations(userCountry || null);
  const { data: topStations, isLoading: loadingTop } = useTopStations(10);
  const { data: trending, isLoading: loadingTrending } = useTrendingStations(10);
  const { recentlyPlayed, play } = usePlayer();
  const navigate = useNavigate();

  const featuredStations = localStations?.slice(0, 4) || topStations?.slice(0, 4) || [];

  return (
    <>
      <SEO path="/" />
      <div className="max-w-2xl mx-auto pb-6">
        {/* Hero */}
        <div className="px-5 pt-14 pb-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-11 w-11 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <Radio size={20} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Mero Radio</h1>
                <p className="text-xs text-muted-foreground font-medium">30,000+ stations worldwide</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Featured Horizontal Cards */}
        {featuredStations.length > 0 && (
          <section className="mt-4">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-2 snap-x snap-mandatory">
              {featuredStations.map((s, i) => (
                <FeaturedCard key={s.stationuuid} station={s} index={i} />
              ))}
            </div>
          </section>
        )}


        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <section className="mt-5 px-5">
            <WidgetCard title="Recently Played" icon={Clock}>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2 -mx-1 px-1">
                {recentlyPlayed.slice(0, 10).map((s, i) => (
                  <motion.button
                    key={s.stationuuid}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => play(s)}
                    className="flex flex-col items-center gap-2 min-w-[68px] max-w-[68px]"
                  >
                    <StationLogo src={s.favicon} name={s.name} size="sm" className="rounded-2xl shadow-md" />
                    <span className="text-[10px] text-muted-foreground text-center leading-tight line-clamp-2 w-full font-medium">
                      {s.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </WidgetCard>
          </section>
        )}

        {/* Local Stations Widget */}
        {userCountry && (
          <section className="mt-4 px-5">
            <WidgetCard
              title="Popular Near You"
              icon={MapPin}
              onSeeAll={() => navigate(`/countries/${userCountry}`)}
            >
              {loadingLocal ? (
                <div className="space-y-1">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[56px] rounded-2xl" />)}</div>
              ) : (
                localStations?.slice(0, 5).map(s => <StationCard key={s.stationuuid} station={s} compact />)
              )}
            </WidgetCard>
          </section>
        )}

      </div>

      <style>{`
        @keyframes eq {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </>
  );
};

export default Index;
