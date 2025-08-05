import React, { useEffect, useRef, useCallback } from 'react';
import { CONFIG } from '../config/constants';
import { isValidLatentCoords, isValidBounds, isValidLatentData } from '../utils/validation';
import { worldToPixel } from '../utils/math';
import { throttle } from '../utils/performance';

/**
 * Dibuja la grilla y los ejes del gráfico
 */
const drawGridAndAxes = (ctx, width, height, bounds) => {
  if (!isValidBounds(bounds)) return;
  
  const { xMin, xMax, yMin, yMax } = bounds;
  const effectiveWidth = width - 2 * CONFIG.PLOT_MARGIN - 2 * CONFIG.PLOT_OFFSET;
  const effectiveHeight = height - 2 * CONFIG.PLOT_MARGIN - 2 * CONFIG.PLOT_OFFSET;
  const xOffset = CONFIG.PLOT_MARGIN + CONFIG.PLOT_OFFSET;
  const yOffset = CONFIG.PLOT_MARGIN + CONFIG.PLOT_OFFSET;

  // Configurar estilo de grilla
  ctx.strokeStyle = CONFIG.COLORS.GRID;
  ctx.lineWidth = 0.5;

  // Dibujar líneas de grilla
  for (let i = 0; i <= CONFIG.PLOT_GRID_LINES; i++) {
    const xVal = xMin + (i / CONFIG.PLOT_GRID_LINES) * (xMax - xMin);
    const xPixel = xOffset + (xVal - xMin) * (effectiveWidth / (xMax - xMin));
    
    ctx.beginPath();
    ctx.moveTo(xPixel, yOffset);
    ctx.lineTo(xPixel, height - yOffset);
    ctx.stroke();
  }

  for (let i = 0; i <= CONFIG.PLOT_GRID_LINES; i++) {
    const yVal = yMin + (i / CONFIG.PLOT_GRID_LINES) * (yMax - yMin);
    const yPixel = height - yOffset - (yVal - yMin) * (effectiveHeight / (yMax - yMin));
    
    ctx.beginPath();
    ctx.moveTo(xOffset, yPixel);
    ctx.lineTo(width - xOffset, yPixel);
    ctx.stroke();
  }

  // Dibujar ejes principales
  ctx.strokeStyle = CONFIG.COLORS.AXES;
  ctx.lineWidth = 1;
  
  // Eje X
  ctx.beginPath();
  ctx.moveTo(xOffset, height - yOffset);
  ctx.lineTo(width - xOffset, height - yOffset);
  ctx.stroke();
  
  // Eje Y
  ctx.beginPath();
  ctx.moveTo(xOffset, yOffset);
  ctx.lineTo(xOffset, height - yOffset);
  ctx.stroke();

  // Etiquetas de los ejes
  ctx.fillStyle = CONFIG.COLORS.TEXT;
  ctx.font = CONFIG.FONTS.AXIS_LABEL;
  
  // Etiquetas del eje X
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const xStep = (xMax - xMin) / 5;
  for (let i = 0; i <= 5; i++) {
    const val = xMin + i * xStep;
    const xPixel = xOffset + (val - xMin) * (effectiveWidth / (xMax - xMin));
    ctx.fillText(val.toFixed(CONFIG.DISPLAY_PRECISION), xPixel, height - yOffset + 5);
  }

  // Etiquetas del eje Y
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const yStep = (yMax - yMin) / 5;
  for (let i = 0; i <= 5; i++) {
    const val = yMin + i * yStep;
    const yPixel = height - yOffset - (val - yMin) * (effectiveHeight / (yMax - yMin));
    ctx.fillText(val.toFixed(CONFIG.DISPLAY_PRECISION), xOffset - 5, yPixel);
  }
};

const LatentSpacePlot = React.forwardRef((props, ref) => {
  const { latentCoords, latentSpaceBounds, latentData } = props;
  const animationFrameRef = useRef();

  const draw = useCallback(() => {
    if (
      !ref.current ||
      !isValidLatentCoords(latentCoords) ||
      !isValidBounds(latentSpaceBounds) ||
      !isValidLatentData(latentData)
    ) {
      return;
    }

    const canvas = ref.current;
    const parent = canvas.parentElement;
    const visualWidth = parent.clientWidth;
    const visualHeight = visualWidth; // Mantener aspecto cuadrado
    
    // Actualizar dimensiones del canvas
    canvas.width = visualWidth;
    canvas.height = visualHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, visualWidth, visualHeight);
    
    // Dibujar grilla y ejes
    drawGridAndAxes(ctx, visualWidth, visualHeight, latentSpaceBounds);
    
    const canvasInfo = {
      width: visualWidth,
      height: visualHeight,
      xOffset: CONFIG.PLOT_MARGIN + CONFIG.PLOT_OFFSET,
      yOffset: CONFIG.PLOT_MARGIN + CONFIG.PLOT_OFFSET
    };

    // Dibujar puntos de datos y etiquetas
    latentData.forEach(({ x, y, label }) => {
      const pixelCoords = worldToPixel({ x, y }, latentSpaceBounds, canvasInfo);
      
      // Dibujar punto
      ctx.beginPath();
      ctx.arc(pixelCoords.x, pixelCoords.y, CONFIG.PLOT_POINT_SIZE, 0, 2 * Math.PI);
      ctx.fillStyle = CONFIG.COLORS.POINT;
      ctx.fill();
      ctx.strokeStyle = CONFIG.COLORS.PRIMARY_HOVER;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Dibujar etiqueta
      ctx.font = CONFIG.FONTS.POINT_LABEL;
      ctx.fillStyle = CONFIG.COLORS.TEXT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(label, pixelCoords.x, pixelCoords.y - CONFIG.PLOT_POINT_SIZE - 2);
    });

    // Dibujar marcador actual (cruz roja)
    const markerPixels = worldToPixel(latentCoords, latentSpaceBounds, canvasInfo);
    ctx.beginPath();
    ctx.moveTo(markerPixels.x - 6, markerPixels.y);
    ctx.lineTo(markerPixels.x + 6, markerPixels.y);
    ctx.moveTo(markerPixels.x, markerPixels.y - 6);
    ctx.lineTo(markerPixels.x, markerPixels.y + 6);
    ctx.strokeStyle = CONFIG.COLORS.MARKER;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [latentCoords, latentSpaceBounds, latentData, ref]);

  // Versión throttled del dibujo para resize
  const throttledDraw = useCallback(throttle(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(draw);
  }, 16), [draw]); // ~60fps

  useEffect(() => {
    // Dibujar inmediatamente cuando cambien las dependencias
    draw();
    
    // Configurar listener para resize
    window.addEventListener('resize', throttledDraw);
    
    return () => {
      window.removeEventListener('resize', throttledDraw);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draw, throttledDraw]);

  return (
    <canvas 
      ref={ref} 
      className="w-full aspect-square mt-4 border border-gray-300 rounded-lg cursor-crosshair bg-white shadow-sm" 
      role="img"
      aria-label="Gráfico del espacio latente interactivo"
    />
  );
});

LatentSpacePlot.displayName = 'LatentSpacePlot';

export default LatentSpacePlot;
