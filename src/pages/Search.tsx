import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearchStations } from "@/hooks/useRadioAPI";
import { StationCard } from "@/components/StationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, X } from "lucide-react";
import { motion } from "framer-motion";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results, isLoading } = useSearchStations(debouncedQuery);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-5 pt-14 pb-2">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Search</h1>
      </div>

      <div className="px-5 mt-2">
        <div className="relative">
          <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Artists, stations, countries..."
            className="w-full h-10 pl-10 pr-10 rounded-xl bg-secondary text-foreground text-[15px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground active:scale-90">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 mt-4">
        {isLoading ? Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[60px] rounded-xl mb-1" />
        )) : !debouncedQuery ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <SearchIcon size={40} className="mx-auto mb-3 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">Find your favorite stations</p>
          </motion.div>
        ) : results?.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-sm">No results for "{debouncedQuery}"</p>
          </div>
        ) : results?.map(s => (
          <StationCard key={s.stationuuid} station={s} />
        ))}
      </div>
    </div>
  );
};

export default Search;
