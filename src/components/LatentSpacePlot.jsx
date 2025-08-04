import React, { useEffect } from 'react';

const PLOT_MARGIN = 40;

function drawGridAndAxes(ctx, width, height, bounds) {
  if (!bounds) return;
  const { xMin, xMax, yMin, yMax } = bounds;
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 0.5;
  const numGridLines = 10;
  const effectiveWidth = width - 2 * PLOT_MARGIN - 20;
  const effectiveHeight = height - 2 * PLOT_MARGIN - 20;
  const xScale = effectiveWidth / (xMax - xMin);
  const yScale = effectiveHeight / (yMax - yMin);
  const xOffset = PLOT_MARGIN + 10;
  const yOffset = PLOT_MARGIN + 10;

  for (let i = 0; i <= numGridLines; i++) {
    const xVal = xMin + (i / numGridLines) * (xMax - xMin);
    const xPixel = xOffset + (xVal - xMin) * xScale;
    ctx.beginPath();
    ctx.moveTo(xPixel, yOffset);
    ctx.lineTo(xPixel, height - yOffset);
    ctx.stroke();
  }
  for (let i = 0; i <= numGridLines; i++) {
    const yVal = yMin + (i / numGridLines) * (yMax - yMin);
    const yPixel = height - yOffset - (yVal - yMin) * yScale;
    ctx.beginPath();
    ctx.moveTo(xOffset, yPixel);
    ctx.lineTo(width - xOffset, yPixel);
    ctx.stroke();
  }
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(xOffset, height - yOffset);
  ctx.lineTo(width - xOffset, height - yOffset);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(xOffset, yOffset);
  ctx.lineTo(xOffset, height - yOffset);
  ctx.stroke();
  ctx.fillStyle = '#333';
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const xStep = (xMax - xMin) / 5;
  for (let i = 0; i <= 5; i++) {
    const val = xMin + i * xStep;
    const xPixel = xOffset + (val - xMin) * xScale;
    ctx.fillText(val.toFixed(1), xPixel, height - yOffset + 5);
  }
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const yStep = (yMax - yMin) / 5;
  for (let i = 0; i <= 5; i++) {
    const val = yMin + i * yStep;
    const yPixel = height - yOffset - (val - yMin) * yScale;
    ctx.fillText(val.toFixed(1), xOffset - 5, yPixel);
  }
}

const LatentSpacePlot = React.forwardRef((props, ref) => {
  const { latentCoords, latentSpaceBounds, latentData } = props;

  useEffect(() => {
    function draw() {
      if (
        ref.current &&
        latentCoords &&
        typeof latentCoords.x === 'number' &&
        typeof latentCoords.y === 'number' &&
        latentSpaceBounds &&
        latentData
      ) {
        const canvas = ref.current;
        const parent = canvas.parentElement;
        const visualWidth = parent.clientWidth;
        const visualHeight = visualWidth;
        canvas.width = visualWidth;
        canvas.height = visualHeight;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, visualWidth, visualHeight);
        drawGridAndAxes(ctx, visualWidth, visualHeight, latentSpaceBounds);
        const { xMin, xMax, yMin, yMax } = latentSpaceBounds;
        const effectiveWidth = visualWidth - 2 * PLOT_MARGIN - 20;
        const effectiveHeight = visualHeight - 2 * PLOT_MARGIN - 20;
        const xOffset = PLOT_MARGIN + 10;
        const yOffset = PLOT_MARGIN + 10;
        const xScale = effectiveWidth / (xMax - xMin);
        const yScale = effectiveHeight / (yMax - yMin);

        // Dibujar puntos y etiquetas
        latentData.forEach(({ x, y, label }) => {
          const xPixel = xOffset + (x - xMin) * xScale;
          const yPixel = visualHeight - yOffset - (y - yMin) * yScale;
          ctx.beginPath();
          ctx.arc(xPixel, yPixel, 3, 0, 2 * Math.PI);
          ctx.fillStyle = 'blue';
          ctx.fill();
          ctx.font = '12px Arial';
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(label, xPixel, yPixel - 5);
        });

        // Dibujar marcador (cruz) en la misma escala
        const markerX = xOffset + (latentCoords.x - xMin) * xScale;
        const markerY = visualHeight - yOffset - (latentCoords.y - yMin) * yScale;
        ctx.beginPath();
        ctx.moveTo(markerX - 6, markerY);
        ctx.lineTo(markerX + 6, markerY);
        ctx.moveTo(markerX, markerY - 6);
        ctx.lineTo(markerX, markerY + 6);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    draw();
    window.addEventListener('resize', draw);
    return () => {
      window.removeEventListener('resize', draw);
    };
  }, [latentCoords, latentSpaceBounds, latentData, ref]);

  return (
    <canvas ref={ref} className="w-full aspect-square mt-4 border border-gray-300 rounded-lg cursor-crosshair bg-white shadow-sm" />
  );
});

export default LatentSpacePlot;
