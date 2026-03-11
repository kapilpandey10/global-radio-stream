import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearchStations, useCountries } from "@/hooks/useRadioAPI";
import { StationCard } from "@/components/StationCard";
import { CategoryDiscovery } from "@/components/CategoryDiscovery";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import { Search as SearchIcon, X, ChevronDown, Globe, Filter, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const { data: countries } = useCountries();

  // Banner Initialization
  useEffect(() => {
    const w = window as any;
    if (w.aclib && typeof w.aclib.runBanner === 'function') {
      w.aclib.runBanner({
        zoneId: '11051154',
      });
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results, isLoading } = useSearchStations(debouncedQuery, {
    country: selectedCountry || undefined,
  });

  const filteredCountries = countries?.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  ).slice(0, 50);

  const selectedCountryName = countries?.find(c => c.name === selectedCountry)?.name;

  const handleCategorySelect = (genre: string) => {
    setQuery(genre);
  };

  return (
    <>
      <SEO 
        title="Search Radio Stations - Mero Radio"
        description="Search through 30,000+ live radio stations worldwide. Filter by country, genre, language, or station name. Find your favorite radio stations."
        path="/search"
      />
      <div className="max-w-2xl mx-auto pb-24">
        <div className="px-5 pt-14 pb-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Search</h1>
        </div>

        {/* Search input */}
        <div className="px-5 mt-2">
          <div className="relative">
            <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Artists, stations, genres..."
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-muted text-foreground text-[15px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all border border-border/50"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground active:scale-90">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Country filter */}
        <div className="px-5 mt-3 flex gap-2">
          <button
            onClick={() => setShowCountryPicker(!showCountryPicker)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
              selectedCountry
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border/50 hover:border-primary/50"
            )}
          >
            <Filter size={14} />
            {selectedCountryName || "All Countries"}
            <ChevronDown size={14} className={cn("transition-transform", showCountryPicker && "rotate-180")} />
          </button>
          {selectedCountry && (
            <button
              onClick={() => { setSelectedCountry(""); setShowCountryPicker(false); }}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        {/* Country picker dropdown */}
        <AnimatePresence>
          {showCountryPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 mt-2 overflow-hidden"
            >
              <div className="bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden">
                <div className="p-3 border-b border-border/50">
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="Filter countries..."
                      className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>
                
                <div className="max-h-[280px] overflow-y-auto scrollbar-hide">
                  {filteredCountries?.map((country) => (
                    <button
                      key={country.iso_3166_1}
                      onClick={() => {
                        setSelectedCountry(country.name);
                        setShowCountryPicker(false);
                        setCountrySearch("");
                      }}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted/60 transition-colors border-b border-border/20 last:border-0",
                        selectedCountry === country.name && "bg-primary/10"
                      )}
                    >
                      {country.iso_3166_1 && (
                        <img
                          src={`https://flagcdn.com/24x18/${country.iso_3166_1.toLowerCase()}.png`}
                          alt=""
                          className="h-3.5 rounded-[2px] shrink-0"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      )}
                      <span className="text-sm font-medium text-foreground flex-1">{country.name}</span>
                      <span className="text-xs text-muted-foreground">{country.stationcount} stations</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Section */}
        <div className="mt-4">
          {isLoading ? (
            <div className="px-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[60px] rounded-xl mb-1" />
              ))}
            </div>
          ) : !debouncedQuery && !selectedCountry ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="px-5 mb-2 flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                <Sparkles size={14} className="text-primary" />
                Explore Categories
              </div>
              <CategoryDiscovery onSelect={handleCategorySelect} />
              
              <div className="px-5 mt-8 mb-2 flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                <Globe size={14} className="text-primary" />
                Popular Countries
              </div>
              <div className="grid grid-cols-2 gap-3 px-4">
                {countries?.slice(0, 6).map(c => (
                  <button
                    key={c.iso_3166_1}
                    onClick={() => setSelectedCountry(c.name)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:bg-muted transition-all text-left"
                  >
                    <img
                      src={`https://flagcdn.com/24x18/${c.iso_3166_1.toLowerCase()}.png`}
                      alt=""
                      className="h-4 rounded-[2px]"
                    />
                    <span className="text-sm font-medium truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : results?.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-sm">No stations found</p>
            </div>
          ) : (
            <div className="px-4">
              {results?.map(s => (
                <StationCard key={s.stationuuid} station={s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Search;
