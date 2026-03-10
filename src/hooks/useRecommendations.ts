import { useQuery } from "@tanstack/react-query";
import { RadioStation } from "@/types/radio";
import { useSearchStations } from "./useRadioAPI";

export const useRecommendations = (currentStation: RadioStation | null) => {
  // We use the tags and genre of the current station to find similar ones
  const query = currentStation ? (currentStation.tags?.split(',')[0] || currentStation.name) : "";
  
  const { data, isLoading } = useSearchStations(query, {
    limit: 10,
  });

  // Filter out the current station from recommendations
  const recommendations = data?.filter(s => s.stationuuid !== currentStation?.stationuuid) || [];

  return {
    recommendations,
    isLoading
  };
};
