import React from 'react';

const GeneratedCharacter = React.forwardRef((props, ref) => {
  return (
    <div className="w-full p-4 bg-gray-100 rounded-lg shadow-inner flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-blue-700 text-center">Carácter Generado</h2>
      <canvas ref={ref} width="64" height="64" className="w-64 h-64 mt-4 border border-gray-300 rounded-lg bg-white shadow-sm" style={{ imageRendering: 'pixelated' }}></canvas>
    </div>
  );
});

export default GeneratedCharacter;
