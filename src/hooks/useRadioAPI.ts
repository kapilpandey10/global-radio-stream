import { useQuery } from "@tanstack/react-query";
import { RadioStation, Country } from "@/types/radio";

const BASE = "https://de1.api.radio-browser.info/json";

const fetchJSON = async <T>(path: string): Promise<T> => {
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
