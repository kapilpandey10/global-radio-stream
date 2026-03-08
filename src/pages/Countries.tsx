import { useState, useEffect, useRef, useMemo } from "react";
import { useGeoStations, useNearbyStations } from "@/hooks/useRadioAPI";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Globe, List, MapPin, Radio, X, Play, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Globe3D from "react-globe.gl";
import { usePlayer } from "@/contexts/PlayerContext";
import { RadioStation } from "@/types/radio";
import { StationLogo } from "@/components/StationLogo";

const Countries = () => {
  const { data: geoStations, isLoading } = useGeoStations(300);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"globe" | "list">("globe");
  const navigate = useNavigate();
  const globeRef = useRef<any>(null);
  const { play, currentStation, isPlaying } = usePlayer();
  
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  
  const { data: nearbyStations } = useNearbyStations(selectedLat, selectedLng, 5);

  // Filter stations by search
  const filtered = useMemo(() => {
    if (!geoStations) return [];
    if (!search) return geoStations;
    return geoStations.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase())
    );
  }, [geoStations, search]);

  // Prepare data for globe
  const stationPoints = useMemo(() => {
    return filtered.map(s => ({
      ...s,
      lat: s.geo_lat!,
      lng: s.geo_long!,
      size: 0.15,
      color: currentStation?.stationuuid === s.stationuuid && isPlaying 
        ? "#ef4444" 
        : "hsl(var(--primary))",
    }));
  }, [filtered, currentStation, isPlaying]);

  // Auto-rotate globe
  useEffect(() => {
    if (globeRef.current && viewMode === "globe" && !selectedStation) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.3;
    }
  }, [viewMode, selectedStation]);

  const handleStationClick = (station: any) => {
    setSelectedStation(station);
    setSelectedLat(station.lat);
    setSelectedLng(station.lng);
    
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = false;
      globeRef.current.pointOfView({ lat: station.lat, lng: station.lng, altitude: 1.2 }, 1000);
    }
  };

  const handlePlayStation = (station: RadioStation) => {
    play(station);
  };

  const closePanel = () => {
    setSelectedStation(null);
    setSelectedLat(null);
    setSelectedLng(null);
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
    }
  };

  return (
    <div className="max-w-2xl mx-auto relative">
      <div className="px-5 pt-14 pb-2">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Explore</h1>
        <p className="text-muted-foreground mt-1">Tap a station pin to play</p>
      </div>

      {/* Search & View Toggle */}
      <div className="px-5 mt-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stations or countries..."
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
        <div className="mt-4 mx-4 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border border-border/50 shadow-lg relative" style={{ height: "420px" }}>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Globe size={48} className="mx-auto text-primary animate-pulse mb-3" />
                <p className="text-sm text-muted-foreground">Loading stations...</p>
              </div>
            </div>
          ) : (
            <Globe3D
              ref={globeRef}
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
              bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
              backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
              pointsData={stationPoints}
              pointLat="lat"
              pointLng="lng"
              pointColor="color"
              pointAltitude={0.01}
              pointRadius="size"
              pointLabel={(d: any) => `
                <div style="background: rgba(0,0,0,0.85); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 16px;">📻</span>
                    <strong style="color: white; font-size: 14px;">${d.name}</strong>
                  </div>
                  <div style="color: rgba(255,255,255,0.7); font-size: 11px; margin-top: 4px;">
                    ${d.country} ${d.state ? '· ' + d.state : ''}
                  </div>
                  <div style="color: rgba(255,255,255,0.5); font-size: 10px; margin-top: 2px;">
                    Click to play
                  </div>
                </div>
              `}
              onPointClick={handleStationClick}
              width={window.innerWidth > 600 ? 560 : window.innerWidth - 32}
              height={420}
              atmosphereColor="#6366f1"
              atmosphereAltitude={0.12}
            />
          )}
          
          {/* Station count badge */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
            <MapPin size={14} className="text-primary" />
            <span className="text-xs text-white font-medium">{stationPoints.length} stations</span>
          </div>
        </div>
      ) : (
        <div className="px-4 mt-4 space-y-2">
          {isLoading ? Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-xl" />
          )) : filtered.slice(0, 50).map((station, i) => (
            <motion.button
              key={station.stationuuid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
              onClick={() => handlePlayStation(station)}
              className={cn(
                "flex items-center gap-3 w-full p-3 rounded-xl bg-card border text-left active:scale-[0.98] transition-all",
                currentStation?.stationuuid === station.stationuuid
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-primary/50"
              )}
            >
              <StationLogo
                src={station.favicon}
                name={station.name}
                size="sm"
                playing={currentStation?.stationuuid === station.stationuuid && isPlaying}
                className="rounded-xl"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{station.name}</p>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  <MapPin size={10} /> {station.country} {station.state && `· ${station.state}`}
                </p>
              </div>
              <Play size={20} className="text-primary shrink-0" />
            </motion.button>
          ))}
        </div>
      )}

      {/* Selected Station Panel */}
      <AnimatePresence>
        {selectedStation && viewMode === "globe" && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 rounded-t-3xl shadow-2xl z-40 max-h-[60vh] overflow-hidden"
          >
            <div className="p-5">
              {/* Handle */}
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
              
              {/* Close button */}
              <button
                onClick={closePanel}
                className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Selected Station */}
              <div className="flex items-center gap-4 mb-4">
                <StationLogo
                  src={selectedStation.favicon}
                  name={selectedStation.name}
                  size="lg"
                  playing={currentStation?.stationuuid === selectedStation.stationuuid && isPlaying}
                  className="rounded-2xl"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground truncate">{selectedStation.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin size={12} /> {selectedStation.country}
                    {selectedStation.state && ` · ${selectedStation.state}`}
                  </p>
                  {selectedStation.language && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedStation.language}
                    </p>
                  )}
                </div>
              </div>

              {/* Play Button */}
              <button
                onClick={() => handlePlayStation(selectedStation)}
                className={cn(
                  "w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                  currentStation?.stationuuid === selectedStation.stationuuid && isPlaying
                    ? "bg-red-500 text-white"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {currentStation?.stationuuid === selectedStation.stationuuid && isPlaying ? (
                  <>
                    <Radio size={18} className="animate-pulse" /> Now Playing
                  </>
                ) : (
                  <>
                    <Play size={18} fill="currentColor" /> Play Station
                  </>
                )}
              </button>

              {/* Nearby Stations */}
              {nearbyStations && nearbyStations.length > 1 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <MapPin size={14} /> Nearby Stations
                  </h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {nearbyStations
                      .filter(s => s.stationuuid !== selectedStation.stationuuid)
                      .slice(0, 4)
                      .map((station) => (
                        <button
                          key={station.stationuuid}
                          onClick={() => {
                            setSelectedStation(station);
                            if (globeRef.current && station.geo_lat && station.geo_long) {
                              globeRef.current.pointOfView({ 
                                lat: station.geo_lat, 
                                lng: station.geo_long, 
                                altitude: 1.2 
                              }, 800);
                            }
                          }}
                          className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
                        >
                          <StationLogo
                            src={station.favicon}
                            name={station.name}
                            size="xs"
                            className="rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{station.name}</p>
                            <p className="text-xs text-muted-foreground">{station.country}</p>
                          </div>
                          <ChevronRight size={16} className="text-muted-foreground" />
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Countries;
