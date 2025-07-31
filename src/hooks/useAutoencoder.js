import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';

const MODEL_PATH = 'tfjs_decoder_model_20250724_135134/model.json';
const LATENT_DATA_PATH = 'latent_space_data_20250724_130013.json';
const IMAGE_SIZE = 64;
const PLOT_POINT_SIZE = 5;
const PLOT_MARGIN = 40;

export const useAutoencoder = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const [decoderModel, setDecoderModel] = useState(null);
  const [latentData, setLatentData] = useState(null);
  const [latentSpaceBounds, setLatentSpaceBounds] = useState(null);
  const [latentCoords, setLatentCoords] = useState({ x: 0, y: 0 });

  const plotCanvasRef = useRef(null);
  const generatedCanvasRef = useRef(null);

  // Carga del modelo y los datos
  useEffect(() => {
    const loadResources = async () => {
      try {
        const model = await tf.loadGraphModel(MODEL_PATH);
        setDecoderModel(model);

        const response = await fetch(LATENT_DATA_PATH);
        const data = await response.json();
        
        const plotData = data.latent_coords.map((coord, index) => ({
          x: coord[0],
          y: coord[1],
          label: data.labels[index],
        }));
        setLatentData(plotData);

        const xCoords = plotData.map(p => p.x);
        const yCoords = plotData.map(p => p.y);
        const xMin = Math.min(...xCoords);
        const xMax = Math.max(...xCoords);
        const yMin = Math.min(...yCoords);
        const yMax = Math.max(...yCoords);
        const paddingFactor = 0.05;
        const xRange = xMax - xMin;
        const yRange = yMax - yMin;
        const sliderPadding = 5;

        setLatentSpaceBounds({
          xMin: xMin - xRange * paddingFactor - sliderPadding,
          xMax: xMax + xRange * paddingFactor + sliderPadding,
          yMin: yMin - yRange * paddingFactor - sliderPadding,
          yMax: yMax + yRange * paddingFactor + sliderPadding,
        });

      } catch (error) {
        console.error("Error loading resources:", error);
        // En caso de error, detenemos la carga para evitar un spinner infinito
        setIsLoading(false);
      }
      // No ponemos setIsLoading(false) aquí para esperar al primer dibujado
    };
    loadResources();
  }, []);

  const drawGridAndAxes = useCallback((ctx, width, height, bounds) => {
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
  }, []);

  const drawLatentSpace = useCallback(() => {
    const canvas = plotCanvasRef.current;
    if (!canvas || !latentData || !latentSpaceBounds) return;
    const ctx = canvas.getContext('2d');
    
    const visualWidth = canvas.clientWidth;
    const visualHeight = visualWidth;
    canvas.width = visualWidth;
    canvas.height = visualHeight;

    ctx.clearRect(0, 0, visualWidth, visualHeight);
    drawGridAndAxes(ctx, visualWidth, visualHeight, latentSpaceBounds);

    const { xMin, xMax, yMin, yMax } = latentSpaceBounds;
    const effectiveWidth = visualWidth - 2 * PLOT_MARGIN - 20;
    const effectiveHeight = visualHeight - 2 * PLOT_MARGIN - 20;
    const xOffset = PLOT_MARGIN + 10;
    const yOffset = PLOT_MARGIN + 10;
    const xScale = effectiveWidth / (xMax - xMin);
    const yScale = effectiveHeight / (yMax - yMin);

    latentData.forEach(point => {
      const xPixel = xOffset + (point.x - xMin) * xScale;
      const yPixel = visualHeight - yOffset - (point.y - yMin) * yScale;

      ctx.beginPath();
      ctx.arc(xPixel, yPixel, PLOT_POINT_SIZE, 0, 2 * Math.PI);
      ctx.fillStyle = '#007bff';
      ctx.fill();
      ctx.strokeStyle = '#0056b3';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '12px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(point.label, xPixel, yPixel - PLOT_POINT_SIZE - 2);
    });
  }, [latentData, latentSpaceBounds, drawGridAndAxes]);

  const generateLetter = useCallback(async (latentVector) => {
    const canvas = generatedCanvasRef.current;
    if (!decoderModel || !canvas) return;
    const ctx = canvas.getContext('2d');

    const latentTensor = tf.tensor2d([latentVector]);
    const outputTensor = decoderModel.predict(latentTensor);
    const imageTensor = outputTensor.squeeze();
    const normalizedImageTensor = imageTensor.mul(255).round().clipByValue(0, 255).cast('int32');
    const imageDataArray = await normalizedImageTensor.data();
    
    const rgbaData = new Uint8ClampedArray(IMAGE_SIZE * IMAGE_SIZE * 4);
    for (let i = 0; i < IMAGE_SIZE * IMAGE_SIZE; i++) {
      const pixelValue = imageDataArray[i];
      rgbaData[i * 4 + 0] = pixelValue;
      rgbaData[i * 4 + 1] = pixelValue;
      rgbaData[i * 4 + 2] = pixelValue;
      rgbaData[i * 4 + 3] = 255;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const imageDataObject = new ImageData(rgbaData, IMAGE_SIZE, IMAGE_SIZE);
    ctx.putImageData(imageDataObject, 0, 0);

    tf.dispose([latentTensor, outputTensor, imageTensor, normalizedImageTensor]);
  }, [decoderModel]);

  // Efecto para dibujar el espacio latente cuando los datos están listos
  useEffect(() => {
    if (decoderModel && latentData) {
      drawLatentSpace();
      generateLetter([latentCoords.x, latentCoords.y]);
      setIsLoading(false);
      const timer = setTimeout(() => setIsAppReady(true), 50); // Pequeño delay para la transición
      
      const handleResize = () => drawLatentSpace();
      window.addEventListener('resize', handleResize);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [decoderModel, latentData, drawLatentSpace, generateLetter]);

  // Efecto para generar la letra cuando las coordenadas cambian
  useEffect(() => {
    if (isAppReady) {
      generateLetter([latentCoords.x, latentCoords.y]);
    }
  }, [latentCoords, generateLetter, isAppReady]);

  const handlePlotClick = (event) => {
    const canvas = plotCanvasRef.current;
    if (!canvas || !latentSpaceBounds) return;

    const rect = canvas.getBoundingClientRect();
    const xPixel = event.clientX - rect.left;
    const yPixel = event.clientY - rect.top;
    const { width, height } = canvas;
    const { xMin, xMax, yMin, yMax } = latentSpaceBounds;

    const xOffset = PLOT_MARGIN + 10;
    const yOffset = PLOT_MARGIN + 10;

    if (xPixel < xOffset || xPixel > (width - xOffset) || yPixel < yOffset || yPixel > (height - yOffset)) {
      return;
    }

    const effectiveWidth = width - 2 * PLOT_MARGIN - 20;
    const effectiveHeight = height - 2 * PLOT_MARGIN - 20;
    const xScale = effectiveWidth / (xMax - xMin);
    const yScale = effectiveHeight / (yMax - yMin);

    const latentX = xMin + (xPixel - xOffset) / xScale;
    const latentY = yMax - (yPixel - yOffset) / yScale;

    setLatentCoords({ x: latentX, y: latentY });
  };

  const handleSliderChange = (dim, value) => {
    setLatentCoords(prev => ({ ...prev, [dim]: parseFloat(value) }));
  };

  const handleCoordInputChange = (dim, value) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
        const { xMin, xMax, yMin, yMax } = latentSpaceBounds;
        let clampedValue = parsedValue;
        if (dim === 'x') {
            clampedValue = Math.max(xMin, Math.min(xMax, parsedValue));
        } else {
            clampedValue = Math.max(yMin, Math.min(yMax, parsedValue));
        }
        setLatentCoords(prev => ({ ...prev, [dim]: clampedValue }));
    }
  };

  const handleReset = () => {
    setLatentCoords({ x: 0, y: 0 });
  };

  return {
    isLoading,
    isAppReady,
    latentCoords,
    latentSpaceBounds,
    plotCanvasRef,
    generatedCanvasRef,
    handlePlotClick,
    handleSliderChange,
    handleCoordInputChange,
    handleReset,
  };
};
