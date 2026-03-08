import { useParams, useNavigate } from "react-router-dom";
import { useStationsByCountry } from "@/hooks/useRadioAPI";
import { StationCard } from "@/components/StationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

const CountryStations = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { data: stations, isLoading } = useStationsByCountry(code || "");

  const countryName = stations?.[0]?.country || code;

  return (
    <div className="px-4 pt-6 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/countries")} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          {code && (
            <img
              src={`https://flagcdn.com/32x24/${code.toLowerCase()}.png`}
              alt={countryName}
              className="h-6 rounded-[3px]"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          <h1 className="font-display font-bold text-xl">{countryName}</h1>
        </div>
        {stations && <span className="text-sm text-muted-foreground ml-auto">{stations.length} stations</span>}
      </div>

      <div className="space-y-2">
        {isLoading ? Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-xl" />
        )) : stations?.map(s => (
          <StationCard key={s.stationuuid} station={s} />
        ))}
      </div>
    </div>
  );
};

export default CountryStations;
