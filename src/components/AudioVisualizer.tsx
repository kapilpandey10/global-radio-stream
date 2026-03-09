import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  className?: string;
}

export const AudioVisualizer = ({ analyser, isPlaying, className }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current || !analyser || !isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Clear canvas when not playing
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;
    const radius = Math.min(centerX, centerY) * 0.6;
    const barCount = 64;

    const draw = () => {
      if (!isPlaying) return;

      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Clear with fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw circular visualizer
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const amplitude = dataArray[dataIndex] / 255;
        
        const angle = (i / barCount) * Math.PI * 2;
        const barLength = amplitude * radius * 0.8;
        
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barLength);
        const y2 = centerY + Math.sin(angle) * (radius + barLength);

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, `hsla(262, 83%, 58%, ${amplitude * 0.3})`);
        gradient.addColorStop(0.5, `hsla(262, 83%, 68%, ${amplitude * 0.6})`);
        gradient.addColorStop(1, `hsla(262, 83%, 78%, ${amplitude})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Draw glowing center circle
      const avgAmplitude = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32 / 255;
      const glowRadius = radius * 0.3 * (1 + avgAmplitude * 0.5);
      
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
      glowGradient.addColorStop(0, `hsla(262, 83%, 68%, ${0.4 + avgAmplitude * 0.3})`);
      glowGradient.addColorStop(0.5, `hsla(262, 83%, 58%, ${0.2 + avgAmplitude * 0.2})`);
      glowGradient.addColorStop(1, "hsla(262, 83%, 48%, 0)");
      
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "w-full h-32 rounded-xl",
        !isPlaying && "opacity-30",
        className
      )}
      style={{ imageRendering: "auto" }}
    />
  );
};
