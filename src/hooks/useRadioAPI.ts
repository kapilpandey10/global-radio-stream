import { useQuery } from "@tanstack/react-query";
import { RadioStation, Country } from "@/types/radio";
import { getAllCustomStations } from "@/data/customStations";

const BASE = "https://de1.api.radio-browser.info/json";

const fetchJSON = async <T,>(path: string): Promise<T> => {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error("API error");
  return res.json();
};

export const useTopStations = (limit = 20) =>
  useQuery<RadioStation[]>({
    queryKey: ["top-stations", limit],
    queryFn: () => fetchJSON(`/stations/topvote/${limit}`),
    staleTime: 5 * 60 * 1000,
  });

export const useTrendingStations = (limit = 20) =>
  useQuery<RadioStation[]>({
    queryKey: ["trending-stations", limit],
    queryFn: () => fetchJSON(`/stations/topclick/${limit}`),
    staleTime: 5 * 60 * 1000,
  });

export const useSearchStations = (query: string, filters?: { country?: string; tag?: string; language?: string }) =>
  useQuery<RadioStation[]>({
    queryKey: ["search-stations", query, filters],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50", order: "clickcount", reverse: "true" });
      if (query) params.set("name", query);
      if (filters?.country) params.set("country", filters.country);
      if (filters?.tag) params.set("tag", filters.tag);
      if (filters?.language) params.set("language", filters.language);
      
      const apiResults = await fetchJSON<RadioStation[]>(`/stations/search?${params}`);
      
      // Get custom stations that match the filters
      const customStations = getAllCustomStations().filter(station => {
        const matchesQuery = !query || station.name.toLowerCase().includes(query.toLowerCase());
        const matchesCountry = !filters?.country || station.country.toLowerCase() === filters.country.toLowerCase();
        const matchesTag = !filters?.tag || station.tags.toLowerCase().includes(filters.tag.toLowerCase());
        return matchesQuery && matchesCountry && matchesTag;
      });
      
      // Merge custom stations at the top, avoiding duplicates
      const apiIds = new Set(apiResults.map(s => s.url_resolved || s.url));
      const uniqueCustom = customStations.filter(s => !apiIds.has(s.url_resolved || s.url));
      
      return [...uniqueCustom, ...apiResults];
    },
    enabled: !!(query || filters?.country || filters?.tag || filters?.language),
    staleTime: 2 * 60 * 1000,
  });

export const useCountries = () =>
  useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: async () => {
      const data = await fetchJSON<Country[]>("/countries?order=stationcount&reverse=true");
      return data.filter(c => c.stationcount > 0 && c.name);
    },
    staleTime: 30 * 60 * 1000,
  });

export const useStationsByCountry = (countryCode: string) =>
  useQuery<RadioStation[]>({
    queryKey: ["stations-country", countryCode],
    queryFn: () => fetchJSON(`/stations/bycountrycodeexact/${countryCode}?order=clickcount&reverse=true&limit=100`),
    enabled: !!countryCode,
    staleTime: 5 * 60 * 1000,
  });

export const useLocalStations = (countryCode: string | null) =>
  useQuery<RadioStation[]>({
    queryKey: ["local-stations", countryCode],
    queryFn: async () => {
      const apiResults = await fetchJSON<RadioStation[]>(`/stations/bycountrycodeexact/${countryCode}?order=clickcount&reverse=true&limit=30`);
      
      // Get custom stations matching the country code
      const customStations = getAllCustomStations().filter(
        s => s.countrycode.toLowerCase() === countryCode?.toLowerCase()
      );
      
      // Merge custom stations at the top
      const apiIds = new Set(apiResults.map(s => s.url_resolved || s.url));
      const uniqueCustom = customStations.filter(s => !apiIds.has(s.url_resolved || s.url));
      
      return [...uniqueCustom, ...apiResults];
    },
    enabled: !!countryCode,
    staleTime: 5 * 60 * 1000,
  });

export const useUserCountry = () =>
  useQuery<string | null>({
    queryKey: ["user-country"],
    queryFn: async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        return data.country_code || null;
      } catch {
        return null;
      }
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

// Fetch ALL stations with geo coordinates for the globe (paginated)
export const useGeoStations = () =>
  useQuery<RadioStation[]>({
    queryKey: ["geo-stations-all"],
    queryFn: async () => {
      const pages: RadioStation[][] = [];
      let offset = 0;
      const pageSize = 5000;
      // Fetch in pages until we get fewer results than page size
      while (true) {
        const data = await fetchJSON<RadioStation[]>(
          `/stations/search?has_geo_info=true&order=clickcount&reverse=true&limit=${pageSize}&offset=${offset}`
        );
        const valid = data.filter(s => s.geo_lat && s.geo_long);
        pages.push(valid);
        if (data.length < pageSize) break;
        offset += pageSize;
        // Safety cap at 50k stations
        if (offset >= 50000) break;
      }
      return pages.flat();
    },
    staleTime: 30 * 60 * 1000,
  });

// Find nearby stations based on coordinates
export const useNearbyStations = (lat: number | null, lng: number | null, limit = 10) =>
  useQuery<RadioStation[]>({
    queryKey: ["nearby-stations", lat, lng, limit],
    queryFn: async () => {
      if (!lat || !lng) return [];
      // Get stations with geo info and filter by distance
      const data = await fetchJSON<RadioStation[]>(`/stations/search?has_geo_info=true&order=clickcount&reverse=true&limit=200`);
      const withDistance = data
        .filter(s => s.geo_lat && s.geo_long)
        .map(s => ({
          ...s,
          distance: getDistance(lat, lng, s.geo_lat!, s.geo_long!)
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
      return withDistance;
    },
    enabled: lat !== null && lng !== null,
    staleTime: 5 * 60 * 1000,
  });

// Haversine formula for distance calculation
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
