import React from 'react';

const GeneratedCharacter = React.forwardRef((props, ref) => {
  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-blue-600">Carácter Generado</h2>
      <canvas ref={ref} width="64" height="64" className="w-32 h-32 mt-4 border border-gray-300 rounded-lg bg-white shadow-sm" style={{ imageRendering: 'pixelated' }}></canvas>
    </div>
  );
});

export default GeneratedCharacter;
