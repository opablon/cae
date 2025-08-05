import { memo } from 'react';
import { CONFIG } from '../config/constants';
import { isValidBounds } from '../utils/validation';

const ControlPanel = memo(({ latentCoords, latentSpaceBounds, onSliderChange, onReset, onCoordInputChange }) => {
  // Valores por defecto seguros
  const bounds = isValidBounds(latentSpaceBounds) 
    ? latentSpaceBounds 
    : { xMin: -3, xMax: 3, yMin: -3, yMax: 3 };
  
  const { xMin, xMax, yMin, yMax } = bounds;

  // Formatear coordenadas con la precisión configurada
  const formatCoord = (value) => value.toFixed(CONFIG.COORDINATE_PRECISION);

  return (
    <div className="flex flex-col items-center w-full p-4 mt-4 bg-gray-100 rounded-lg shadow-inner">
      <h2 className="text-2xl font-semibold text-blue-700 text-center mb-4">
        Ajuste Fino
      </h2>
      
      {/* Inputs de coordenadas directas */}
      <div className="flex items-center justify-center gap-4 my-4">
        <div className="flex items-center gap-2 pl-6">
          <label 
            htmlFor="inputLatentX" 
            className="font-bold text-blue-600"
          >
            X:
          </label>
          <input 
            type="number" 
            id="inputLatentX" 
            value={formatCoord(latentCoords.x)} 
            onChange={(e) => onCoordInputChange('x', e.target.value)}
            className="w-24 p-2 text-center border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            step="0.01"
            min={xMin}
            max={xMax}
            aria-label="Coordenada X del espacio latente"
          />
        </div>
        <div className="flex items-center gap-2 pr-6">
          <label 
            htmlFor="inputLatentY" 
            className="font-bold text-blue-600"
          >
            Y:
          </label>
          <input 
            type="number" 
            id="inputLatentY" 
            value={formatCoord(latentCoords.y)} 
            onChange={(e) => onCoordInputChange('y', e.target.value)}
            className="w-24 p-2 text-center border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            step="0.01"
            min={yMin}
            max={yMax}
            aria-label="Coordenada Y del espacio latente"
          />
        </div>
      </div>

      {/* Sliders para ajuste fino */}
      <div className="w-full max-w-xs space-y-4">
        <div className="flex flex-col items-center">
          <label 
            htmlFor="latentDim1" 
            className="self-start w-full text-gray-600 mb-2"
          >
            X: <span className="font-bold text-blue-600">{formatCoord(latentCoords.x)}</span>
          </label>
          <input 
            type="range" 
            id="latentDim1" 
            min={xMin} 
            max={xMax} 
            step="0.01" 
            value={latentCoords.x}
            onChange={(e) => onSliderChange('x', e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="Slider para coordenada X"
          />
        </div>
        
        <div className="flex flex-col items-center">
          <label 
            htmlFor="latentDim2" 
            className="self-start w-full text-gray-600 mb-2"
          >
            Y: <span className="font-bold text-blue-600">{formatCoord(latentCoords.y)}</span>
          </label>
          <input 
            type="range" 
            id="latentDim2" 
            min={yMin} 
            max={yMax} 
            step="0.01" 
            value={latentCoords.y}
            onChange={(e) => onSliderChange('y', e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="Slider para coordenada Y"
          />
        </div>
      </div>

      {/* Botón de reset */}
      <button 
        onClick={onReset} 
        className="px-6 py-2 mt-6 font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-200 ease-in-out"
        aria-label="Reiniciar coordenadas a valores por defecto"
      >
        Reiniciar Valores
      </button>
    </div>
  );
});

ControlPanel.displayName = 'ControlPanel';

export default ControlPanel;
