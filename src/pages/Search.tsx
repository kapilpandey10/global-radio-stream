import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearchStations } from "@/hooks/useRadioAPI";
import { StationCard } from "@/components/StationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const tagFilter = searchParams.get("tag") || "";

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results, isLoading } = useSearchStations(debouncedQuery, { tag: tagFilter });

  return (
    <div className="px-4 pt-6 space-y-4 max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-2xl">Search</h1>

      <div className="relative">
        <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stations, genres, countries..."
          className="pl-10 pr-10 h-12 rounded-xl bg-secondary border-border/50 text-foreground"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        )}
      </div>

      {tagFilter && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Genre:</span>
          <span className="px-3 py-1 rounded-full gradient-bg text-primary-foreground text-sm capitalize">{tagFilter}</span>
          <button onClick={() => setSearchParams({})} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
        </div>
      )}

      <div className="space-y-2">
        {isLoading ? Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-xl" />
        )) : !debouncedQuery && !tagFilter ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-muted-foreground">
            <SearchIcon size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm">Type to search for radio stations</p>
          </motion.div>
        ) : results?.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No stations found</p>
          </div>
        ) : results?.map(s => (
          <StationCard key={s.stationuuid} station={s} />
        ))}
      </div>
    </div>
  );
};

export default Search;
