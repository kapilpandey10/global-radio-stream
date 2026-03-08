import { useState } from "react";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface StationLogoProps {
  src?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  playing?: boolean;
}

const sizes = {
  xs: "h-8 w-8",
  sm: "h-11 w-11",
  md: "h-14 w-14",
  lg: "h-24 w-24",
  xl: "h-44 w-44",
};

const iconSizes = { xs: 12, sm: 16, md: 20, lg: 32, xl: 48 };
const textSizes = { xs: "text-[8px]", sm: "text-[10px]", md: "text-xs", lg: "text-base", xl: "text-xl" };

export const StationLogo = ({ src, name, size = "md", className, playing }: StationLogoProps) => {
  const [imgError, setImgError] = useState(false);
  const initials = name?.split(" ").slice(0, 2).map(w => w?.[0]).join("").toUpperCase() || "?";

  return (
    <div className={cn(
      "relative rounded-2xl overflow-hidden flex items-center justify-center shrink-0",
      "bg-secondary",
      sizes[size],
      playing && "ring-2 ring-primary/40",
      className,
    )}>
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <Radio size={iconSizes[size]} className="text-primary" />
          {(size !== "xs" && size !== "sm") && (
            <span className={cn("font-semibold text-muted-foreground", textSizes[size])}>{initials}</span>
          )}
        </div>
      )}
      {/* Playing indicator */}
      {playing && (
        <div className="absolute bottom-1 right-1 flex items-end gap-[2px] h-3">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-[3px] bg-primary rounded-full"
              style={{
                animation: `eq-bar 0.${4 + i * 2}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.15}s`,
                height: "4px",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
