import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import { CONFIG } from '../config/constants';
import { isValidLatentCoords, isValidBounds } from '../utils/validation';
import { clamp, pixelToWorld } from '../utils/math';
import { cleanupTensors, throttle } from '../utils/performance';
import { useErrorHandler } from './useErrorHandler';

export const useAutoencoder = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const [decoderModel, setDecoderModel] = useState(null);
  const [latentData, setLatentData] = useState(null);
  const [latentSpaceBounds, setLatentSpaceBounds] = useState(null);
  const [latentCoords, setLatentCoords] = useState({ x: 0, y: 0 });

  const plotCanvasRef = useRef(null);
  const generatedCanvasRef = useRef(null);
  const { reportError } = useErrorHandler();

  // Función para calcular los límites del espacio latente
  const calculateBounds = useCallback((plotData) => {
    const xCoords = plotData.map(p => p.x);
    const yCoords = plotData.map(p => p.y);
    const xMin = Math.min(...xCoords);
    const xMax = Math.max(...xCoords);
    const yMin = Math.min(...yCoords);
    const yMax = Math.max(...yCoords);
    
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;

    return {
      xMin: xMin - xRange * CONFIG.PADDING_FACTOR - CONFIG.SLIDER_PADDING,
      xMax: xMax + xRange * CONFIG.PADDING_FACTOR + CONFIG.SLIDER_PADDING,
      yMin: yMin - yRange * CONFIG.PADDING_FACTOR - CONFIG.SLIDER_PADDING,
      yMax: yMax + yRange * CONFIG.PADDING_FACTOR + CONFIG.SLIDER_PADDING,
    };
  }, []);

  // Carga del modelo y los datos con manejo de errores mejorado
  useEffect(() => {
    const loadResources = async () => {
      try {
        // Cargar modelo
        const model = await tf.loadGraphModel(CONFIG.MODEL_PATH);
        setDecoderModel(model);

        // Cargar datos latentes
        const response = await fetch(CONFIG.LATENT_DATA_PATH);
        if (!response.ok) {
          throw new Error(`Error al cargar datos: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validar estructura de datos
        if (!data.latent_coords || !Array.isArray(data.latent_coords) || !data.labels) {
          throw new Error('Estructura de datos inválida');
        }
        
        const plotData = data.latent_coords.map((coord, index) => ({
          x: coord[0],
          y: coord[1],
          label: data.labels[index],
        }));
        
        setLatentData(plotData);
        setLatentSpaceBounds(calculateBounds(plotData));

      } catch (error) {
        reportError(error, 'Error al cargar recursos del autoencoder');
        setIsLoading(false);
      }
    };

    loadResources();
  }, [calculateBounds, reportError]);

  // Función optimizada para generar letras con limpieza de memoria
  const generateLetter = useCallback(async (latentVector) => {
    if (!decoderModel || !generatedCanvasRef.current) return;
    
    let latentTensor, outputTensor, imageTensor, normalizedImageTensor;
    
    try {
      const canvas = generatedCanvasRef.current;
      const ctx = canvas.getContext('2d');

      // Crear tensores
      latentTensor = tf.tensor2d([latentVector]);
      outputTensor = decoderModel.predict(latentTensor);
      imageTensor = outputTensor.squeeze();
      normalizedImageTensor = imageTensor.mul(255).round().clipByValue(0, 255).cast('int32');
      
      // Obtener datos de imagen
      const imageDataArray = await normalizedImageTensor.data();
      
      // Crear datos RGBA
      const rgbaData = new Uint8ClampedArray(CONFIG.IMAGE_SIZE * CONFIG.IMAGE_SIZE * 4);
      for (let i = 0; i < CONFIG.IMAGE_SIZE * CONFIG.IMAGE_SIZE; i++) {
        const pixelValue = imageDataArray[i];
        const baseIndex = i * 4;
        rgbaData[baseIndex] = pixelValue;     // R
        rgbaData[baseIndex + 1] = pixelValue; // G
        rgbaData[baseIndex + 2] = pixelValue; // B
        rgbaData[baseIndex + 3] = 255;       // A
      }

      // Renderizar en canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const imageDataObject = new ImageData(rgbaData, CONFIG.IMAGE_SIZE, CONFIG.IMAGE_SIZE);
      ctx.putImageData(imageDataObject, 0, 0);

    } catch (error) {
      reportError(error, 'Error al generar letra');
    } finally {
      // Limpiar tensores para evitar memory leaks
      cleanupTensors([latentTensor, outputTensor, imageTensor, normalizedImageTensor]);
    }
  }, [decoderModel, reportError]);

  // Efecto para inicializar la aplicación cuando los recursos están listos
  useEffect(() => {
    if (decoderModel && latentData && latentSpaceBounds) {
      generateLetter([latentCoords.x, latentCoords.y]);
      
      // Pequeño delay para asegurar que la primera letra se genera antes de mostrar la UI
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsAppReady(true);
      }, CONFIG.TRANSITION_DELAY);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [decoderModel, latentData, latentSpaceBounds, generateLetter]);

  // Efecto para generar la letra cuando las coordenadas cambian
  useEffect(() => {
    if (isAppReady && isValidLatentCoords(latentCoords)) {
      generateLetter([latentCoords.x, latentCoords.y]);
    }
  }, [latentCoords, generateLetter, isAppReady]);

  // Función throttled para manejar clics en el plot
  const handlePlotClick = useCallback(throttle((event) => {
    const canvas = plotCanvasRef.current;
    if (!canvas || !isValidBounds(latentSpaceBounds)) return;

    const rect = canvas.getBoundingClientRect();
    const pixelCoords = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    const canvasInfo = {
      width: rect.width,
      height: rect.height,
      xOffset: CONFIG.PLOT_MARGIN + CONFIG.PLOT_OFFSET,
      yOffset: CONFIG.PLOT_MARGIN + CONFIG.PLOT_OFFSET
    };

    // Validar que el clic esté dentro del área del gráfico
    if (
      pixelCoords.x < canvasInfo.xOffset || 
      pixelCoords.x > (canvasInfo.width - canvasInfo.xOffset) ||
      pixelCoords.y < canvasInfo.yOffset || 
      pixelCoords.y > (canvasInfo.height - canvasInfo.yOffset)
    ) {
      return;
    }

    const worldCoords = pixelToWorld(pixelCoords, latentSpaceBounds, canvasInfo);
    setLatentCoords(worldCoords);
  }, 50), [latentSpaceBounds]);

  const handleSliderChange = useCallback((dim, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setLatentCoords(prev => ({ ...prev, [dim]: numValue }));
    }
  }, []);

  const handleCoordInputChange = useCallback((dim, value) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue) && isValidBounds(latentSpaceBounds)) {
      const { xMin, xMax, yMin, yMax } = latentSpaceBounds;
      const clampedValue = dim === 'x' 
        ? clamp(parsedValue, xMin, xMax)
        : clamp(parsedValue, yMin, yMax);
      
      setLatentCoords(prev => ({ ...prev, [dim]: clampedValue }));
    }
  }, [latentSpaceBounds]);

  const handleReset = useCallback(() => {
    setLatentCoords({ x: 0, y: 0 });
  }, []);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (decoderModel) {
        decoderModel.dispose();
      }
    };
  }, [decoderModel]);

  return {
    isLoading,
    isAppReady,
    latentCoords,
    latentSpaceBounds,
    latentData,
    plotCanvasRef,
    generatedCanvasRef,
    handlePlotClick,
    handleSliderChange,
    handleCoordInputChange,
    handleReset,
  };
};
