import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export const VolumeSlider = ({ value, onChange, className }: VolumeSliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const percentage = Math.round(value * 100);
  
  const VolumeIcon = value === 0 ? VolumeX : value < 0.5 ? Volume1 : Volume2;

  const handleTrackInteraction = useCallback((clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    // Invert: top = max, bottom = min
    const ratio = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
    onChange(ratio);
  }, [onChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleTrackInteraction(e.clientY);
    
    const handleMove = (ev: PointerEvent) => handleTrackInteraction(ev.clientY);
    const handleUp = () => {
      setIsDragging(false);
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  }, [handleTrackInteraction]);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Max icon */}
      <button 
        onClick={() => onChange(1)}
        className="text-muted-foreground hover:text-primary transition-colors active:scale-90"
      >
        <Volume2 size={16} />
      </button>

      {/* Vertical track */}
      <div className="relative h-32">
        <div 
          ref={trackRef}
          className="relative w-10 h-full flex justify-center cursor-pointer touch-none group"
          onPointerDown={handlePointerDown}
        >
          {/* Background track */}
          <div className="w-1.5 h-full bg-muted rounded-full overflow-hidden relative">
            {/* Fill from bottom */}
            <motion.div
              className="absolute bottom-0 left-0 w-full rounded-full bg-primary"
              style={{ height: `${percentage}%` }}
              animate={{ height: `${percentage}%` }}
              transition={{ duration: 0.05 }}
            />
          </div>
          
          {/* Thumb */}
          <motion.div 
            className={cn(
              "absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-foreground shadow-md pointer-events-none transition-transform",
              isDragging && "scale-125"
            )}
            style={{ bottom: `calc(${percentage}% - 8px)` }}
          />
        </div>
      </div>

      {/* Percentage */}
      <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">
        {percentage}
      </span>

      {/* Mute icon */}
      <button 
        onClick={() => onChange(value === 0 ? 0.5 : 0)}
        className="text-muted-foreground hover:text-primary transition-colors active:scale-90"
      >
        <VolumeIcon size={16} />
      </button>
    </div>
  );
};
