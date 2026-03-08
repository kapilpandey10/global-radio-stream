import { useState } from "react";
import { useCountries } from "@/hooks/useRadioAPI";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const Countries = () => {
  const { data: countries, isLoading } = useCountries();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = countries?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-5 pt-14 pb-2">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Browse</h1>
      </div>

      <div className="px-5 mt-2">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search countries..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary text-foreground text-[15px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      <div className="px-4 mt-4">
        {isLoading ? Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className="h-[52px] rounded-xl mb-1" />
        )) : filtered.map((c, i) => (
          <motion.button
            key={c.iso_3166_1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: Math.min(i * 0.015, 0.4) }}
            onClick={() => navigate(`/countries/${c.iso_3166_1}`)}
            className="flex items-center gap-3 w-full py-3 px-1 border-b border-border/40 last:border-b-0 text-left active:bg-secondary/50 transition-colors"
          >
            <img
              src={`https://flagcdn.com/32x24/${c.iso_3166_1.toLowerCase()}.png`}
              alt={c.name}
              className="h-6 rounded-[3px] shrink-0 shadow-sm"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <span className="flex-1 text-[15px] font-medium text-foreground truncate">{c.name}</span>
            <span className="text-xs text-muted-foreground mr-1">{c.stationcount.toLocaleString()}</span>
            <ChevronRight size={16} className="text-muted-foreground/40" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Countries;
