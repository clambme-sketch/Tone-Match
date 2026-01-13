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
      
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; // Blue fill
        ctx.beginPath();
        
        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height;
          ctx.fillRect(x, height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
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
    <div className="w-full h-24 bg-gray-900 rounded-lg overflow-hidden border border-gray-800 shadow-inner">
      <canvas ref={canvasRef} width={600} height={100} className="w-full h-full" />
    </div>
  );
};

export default Visualizer;