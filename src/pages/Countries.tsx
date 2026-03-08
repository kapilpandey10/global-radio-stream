import { useState, useEffect, useRef, useMemo } from "react";
import { useCountries } from "@/hooks/useRadioAPI";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Globe, List, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Globe3D from "react-globe.gl";

const Countries = () => {
  const { data: countries, isLoading } = useCountries();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"globe" | "list">("globe");
  const navigate = useNavigate();
  const globeRef = useRef<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const filtered = countries?.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Country coordinates for the globe
  const countryData = useMemo(() => {
    if (!countries) return [];
    
    const countryCoords: Record<string, { lat: number; lng: number }> = {
      US: { lat: 37.0902, lng: -95.7129 },
      GB: { lat: 55.3781, lng: -3.4360 },
      DE: { lat: 51.1657, lng: 10.4515 },
      FR: { lat: 46.2276, lng: 2.2137 },
      ES: { lat: 40.4637, lng: -3.7492 },
      IT: { lat: 41.8719, lng: 12.5674 },
      BR: { lat: -14.2350, lng: -51.9253 },
      JP: { lat: 36.2048, lng: 138.2529 },
      AU: { lat: -25.2744, lng: 133.7751 },
      CA: { lat: 56.1304, lng: -106.3468 },
      IN: { lat: 20.5937, lng: 78.9629 },
      CN: { lat: 35.8617, lng: 104.1954 },
      RU: { lat: 61.5240, lng: 105.3188 },
      MX: { lat: 23.6345, lng: -102.5528 },
      AR: { lat: -38.4161, lng: -63.6167 },
      ZA: { lat: -30.5595, lng: 22.9375 },
      NL: { lat: 52.1326, lng: 5.2913 },
      SE: { lat: 60.1282, lng: 18.6435 },
      NO: { lat: 60.4720, lng: 8.4689 },
      PL: { lat: 51.9194, lng: 19.1451 },
      AT: { lat: 47.5162, lng: 14.5501 },
      CH: { lat: 46.8182, lng: 8.2275 },
      BE: { lat: 50.5039, lng: 4.4699 },
      PT: { lat: 39.3999, lng: -8.2245 },
      GR: { lat: 39.0742, lng: 21.8243 },
      TR: { lat: 38.9637, lng: 35.2433 },
      KR: { lat: 35.9078, lng: 127.7669 },
      ID: { lat: -0.7893, lng: 113.9213 },
      TH: { lat: 15.8700, lng: 100.9925 },
      PH: { lat: 12.8797, lng: 121.7740 },
      MY: { lat: 4.2105, lng: 101.9758 },
      SG: { lat: 1.3521, lng: 103.8198 },
      NZ: { lat: -40.9006, lng: 174.8860 },
      IE: { lat: 53.1424, lng: -7.6921 },
      DK: { lat: 56.2639, lng: 9.5018 },
      FI: { lat: 61.9241, lng: 25.7482 },
      CZ: { lat: 49.8175, lng: 15.4730 },
      HU: { lat: 47.1625, lng: 19.5033 },
      RO: { lat: 45.9432, lng: 24.9668 },
      UA: { lat: 48.3794, lng: 31.1656 },
      EG: { lat: 26.8206, lng: 30.8025 },
      NG: { lat: 9.0820, lng: 8.6753 },
      KE: { lat: -0.0236, lng: 37.9062 },
      CO: { lat: 4.5709, lng: -74.2973 },
      CL: { lat: -35.6751, lng: -71.5430 },
      PE: { lat: -9.1900, lng: -75.0152 },
      VE: { lat: 6.4238, lng: -66.5897 },
      PK: { lat: 30.3753, lng: 69.3451 },
      BD: { lat: 23.6850, lng: 90.3563 },
      VN: { lat: 14.0583, lng: 108.2772 },
      SA: { lat: 23.8859, lng: 45.0792 },
      AE: { lat: 23.4241, lng: 53.8478 },
      IL: { lat: 31.0461, lng: 34.8516 },
      HK: { lat: 22.3193, lng: 114.1694 },
      TW: { lat: 23.6978, lng: 120.9605 },
    };

    return countries.map(c => ({
      ...c,
      lat: countryCoords[c.iso_3166_1]?.lat || 0,
      lng: countryCoords[c.iso_3166_1]?.lng || 0,
      size: Math.min(Math.max(c.stationcount / 500, 0.3), 2),
    })).filter(c => c.lat !== 0);
  }, [countries]);

  // Auto-rotate globe
  useEffect(() => {
    if (globeRef.current && viewMode === "globe") {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
    }
  }, [viewMode]);

  const handleCountryClick = (country: any) => {
    setSelectedCountry(country.iso_3166_1);
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: country.lat, lng: country.lng, altitude: 1.5 }, 1000);
    }
    setTimeout(() => {
      navigate(`/countries/${country.iso_3166_1}`);
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-5 pt-14 pb-2">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Explore</h1>
        <p className="text-muted-foreground mt-1">Discover radio stations worldwide</p>
      </div>

      {/* Search & View Toggle */}
      <div className="px-5 mt-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search countries..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted text-foreground text-[15px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all border border-border/50"
          />
        </div>
        <div className="flex bg-muted rounded-xl p-1 border border-border/50">
          <button
            onClick={() => setViewMode("globe")}
            className={cn(
              "p-2.5 rounded-lg transition-all",
              viewMode === "globe" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Globe size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2.5 rounded-lg transition-all",
              viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {viewMode === "globe" ? (
        <div className="mt-4 mx-4 rounded-2xl overflow-hidden bg-card border border-border/50 shadow-lg" style={{ height: "400px" }}>
          <Globe3D
            ref={globeRef}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            pointsData={countryData}
            pointLat="lat"
            pointLng="lng"
            pointColor={() => "hsl(var(--primary))"}
            pointAltitude={0.01}
            pointRadius="size"
            pointLabel={(d: any) => `
              <div style="background: hsl(var(--card)); padding: 8px 12px; border-radius: 8px; border: 1px solid hsl(var(--border));">
                <strong style="color: hsl(var(--foreground));">${d.name}</strong>
                <br/>
                <span style="color: hsl(var(--muted-foreground)); font-size: 12px;">${d.stationcount.toLocaleString()} stations</span>
              </div>
            `}
            onPointClick={handleCountryClick}
            width={window.innerWidth > 600 ? 560 : window.innerWidth - 32}
            height={400}
            atmosphereColor="hsl(var(--primary))"
            atmosphereAltitude={0.15}
          />
        </div>
      ) : (
        <div className="px-4 mt-4">
          {isLoading ? Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="h-[60px] rounded-xl mb-2" />
          )) : filtered.map((c, i) => (
            <motion.button
              key={c.iso_3166_1}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.4) }}
              onClick={() => navigate(`/countries/${c.iso_3166_1}`)}
              className="flex items-center gap-4 w-full py-3.5 px-3 rounded-xl mb-2 bg-card border border-border/50 text-left active:scale-[0.98] transition-all hover:border-primary/50"
            >
              <img
                src={`https://flagcdn.com/48x36/${c.iso_3166_1.toLowerCase()}.png`}
                alt={c.name}
                className="h-8 rounded-md shrink-0 shadow-sm"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div className="flex-1 min-w-0">
                <span className="text-[15px] font-semibold text-foreground truncate block">{c.name}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin size={10} /> {c.stationcount.toLocaleString()} stations
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {countries && viewMode === "globe" && (
        <div className="px-5 mt-6 mb-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
              <p className="text-2xl font-bold text-primary">{countries.length}</p>
              <p className="text-xs text-muted-foreground">Countries</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
              <p className="text-2xl font-bold text-primary">
                {countries.reduce((a, c) => a + c.stationcount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Stations</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border/50 text-center">
              <p className="text-2xl font-bold text-primary">24/7</p>
              <p className="text-xs text-muted-foreground">Streaming</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Countries;
