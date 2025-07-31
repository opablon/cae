import React from 'react';

const Spinner = () => {
  return (
    <div className="fixed top-0 left-0 z-50 flex flex-col items-center justify-center w-full h-full bg-white bg-opacity-90">
      <div className="w-16 h-16 border-8 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-700">Cargando modelo...</p>
    </div>
  );
};

export default Spinner;
