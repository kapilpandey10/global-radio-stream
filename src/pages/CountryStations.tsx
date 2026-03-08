import { useParams, useNavigate } from "react-router-dom";
import { useStationsByCountry } from "@/hooks/useRadioAPI";
import { StationCard } from "@/components/StationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";

const CountryStations = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { data: stations, isLoading } = useStationsByCountry(code || "");
  const countryName = stations?.[0]?.country || code;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-5 pt-14 pb-2 flex items-center gap-2">
        <button onClick={() => navigate("/countries")} className="p-1 -ml-1 active:scale-90 transition-transform">
          <ChevronLeft size={28} className="text-primary" />
        </button>
        <div className="flex items-center gap-2.5">
          {code && (
            <img
              src={`https://flagcdn.com/32x24/${code.toLowerCase()}.png`}
              alt={countryName}
              className="h-6 rounded-[3px] shadow-sm"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{countryName}</h1>
        </div>
        {stations && <span className="text-sm text-muted-foreground ml-auto">{stations.length}</span>}
      </div>

      <div className="px-4 mt-2">
        {isLoading ? Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-[60px] rounded-xl mb-1" />
        )) : stations?.map(s => (
          <StationCard key={s.stationuuid} station={s} />
        ))}
      </div>
    </div>
  );
};

export default CountryStations;
