import { useState } from "react";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface StationLogoProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  pulse?: boolean;
}

const sizes = {
  sm: "h-10 w-10 text-xs",
  md: "h-14 w-14 text-sm",
  lg: "h-24 w-24 text-lg",
  xl: "h-40 w-40 text-2xl",
};

const iconSizes = { sm: 16, md: 20, lg: 32, xl: 48 };

export const StationLogo = ({ src, name, size = "md", className, pulse }: StationLogoProps) => {
  const [imgError, setImgError] = useState(false);
  const initials = name?.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";

  return (
    <div className={cn(
      "relative rounded-2xl overflow-hidden flex items-center justify-center shrink-0",
      "bg-secondary border border-border/50",
      sizes[size],
      pulse && "animate-pulse-glow",
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
          {size !== "sm" && <span className="font-display font-semibold text-muted-foreground">{initials}</span>}
        </div>
      )}
    </div>
  );
};
