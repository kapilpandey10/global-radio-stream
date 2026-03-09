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

  const handleTrackInteraction = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onChange(ratio);
  }, [onChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleTrackInteraction(e.clientX);
    
    const handleMove = (ev: PointerEvent) => handleTrackInteraction(ev.clientX);
    const handleUp = () => {
      setIsDragging(false);
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  }, [handleTrackInteraction]);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onChange(value === 0 ? 0.5 : 0)}
          className="text-muted-foreground/60 active:scale-90 transition-all shrink-0"
        >
          <VolumeX size={14} />
        </button>
        
        <div className="flex-1 relative">
          <div 
            ref={trackRef}
            className="relative h-8 flex items-center cursor-pointer touch-none group"
            onPointerDown={handlePointerDown}
          >
            <div className="w-full h-[5px] bg-muted rounded-full overflow-hidden relative">
              <motion.div
                className="h-full rounded-full bg-muted-foreground/40"
                style={{ width: `${percentage}%` }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.05 }}
              />
            </div>
            
            <motion.div 
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-foreground shadow-sm pointer-events-none transition-transform",
                isDragging && "scale-110"
              )}
              style={{ left: `calc(${percentage}% - 10px)` }}
            />
          </div>
        </div>

        <button 
          onClick={() => onChange(1)}
          className="text-muted-foreground/60 active:scale-90 transition-all shrink-0"
        >
          <Volume2 size={14} />
        </button>
      </div>
    </div>
  );
};
