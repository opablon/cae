/**
 * Utilidades para validación de datos
 */

/**
 * Valida si un valor es un número válido
 * @param {any} value - Valor a validar
 * @returns {boolean}
 */
export const isValidNumber = (value) => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * Valida si las coordenadas latentes son válidas
 * @param {Object} coords - Coordenadas {x, y}
 * @returns {boolean}
 */
export const isValidLatentCoords = (coords) => {
  return coords && 
         isValidNumber(coords.x) && 
         isValidNumber(coords.y);
};

/**
 * Valida si los límites del espacio latente son válidos
 * @param {Object} bounds - Límites {xMin, xMax, yMin, yMax}
 * @returns {boolean}
 */
export const isValidBounds = (bounds) => {
  return bounds &&
         isValidNumber(bounds.xMin) &&
         isValidNumber(bounds.xMax) &&
         isValidNumber(bounds.yMin) &&
         isValidNumber(bounds.yMax) &&
         bounds.xMax > bounds.xMin &&
         bounds.yMax > bounds.yMin;
};

/**
 * Valida si los datos latentes son válidos
 * @param {Array} data - Array de datos latentes
 * @returns {boolean}
 */
export const isValidLatentData = (data) => {
  return Array.isArray(data) && 
         data.length > 0 &&
         data.every(point => 
           point &&
           isValidNumber(point.x) &&
           isValidNumber(point.y) &&
           typeof point.label === 'string'
         );
};
