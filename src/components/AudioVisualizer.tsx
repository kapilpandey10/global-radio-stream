import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  className?: string;
}

// CSS-based fallback visualizer for iOS/CORS-restricted streams
const FallbackVisualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  const barCount = 32;
  return (
    <div className="flex items-end justify-center gap-[2px] h-24 px-2">
      {Array.from({ length: barCount }).map((_, i) => {
        const baseDelay = (i / barCount) * 1.2;
        const height = 20 + Math.sin(i * 0.5) * 15;
        return (
          <motion.div
            key={i}
            className="w-[3px] rounded-full bg-primary origin-bottom"
            animate={isPlaying ? {
              scaleY: [0.15, 0.4 + Math.random() * 0.6, 0.2, 0.5 + Math.random() * 0.5, 0.15],
              opacity: [0.4, 0.9, 0.5, 1, 0.4],
            } : {
              scaleY: 0.08,
              opacity: 0.2,
            }}
            transition={isPlaying ? {
              repeat: Infinity,
              duration: 1.2 + Math.random() * 0.8,
              delay: baseDelay,
              ease: "easeInOut",
            } : {
              duration: 0.5,
            }}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
};

export const AudioVisualizer = ({ analyser, isPlaying, className }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [hasRealData, setHasRealData] = useState(false);
  const checkCountRef = useRef(0);

  useEffect(() => {
    setHasRealData(false);
    checkCountRef.current = 0;
  }, [analyser]);

  useEffect(() => {
    if (!canvasRef.current || !analyser || !isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barCount = 48;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    const draw = () => {
      if (!isPlaying) return;
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Check if we're getting real data (first few frames)
      if (checkCountRef.current < 30) {
        checkCountRef.current++;
        const sum = dataArray.reduce((a, b) => a + b, 0);
        if (sum > 0) {
          setHasRealData(true);
        } else if (checkCountRef.current >= 30) {
          setHasRealData(false);
        }
      }

      ctx.clearRect(0, 0, w, h);

      const barWidth = (w / barCount) - 2;
      
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength * 0.7);
        const amplitude = dataArray[dataIndex] / 255;
        const barHeight = Math.max(2, amplitude * h * 0.85);
        
        const x = i * (barWidth + 2);
        const y = h - barHeight;

        // Gradient bar
        const hue = 262 + (i / barCount) * 30;
        const gradient = ctx.createLinearGradient(x, h, x, y);
        gradient.addColorStop(0, `hsla(${hue}, 83%, 58%, 0.3)`);
        gradient.addColorStop(0.5, `hsla(${hue}, 83%, 63%, ${0.5 + amplitude * 0.4})`);
        gradient.addColorStop(1, `hsla(${hue}, 83%, 73%, ${amplitude})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();

        // Top cap glow
        if (amplitude > 0.1) {
          ctx.fillStyle = `hsla(${hue}, 83%, 80%, ${amplitude * 0.8})`;
          ctx.beginPath();
          ctx.roundRect(x, y - 2, barWidth, 3, 1);
          ctx.fill();
        }
      }
    };

    draw();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [analyser, isPlaying]);

  // Use fallback when no analyser or no real audio data detected
  const useFallback = !analyser || !hasRealData;

  return (
    <div className={cn("w-full h-24 rounded-xl overflow-hidden", !isPlaying && "opacity-30", className)}>
      {useFallback ? (
        <FallbackVisualizer isPlaying={isPlaying} />
      ) : (
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ imageRendering: "auto" }}
        />
      )}
    </div>
  );
};
