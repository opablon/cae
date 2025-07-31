import React from 'react';

const LatentSpacePlot = React.forwardRef((props, ref) => {
  return (
    <div className="w-full p-4 bg-gray-100 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-center text-blue-600">Espacio Latente de Referencia</h2>
      <canvas ref={ref} className="w-full mt-4 border border-gray-300 rounded-lg cursor-crosshair bg-white shadow-sm"></canvas>
    </div>
  );
});

export default LatentSpacePlot;
