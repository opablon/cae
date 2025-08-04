import React from 'react';

const ControlPanel = ({ latentCoords, latentSpaceBounds, onSliderChange, onReset, onCoordInputChange }) => {
  const { xMin, xMax, yMin, yMax } = latentSpaceBounds || { xMin: -3, xMax: 3, yMin: -3, yMax: 3 };

  return (
    <div className="flex flex-col items-center w-full p-4 mt-4 bg-gray-100 rounded-lg shadow-inner">
      <h2 className="text-2xl font-semibold text-blue-700 text-center">Ajuste Fino</h2>
      
      <div className="flex items-center justify-center gap-4 my-4">
        <div className="flex items-center gap-2 pl-6">
          <label htmlFor="inputLatentX" className="font-bold text-blue-600">X:</label>
          <input 
            type="text" 
            id="inputLatentX" 
            value={latentCoords.x.toFixed(2)} 
            onChange={e => onCoordInputChange('x', e.target.value)}
            className="w-24 p-2 text-center border border-gray-300 rounded-md font-mono"
          />
        </div>
        <div className="flex items-center gap-2 pr-6">
          <label htmlFor="inputLatentY" className="font-bold text-blue-600">Y:</label>
          <input 
            type="text" 
            id="inputLatentY" 
            value={latentCoords.y.toFixed(2)} 
            onChange={e => onCoordInputChange('y', e.target.value)}
            className="w-24 p-2 text-center border border-gray-300 rounded-md font-mono"
          />
        </div>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <div className="flex flex-col items-center">
          <label htmlFor="latentDim1" className="self-start w-full text-gray-600">X: <span className="font-bold text-blue-600">{latentCoords.x.toFixed(2)}</span></label>
          <input 
            type="range" 
            id="latentDim1" 
            min={xMin} 
            max={xMax} 
            step="0.01" 
            value={latentCoords.x}
            onChange={e => onSliderChange('x', e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex flex-col items-center">
          <label htmlFor="latentDim2" className="self-start w-full text-gray-600">Y: <span className="font-bold text-blue-600">{latentCoords.y.toFixed(2)}</span></label>
          <input 
            type="range" 
            id="latentDim2" 
            min={yMin} 
            max={yMax} 
            step="0.01" 
            value={latentCoords.y}
            onChange={e => onSliderChange('y', e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <button onClick={onReset} className="px-6 py-2 mt-6 font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors">
        Reiniciar Valores
      </button>
    </div>
  );
};

export default ControlPanel;
