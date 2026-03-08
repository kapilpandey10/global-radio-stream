import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useRef } from "react";

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export const VolumeSlider = ({ value, onChange, className }: VolumeSliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
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
    handleTrackInteraction(e.clientX);
    
    const handleMove = (ev: PointerEvent) => handleTrackInteraction(ev.clientX);
    const handleUp = () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  }, [handleTrackInteraction]);

  return (
    <div className={cn("w-full max-w-xs", className)}>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onChange(value === 0 ? 0.5 : 0)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <VolumeX size={16} />
        </button>
        
        <div 
          ref={trackRef}
          className="flex-1 relative h-10 flex items-center cursor-pointer touch-none"
          onPointerDown={handlePointerDown}
        >
          {/* Track */}
          <div className="w-full h-[6px] bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-[width] duration-75 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          {/* Thumb */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-foreground rounded-full shadow-md transition-[left] duration-75 ease-out pointer-events-none"
            style={{ left: `calc(${percentage}% - 8px)` }}
          />
        </div>
        
        <button 
          onClick={() => onChange(1)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Volume2 size={16} />
        </button>
      </div>
    </div>
  );
};
