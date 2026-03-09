import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface VolumeKnobProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export const VolumeKnob = ({ value, onChange, className }: VolumeKnobProps) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const percentage = Math.round(value * 100);
  
  // Rotation: 0% = -135deg, 100% = 135deg (270deg range)
  const minAngle = -135;
  const maxAngle = 135;
  const rotation = minAngle + (maxAngle - minAngle) * value;

  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    if (!knobRef.current) return;
    
    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle from center
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Convert to our rotation range (-135 to 135)
    // atan2 gives -180 to 180, where 0 is right
    angle = angle + 90; // Rotate so 0 is top
    
    // Normalize to -180 to 180
    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;
    
    // Clamp to our range
    if (angle < minAngle) angle = minAngle;
    if (angle > maxAngle) angle = maxAngle;
    
    // Convert angle to value (0-1)
    const newValue = (angle - minAngle) / (maxAngle - minAngle);
    onChange(Math.max(0, Math.min(1, newValue)));
  }, [onChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleInteraction(e.clientX, e.clientY);
    
    const handleMove = (ev: PointerEvent) => {
      handleInteraction(ev.clientX, ev.clientY);
    };
    
    const handleUp = () => {
      setIsDragging(false);
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
    
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  }, [handleInteraction]);

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Volume Label */}
      <div className="text-center">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Volume
        </div>
        <motion.div 
          key={percentage}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl font-bold text-foreground"
        >
          {percentage}
        </motion.div>
      </div>

      {/* Knob */}
      <div 
        ref={knobRef}
        className="relative w-32 h-32 cursor-pointer touch-none select-none"
        onPointerDown={handlePointerDown}
      >
        {/* Outer ring track */}
        <svg 
          className="absolute inset-0 -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="4"
            strokeDasharray="212 424"
            strokeLinecap="round"
          />
          {/* Active arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeDasharray={`${212 * value} 424`}
            strokeLinecap="round"
            style={{ transition: isDragging ? 'none' : 'stroke-dasharray 0.1s ease-out' }}
          />
        </svg>

        {/* Knob center */}
        <motion.div 
          className="absolute inset-[12px] rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 shadow-xl flex items-center justify-center"
          animate={{ 
            rotate: rotation,
            scale: isDragging ? 1.05 : 1
          }}
          transition={{ 
            rotate: { duration: isDragging ? 0 : 0.1 },
            scale: { duration: 0.1 }
          }}
        >
          {/* Indicator dot */}
          <div className="absolute top-3 w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
          
          {/* Center glow */}
          <div className="w-12 h-12 rounded-full bg-background shadow-inner flex items-center justify-center">
            <div className={cn(
              "w-8 h-8 rounded-full transition-all duration-300",
              value > 0 
                ? "bg-primary/20 shadow-[0_0_20px_rgba(124,58,237,0.3)]" 
                : "bg-muted"
            )} />
          </div>
        </motion.div>
      </div>

      {/* Volume indicators */}
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-150",
              value * 5 > i ? "bg-primary scale-110" : "bg-muted scale-100"
            )}
          />
        ))}
      </div>
    </div>
  );
};
