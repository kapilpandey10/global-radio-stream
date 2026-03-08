import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export const VolumeSlider = ({ value, onChange, className }: VolumeSliderProps) => {
  const percentage = value * 100;
  
  const VolumeIcon = value === 0 ? VolumeX : value < 0.5 ? Volume1 : Volume2;
  
  return (
    <div className={cn("w-full max-w-xs", className)}>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onChange(0)}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <VolumeX size={18} />
        </button>
        
        <div className="flex-1 relative h-12 flex items-center">
          {/* Track Background */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              {/* Filled Track */}
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full relative"
                style={{ width: `${percentage}%` }}
                layout
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
              >
                {/* Glow effect */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/50" />
              </motion.div>
            </div>
          </div>
          
          {/* Interactive Slider */}
          <input
            type="range"
            min={0}
            max={100}
            value={percentage}
            onChange={(e) => onChange(Number(e.target.value) / 100)}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
          
          {/* Volume Level Indicators */}
          <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-0.5">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-0.5 rounded-full transition-all duration-200",
                  i < Math.floor(value * 10) 
                    ? "h-3 bg-primary-foreground/30" 
                    : "h-1.5 bg-muted-foreground/20"
                )}
              />
            ))}
          </div>
        </div>
        
        <button 
          onClick={() => onChange(1)}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Volume2 size={18} />
        </button>
      </div>
      
      {/* Volume Percentage */}
      <div className="text-center mt-2">
        <span className="text-xs text-muted-foreground font-medium">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};
