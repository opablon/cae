import React from 'react';
import Spinner from './components/Spinner';
import Header from './components/Header';
import LatentSpacePlot from './components/LatentSpacePlot';
import GeneratedCharacter from './components/GeneratedCharacter';
import ControlPanel from './components/ControlPanel';
import TheorySection from './components/TheorySection';
import { useAutoencoder } from './hooks/useAutoencoder';

function App() {
  const {
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
  } = useAutoencoder();

  return (
    <>
      {isLoading && <Spinner />}
      <div className={`min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8 transition-opacity duration-500 ${isAppReady ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6">
          <Header />
          
          <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2" onClick={handlePlotClick}>
              <LatentSpacePlot ref={plotCanvasRef} />
            </div>
            
            <div className="flex flex-col gap-6">
              <GeneratedCharacter ref={generatedCanvasRef} />
              <ControlPanel 
                latentCoords={latentCoords}
                latentSpaceBounds={latentSpaceBounds}
                onSliderChange={handleSliderChange}
                onReset={handleReset}
                onCoordInputChange={handleCoordInputChange}
              />
            </div>
          </main>

          <TheorySection />

          <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500">
            <p>
              <a 
                href="https://github.com/opablon/cae" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300"
              >
                Ver el código fuente en GitHub
              </a>
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}

export default App;
