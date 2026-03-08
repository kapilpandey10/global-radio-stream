import { useState } from "react";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface StationLogoProps {
  src?: string;
  name: string;
  frequency?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  playing?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: "h-12 w-12",
  sm: "h-14 w-14",
  md: "h-16 w-16",
  lg: "h-24 w-24",
  xl: "h-full w-full",
};

const textSizes = {
  xs: "text-[10px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
  xl: "text-3xl",
};

const frequencySizes = {
  xs: "text-[8px]",
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-lg",
};

export const StationLogo = ({ src, name, frequency, size = "md", playing, className }: StationLogoProps) => {
  const [error, setError] = useState(false);

  // Get initials from station name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(word => word.length > 0)
      .slice(0, 2)
      .map(word => word[0])
      .join("")
      .toUpperCase();
  };

  // Generate gradient based on name
  const getGradient = (name: string) => {
    const colors = [
      "from-rose-500 to-orange-400",
      "from-violet-500 to-purple-400",
      "from-blue-500 to-cyan-400",
      "from-emerald-500 to-teal-400",
      "from-amber-500 to-yellow-400",
      "from-pink-500 to-rose-400",
      "from-indigo-500 to-blue-400",
    ];
    const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (src && !error) {
    return (
      <div className={cn(sizeClasses[size], "relative overflow-hidden bg-muted rounded-2xl", className)}>
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
        {playing && <PlayingIndicator size={size} />}
      </div>
    );
  }

  // Fallback: Show station name and frequency
  return (
    <div
      className={cn(
        sizeClasses[size],
        "relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br rounded-2xl",
        getGradient(name),
        className
      )}
    >
      <span className={cn("font-bold text-white text-center px-1 leading-tight", textSizes[size])}>
        {size === "xl" ? name.slice(0, 20) : getInitials(name)}
      </span>
      {frequency && size !== "xs" && (
        <span className={cn("text-white/80 font-medium mt-0.5", frequencySizes[size])}>
          {frequency}
        </span>
      )}
      {!frequency && size === "xl" && (
        <span className={cn("text-white/70 font-medium mt-1", frequencySizes[size])}>
          Live Radio
        </span>
      )}
      {playing && <PlayingIndicator size={size} />}
    </div>
  );
};

const PlayingIndicator = ({ size }: { size: string }) => {
  const barSize = size === "xl" ? "h-6" : size === "lg" ? "h-4" : "h-2";
  
  return (
    <div className="absolute bottom-1 right-1 flex items-end gap-0.5 p-1 rounded-md bg-black/30 backdrop-blur-sm">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn("w-0.5 bg-white rounded-full", barSize)}
          style={{
            animation: `equalizer 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes equalizer {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};
