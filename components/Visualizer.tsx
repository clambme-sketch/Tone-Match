import React, { useEffect, useRef } from 'react';
import { audioService } from '../services/AudioEngine';

const Visualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const analyser = audioService.getAnalyser();
      
      // Use internal resolution
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear
      ctx.fillStyle = '#111827'; // match gray-900 roughly
      ctx.fillRect(0, 0, width, height);
      
      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        
        // --- FREQUENCY SPECTRUM ---
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // Draw bars across the full width
        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height;
          // Simple gradient based on height/intensity
          ctx.fillStyle = `rgba(59, 130, 246, ${Math.max(0.1, dataArray[i] / 255)})`; 
          ctx.fillRect(x, height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
          
          // Stop if we go off screen
          if (x > width) break;
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-32 bg-gray-900 rounded-lg overflow-hidden border border-gray-800 shadow-inner">
      <canvas ref={canvasRef} width={800} height={200} className="w-full h-full" />
    </div>
  );
};

export default Visualizer;