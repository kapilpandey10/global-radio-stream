import { useSearchStations } from "./useRadioAPI";
import { RadioStation } from "@/types/radio";

export const useRecommendations = (currentStation: RadioStation | null) => {
  const query = currentStation ? (currentStation.tags?.split(',')[0] || currentStation.name) : "";
  
  const { data, isLoading } = useSearchStations(query);

  const recommendations = data?.filter(s => s.stationuuid !== currentStation?.stationuuid) || [];

  return {
    recommendations: recommendations.slice(0, 10),
    isLoading
  };
};
