import { useState, useEffect, useRef, useMemo } from "react";
import { useGeoStations, useNearbyStations } from "@/hooks/useRadioAPI";
import { Search, MapPin, Radio, X, Play, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Globe3D from "react-globe.gl";
import { usePlayer } from "@/contexts/PlayerContext";
import { RadioStation } from "@/types/radio";
import { StationLogo } from "@/components/StationLogo";

const Countries = () => {
  const { data: geoStations, isLoading } = useGeoStations();
  const [search, setSearch] = useState("");
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { play, currentStation, isPlaying } = usePlayer();
  
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [globeSize, setGlobeSize] = useState({ w: 400, h: 600 });
  
  const { data: nearbyStations } = useNearbyStations(selectedLat, selectedLng, 8);

  // Resize globe to fill container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setGlobeSize({
          w: containerRef.current.clientWidth,
          h: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Filter stations
  const filtered = useMemo(() => {
    if (!geoStations) return [];
    if (!search) return geoStations;
    return geoStations.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase()) ||
      s.state?.toLowerCase().includes(search.toLowerCase())
    );
  }, [geoStations, search]);

  // Globe points - green glowing dots like radio.garden
  const stationPoints = useMemo(() => {
    return filtered.map(s => ({
      ...s,
      lat: s.geo_lat!,
      lng: s.geo_long!,
      size: currentStation?.stationuuid === s.stationuuid && isPlaying ? 0.35 : 0.12,
      color: currentStation?.stationuuid === s.stationuuid && isPlaying 
        ? "#ef4444" 
        : "#22c55e",
    }));
  }, [filtered, currentStation, isPlaying]);

  // Auto-rotate
  useEffect(() => {
    if (globeRef.current && !selectedStation) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.4;
      globeRef.current.controls().enableZoom = true;
    }
  }, [selectedStation]);

  // Search results list
  const searchResults = useMemo(() => {
    if (!search || !geoStations) return [];
    return geoStations.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 8);
  }, [search, geoStations]);

  const handleStationClick = (station: any) => {
    setSelectedStation(station);
    setSelectedLat(station.lat);
    setSelectedLng(station.lng);
    
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = false;
      globeRef.current.pointOfView({ lat: station.lat, lng: station.lng, altitude: 0.8 }, 1200);
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
      globeRef.current.pointOfView({ altitude: 2.2 }, 800);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0e17] flex flex-col" style={{ bottom: "60px" }}>
      {/* Globe fills the entire view */}
      <div ref={containerRef} className="absolute inset-0 flex items-center justify-center">
        {isLoading ? (
          <div className="text-center">
            <Loader2 size={40} className="mx-auto text-green-400 animate-spin mb-3" />
            <p className="text-sm text-white/50">Tuning into the world...</p>
          </div>
        ) : (
          <Globe3D
            ref={globeRef}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl=""
            backgroundColor="rgba(0,0,0,0)"
            pointsData={stationPoints}
            pointLat="lat"
            pointLng="lng"
            pointColor="color"
            pointAltitude={0.005}
            pointRadius="size"
            pointLabel={(d: any) => `
              <div style="background: rgba(0,0,0,0.9); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(34,197,94,0.3);">
                <strong style="color: #22c55e; font-size: 13px;">📻 ${d.name}</strong>
                <div style="color: rgba(255,255,255,0.6); font-size: 11px; margin-top: 2px;">
                  ${d.country}${d.state ? ' · ' + d.state : ''}
                </div>
              </div>
            `}
            onPointClick={handleStationClick}
            width={globeSize.w}
            height={globeSize.h}
            atmosphereColor="#22c55e"
            atmosphereAltitude={0.15}
          />
        )}
      </div>

      {/* Floating search bar */}
      <div className="relative z-20 px-4 pt-12">
        <div className="relative max-w-md mx-auto">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stations worldwide..."
            className="w-full h-10 pl-10 pr-10 rounded-full bg-white/10 backdrop-blur-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-green-500/50 border border-white/10"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        <AnimatePresence>
          {search && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="max-w-md mx-auto mt-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 overflow-hidden"
            >
              {searchResults.map((station) => (
                <button
                  key={station.stationuuid}
                  onClick={() => {
                    handleStationClick({ ...station, lat: station.geo_lat, lng: station.geo_long });
                    setSearch("");
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                >
                  <StationLogo src={station.favicon} name={station.name} size="xs" className="rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{station.name}</p>
                    <p className="text-xs text-white/40">{station.country}{station.state ? ` · ${station.state}` : ''}</p>
                  </div>
                  <Play size={14} className="text-green-400 shrink-0" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Station count & branding */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[11px] text-white/60 font-medium">{stationPoints.length} stations live</span>
        </div>
      </div>

      {/* Selected Station Panel - bottom sheet */}
      <AnimatePresence>
        {selectedStation && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-30 max-h-[55vh] overflow-hidden"
          >
            <div className="bg-[#111827]/95 backdrop-blur-xl rounded-t-3xl border-t border-white/10">
              <div className="p-5">
                {/* Handle */}
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
                
                {/* Close */}
                <button
                  onClick={closePanel}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X size={16} className="text-white/60" />
                </button>

                {/* Station info */}
                <div className="flex items-center gap-4 mb-4">
                  <StationLogo
                    src={selectedStation.favicon}
                    name={selectedStation.name}
                    size="lg"
                    playing={currentStation?.stationuuid === selectedStation.stationuuid && isPlaying}
                    className="rounded-2xl"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{selectedStation.name}</h3>
                    <p className="text-sm text-white/50 flex items-center gap-1.5">
                      {selectedStation.countrycode && (
                        <img
                          src={`https://flagcdn.com/16x12/${selectedStation.countrycode.toLowerCase()}.png`}
                          alt=""
                          className="h-3 rounded-sm"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      )}
                      {selectedStation.country}
                      {selectedStation.state && ` · ${selectedStation.state}`}
                    </p>
                  </div>
                </div>

                {/* Play button */}
                <button
                  onClick={() => handlePlayStation(selectedStation)}
                  className={cn(
                    "w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                    currentStation?.stationuuid === selectedStation.stationuuid && isPlaying
                      ? "bg-red-500 text-white"
                      : "bg-green-500 text-white"
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

                {/* Nearby */}
                {nearbyStations && nearbyStations.length > 1 && (
                  <div className="mt-5">
                    <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <MapPin size={12} /> Nearby Stations
                    </h4>
                    <div className="space-y-1 max-h-[160px] overflow-y-auto scrollbar-hide">
                      {nearbyStations
                        .filter(s => s.stationuuid !== selectedStation.stationuuid)
                        .slice(0, 5)
                        .map((station) => (
                          <button
                            key={station.stationuuid}
                            onClick={() => {
                              setSelectedStation(station);
                              if (globeRef.current && station.geo_lat && station.geo_long) {
                                globeRef.current.pointOfView({ lat: station.geo_lat, lng: station.geo_long, altitude: 0.8 }, 800);
                              }
                            }}
                            className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
                          >
                            <StationLogo src={station.favicon} name={station.name} size="xs" className="rounded-lg" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{station.name}</p>
                              <p className="text-xs text-white/40">{station.country}</p>
                            </div>
                            <ChevronRight size={14} className="text-white/20" />
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Countries;
