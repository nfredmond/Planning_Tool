import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

interface AudioWaveformProps {
  audioLevel: number;
  active: boolean;
  barCount?: number;
  minHeight?: number;
  maxHeight?: number;
  barWidth?: number;
  barGap?: number;
  baseColor?: string;
  activeColor?: string;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioLevel,
  active,
  barCount = 5,
  minHeight = 3,
  maxHeight = 30,
  barWidth = 3,
  barGap = 3,
  baseColor = '#e0e0e0',
  activeColor = '#f44336'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Scale the audio level to our visual range
  const normalizedLevel = active 
    ? (audioLevel / 255) * (maxHeight - minHeight) + minHeight
    : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate dimensions
    const totalWidth = (barWidth + barGap) * barCount - barGap;
    const startX = (canvas.width - totalWidth) / 2;
    const midY = canvas.height / 2;
    
    // Draw the bars
    for (let i = 0; i < barCount; i++) {
      // Create a random height for each bar but maintain the overall pattern
      const randomFactor = active ? Math.random() * 0.5 + 0.5 : Math.random() * 0.2 + 0.1;
      const barHeight = active
        ? Math.max(minHeight, normalizedLevel * randomFactor)
        : minHeight + Math.random() * 3;
      
      const x = startX + i * (barWidth + barGap);
      
      // Use gradient for active state
      if (active) {
        const gradient = ctx.createLinearGradient(0, midY - barHeight / 2, 0, midY + barHeight / 2);
        gradient.addColorStop(0, activeColor);
        gradient.addColorStop(1, `${activeColor}80`); // 50% transparent
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = baseColor;
      }
      
      // Draw rounded rectangle for each bar
      roundRect(
        ctx, 
        x, 
        midY - barHeight / 2, 
        barWidth, 
        barHeight, 
        barWidth / 2
      );
    }
  }, [audioLevel, active, barCount, minHeight, maxHeight, barWidth, barGap, baseColor, activeColor]);
  
  // Helper function for drawing rounded rectangles
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <canvas
        ref={canvasRef}
        width={40}
        height={40}
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    </Box>
  );
};

export default AudioWaveform; 