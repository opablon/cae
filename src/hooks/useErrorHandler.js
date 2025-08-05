import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejo de errores
 * @returns {Object}
 */
export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsync = useCallback(async (asyncFunction, errorMessage = 'Ha ocurrido un error') => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFunction();
      return result;
    } catch (err) {
      console.error(errorMessage, err);
      setError({
        message: errorMessage,
        originalError: err,
        timestamp: new Date().toISOString()
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reportError = useCallback((error, context = '') => {
    const errorInfo = {
      message: error.message || 'Error desconocido',
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.error('Error reportado:', errorInfo);
    
    // Aquí podrías enviar el error a un servicio de logging como Sentry
    // sendToErrorService(errorInfo);
    
    setError(errorInfo);
  }, []);

  return {
    error,
    isLoading,
    handleAsync,
    clearError,
    reportError
  };
};
