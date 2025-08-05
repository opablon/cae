/**
 * Utilidades para manejo de performance y recursos
 */

/**
 * Debounce function para limitar la frecuencia de llamadas
 * @param {Function} func - Función a ejecutar
 * @param {number} delay - Retraso en milisegundos
 * @returns {Function}
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Throttle function para limitar la frecuencia de ejecución
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Límite en milisegundos
 * @returns {Function}
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Hook personalizado para medir el rendimiento
 * @param {string} name - Nombre de la medición
 * @returns {Object}
 */
export const usePerformance = (name) => {
  const start = () => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-start`);
    }
  };

  const end = () => {
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }
  };

  return { start, end };
};

/**
 * Limpia los recursos de TensorFlow.js
 * @param {Array} tensors - Array de tensores a limpiar
 */
export const cleanupTensors = (tensors) => {
  if (tensors && Array.isArray(tensors)) {
    tensors.forEach(tensor => {
      if (tensor && typeof tensor.dispose === 'function') {
        tensor.dispose();
      }
    });
  }
};

/**
 * Verifica si hay memory leaks en TensorFlow.js
 */
export const checkMemoryLeaks = () => {
  if (typeof window !== 'undefined' && window.tf && window.tf.memory) {
    const memInfo = window.tf.memory();
    if (memInfo.numTensors > 100) { // Umbral configurable
      // eslint-disable-next-line no-console
      console.warn('Posible memory leak detectado. Tensores en memoria:', memInfo.numTensors);
    }
  }
};
