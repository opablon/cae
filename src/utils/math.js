/**
 * Utilidades matemáticas para el proyecto
 */

/**
 * Limita un valor entre un mínimo y máximo
 * @param {number} value - Valor a limitar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number}
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Mapea un valor de un rango a otro
 * @param {number} value - Valor a mapear
 * @param {number} fromMin - Mínimo del rango origen
 * @param {number} fromMax - Máximo del rango origen
 * @param {number} toMin - Mínimo del rango destino
 * @param {number} toMax - Máximo del rango destino
 * @returns {number}
 */
export const mapRange = (value, fromMin, fromMax, toMin, toMax) => {
  return toMin + ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin);
};

/**
 * Calcula la escala para convertir coordenadas del mundo a píxeles
 * @param {Object} bounds - Límites del mundo {xMin, xMax, yMin, yMax}
 * @param {number} width - Ancho disponible en píxeles
 * @param {number} height - Alto disponible en píxeles
 * @returns {Object} - Escalas {xScale, yScale}
 */
export const calculateScale = (bounds, width, height) => {
  const xScale = width / (bounds.xMax - bounds.xMin);
  const yScale = height / (bounds.yMax - bounds.yMin);
  return { xScale, yScale };
};

/**
 * Convierte coordenadas del mundo a coordenadas de píxeles
 * @param {Object} worldCoords - Coordenadas del mundo {x, y}
 * @param {Object} bounds - Límites del mundo
 * @param {Object} canvasInfo - Información del canvas {width, height, xOffset, yOffset}
 * @returns {Object} - Coordenadas en píxeles {x, y}
 */
export const worldToPixel = (worldCoords, bounds, canvasInfo) => {
  const { width, height, xOffset, yOffset } = canvasInfo;
  const effectiveWidth = width - 2 * xOffset;
  const effectiveHeight = height - 2 * yOffset;
  
  const xPixel = xOffset + mapRange(worldCoords.x, bounds.xMin, bounds.xMax, 0, effectiveWidth);
  const yPixel = height - yOffset - mapRange(worldCoords.y, bounds.yMin, bounds.yMax, 0, effectiveHeight);
  
  return { x: xPixel, y: yPixel };
};

/**
 * Convierte coordenadas de píxeles a coordenadas del mundo
 * @param {Object} pixelCoords - Coordenadas en píxeles {x, y}
 * @param {Object} bounds - Límites del mundo
 * @param {Object} canvasInfo - Información del canvas {width, height, xOffset, yOffset}
 * @returns {Object} - Coordenadas del mundo {x, y}
 */
export const pixelToWorld = (pixelCoords, bounds, canvasInfo) => {
  const { width, height, xOffset, yOffset } = canvasInfo;
  const effectiveWidth = width - 2 * xOffset;
  const effectiveHeight = height - 2 * yOffset;
  
  const worldX = mapRange(pixelCoords.x - xOffset, 0, effectiveWidth, bounds.xMin, bounds.xMax);
  const worldY = mapRange(height - yOffset - pixelCoords.y, 0, effectiveHeight, bounds.yMin, bounds.yMax);
  
  return { x: worldX, y: worldY };
};
