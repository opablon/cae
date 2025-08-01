import React, { useState, useEffect, useRef } from 'react';
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

  const mainSectionRef = useRef(null);
  const footerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  const handleScroll = () => {
    if (mainSectionRef.current) {
      const { bottom } = mainSectionRef.current.getBoundingClientRect();
      setShowScrollButton(bottom < 0);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const currentFooterRef = footerRef.current;
    if (currentFooterRef) {
      observer.observe(currentFooterRef);
    }

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      if (currentFooterRef) {
        observer.unobserve(currentFooterRef);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToMainSection = () => {
    mainSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isLoading && <Spinner />}
      <div className={`min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8 transition-opacity duration-500 ${isAppReady ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6">
          <Header />
          
          <main ref={mainSectionRef} className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
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

          <footer ref={footerRef} className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500">
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
      <button
        onClick={scrollToMainSection}
        className={`fixed ${isFooterVisible ? 'bottom-24' : 'bottom-12'} left-1/2 -translate-x-1/2 transform bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out ${
          showScrollButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}
        aria-label="Volver arriba"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </>
  );
}

export default App;
