import { useQuery } from "@tanstack/react-query";
import { RadioStation, Country } from "@/types/radio";

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
    queryFn: () => {
      const params = new URLSearchParams({ limit: "50", order: "clickcount", reverse: "true" });
      if (query) params.set("name", query);
      if (filters?.country) params.set("country", filters.country);
      if (filters?.tag) params.set("tag", filters.tag);
      if (filters?.language) params.set("language", filters.language);
      return fetchJSON(`/stations/search?${params}`);
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
    queryFn: () => fetchJSON(`/stations/bycountrycodeexact/${countryCode}?order=clickcount&reverse=true&limit=30`),
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

// Fetch stations with geo coordinates for the globe
export const useGeoStations = (limit = 500) =>
  useQuery<RadioStation[]>({
    queryKey: ["geo-stations", limit],
    queryFn: async () => {
      const data = await fetchJSON<RadioStation[]>(`/stations/search?has_geo_info=true&order=clickcount&reverse=true&limit=${limit}`);
      return data.filter(s => s.geo_lat && s.geo_long);
    },
    staleTime: 10 * 60 * 1000,
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
