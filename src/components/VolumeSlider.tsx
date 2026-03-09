import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export const VolumeSlider = ({ value, onChange, className }: VolumeSliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showValue, setShowValue] = useState(false);
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
    setShowValue(true);
    handleTrackInteraction(e.clientX);
    
    const handleMove = (ev: PointerEvent) => handleTrackInteraction(ev.clientX);
    const handleUp = () => {
      setIsDragging(false);
      setTimeout(() => setShowValue(false), 1000);
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  }, [handleTrackInteraction]);

  return (
    <div className={cn("w-full max-w-sm", className)}>
      {/* Volume value display */}
      <AnimatePresence>
        {(showValue || isDragging) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mb-3"
          >
            <motion.div 
              key={percentage}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            >
              <VolumeIcon size={16} className="text-primary" />
              <span className="text-lg font-bold text-primary tabular-nums">
                {percentage}%
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => onChange(value === 0 ? 0.5 : 0)}
          onMouseEnter={() => setShowValue(true)}
          onMouseLeave={() => !isDragging && setShowValue(false)}
          className="text-muted-foreground hover:text-primary transition-all hover:scale-110 active:scale-95"
        >
          <VolumeX size={20} />
        </button>
        
        <div className="flex-1 relative">
          <div 
            ref={trackRef}
            className="relative h-12 flex items-center cursor-pointer touch-none group"
            onPointerDown={handlePointerDown}
            onMouseEnter={() => setShowValue(true)}
            onMouseLeave={() => !isDragging && setShowValue(false)}
          >
            {/* Track background */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative">
              {/* Gradient fill */}
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary/60 via-primary to-primary"
                style={{ width: `${percentage}%` }}
                initial={false}
                animate={{ 
                  width: `${percentage}%`,
                  opacity: isDragging ? 1 : 0.9
                }}
                transition={{ duration: 0.05 }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2, 
                    ease: "linear",
                    repeatDelay: 0.5
                  }}
                />
              </motion.div>
              
              {/* Tick marks */}
              <div className="absolute inset-0 flex justify-between px-1">
                {[...Array(11)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-px h-1 rounded-full transition-all",
                      i * 10 <= percentage 
                        ? "bg-white/40" 
                        : "bg-muted-foreground/20"
                    )}
                  />
                ))}
              </div>
            </div>
            
            {/* Thumb */}
            <motion.div 
              className={cn(
                "absolute top-1/2 -translate-y-1/2 rounded-full shadow-xl transition-all pointer-events-none",
                "bg-gradient-to-br from-foreground to-foreground/80",
                isDragging ? "w-5 h-5 shadow-2xl" : "w-4 h-4 group-hover:w-5 group-hover:h-5"
              )}
              style={{ left: `calc(${percentage}% - ${isDragging ? 10 : 8}px)` }}
              animate={{
                scale: isDragging ? 1.1 : 1,
                boxShadow: isDragging 
                  ? "0 0 20px rgba(124, 58, 237, 0.6), 0 10px 30px rgba(0, 0, 0, 0.3)"
                  : "0 2px 8px rgba(0, 0, 0, 0.2)"
              }}
            >
              {/* Inner glow */}
              <div className={cn(
                "absolute inset-[2px] rounded-full bg-primary transition-opacity",
                isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-70"
              )} />
            </motion.div>

            {/* Glow effect under thumb when dragging */}
            <AnimatePresence>
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/20 blur-xl pointer-events-none"
                  style={{ left: `calc(${percentage}% - 32px)` }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Volume level indicators */}
          <div className="flex justify-between mt-1 px-0.5">
            {[0, 25, 50, 75, 100].map((level) => (
              <div key={level} className="flex flex-col items-center gap-0.5">
                <div className={cn(
                  "w-1 h-1 rounded-full transition-all",
                  percentage >= level 
                    ? "bg-primary scale-110" 
                    : "bg-muted-foreground/30 scale-100"
                )} />
                <span className={cn(
                  "text-[9px] font-medium transition-colors tabular-nums",
                  percentage >= level 
                    ? "text-primary" 
                    : "text-muted-foreground/50"
                )}>
                  {level}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <button 
          onClick={() => onChange(1)}
          onMouseEnter={() => setShowValue(true)}
          onMouseLeave={() => !isDragging && setShowValue(false)}
          className="text-muted-foreground hover:text-primary transition-all hover:scale-110 active:scale-95"
        >
          <Volume2 size={20} />
        </button>
      </div>
    </div>
  );
};
