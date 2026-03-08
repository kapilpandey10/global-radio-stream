import { useState } from "react";
import { useCountries } from "@/hooks/useRadioAPI";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, Globe } from "lucide-react";
import { motion } from "framer-motion";

const Countries = () => {
  const { data: countries, isLoading } = useCountries();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = countries?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="px-4 pt-6 space-y-4 max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-2xl flex items-center gap-2">
        <Globe size={24} className="text-primary" /> Countries
      </h1>

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search countries..."
          className="pl-10 h-11 rounded-xl bg-secondary border-border/50 text-foreground"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {isLoading ? Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        )) : filtered.map((c, i) => (
          <motion.button
            key={c.iso_3166_1}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.5) }}
            onClick={() => navigate(`/countries/${c.iso_3166_1}`)}
            className="flex items-center gap-3 p-3 rounded-xl glass hover:bg-muted/60 transition-colors text-left"
          >
            <img
              src={`https://flagcdn.com/32x24/${c.iso_3166_1.toLowerCase()}.png`}
              alt={c.name}
              className="h-6 rounded-[3px] shrink-0"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-foreground">{c.name}</p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{c.stationcount.toLocaleString()}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Countries;
