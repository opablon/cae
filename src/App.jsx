import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import Spinner from './components/Spinner';
import Header from './components/Header';
import LatentSpacePlot from './components/LatentSpacePlot';
import GeneratedCharacter from './components/GeneratedCharacter';
import ControlPanel from './components/ControlPanel';
import { useAutoencoder } from './hooks/useAutoencoder';
import { throttle } from './utils/performance';

// Lazy loading para componentes pesados
const TheorySection = lazy(() => import('./components/TheorySection'));

function App() {
  const {
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
  } = useAutoencoder();

  const mainSectionRef = useRef(null);
  const footerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  // Función throttled para manejar el scroll
  const handleScroll = throttle(() => {
    if (mainSectionRef.current) {
      const { bottom } = mainSectionRef.current.getBoundingClientRect();
      setShowScrollButton(bottom < 0);
    }
  }, 100);

  useEffect(() => {
    // Observer para el footer con mejores opciones
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Detectar antes de que sea totalmente visible
      }
    );

    const currentFooterRef = footerRef.current;
    if (currentFooterRef) {
      observer.observe(currentFooterRef);
    }

    // Listener optimizado para scroll
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      if (currentFooterRef) {
        observer.unobserve(currentFooterRef);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const scrollToMainSection = () => {
    mainSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Renderizar loading spinner de manera optimizada
  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <div className={`min-h-screen bg-gray-50 font-sans p-4 sm:p-6 lg:p-8 transition-opacity duration-500 ${isAppReady ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto">
          <Header />
          
          <main ref={mainSectionRef} className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sección del plot del espacio latente */}
            <section 
              className="lg:col-span-2 h-full flex flex-col justify-center p-4 bg-gray-100 rounded-lg shadow-inner items-center" 
              onClick={handlePlotClick}
              role="application"
              aria-label="Visualización interactiva del espacio latente"
            >
              <h2 className="text-2xl font-semibold text-blue-700 text-center mb-4">
                Espacio Latente de Referencia
              </h2>
              
              {latentCoords && latentSpaceBounds && latentData ? (
                <LatentSpacePlot
                  ref={plotCanvasRef}
                  latentCoords={latentCoords}
                  latentSpaceBounds={latentSpaceBounds}
                  latentData={latentData}
                />
              ) : (
                <div className="text-center text-red-600 font-bold p-8" role="alert">
                  Error: No se pudo cargar el espacio latente.
                </div>
              )}
            </section>
            
            {/* Sección de controles y carácter generado */}
            <aside className="h-full flex flex-col content-center items-center">
              <div className="flex flex-col items-center w-full max-w-xs gap-2">
                <GeneratedCharacter ref={generatedCanvasRef} />
                <ControlPanel 
                  latentCoords={latentCoords}
                  latentSpaceBounds={latentSpaceBounds}
                  onSliderChange={handleSliderChange}
                  onReset={handleReset}
                  onCoordInputChange={handleCoordInputChange}
                />
              </div>
            </aside>
          </main>
          
          {/* Lazy loading de la sección de teoría */}
          <Suspense fallback={
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Cargando contenido teórico...</div>
            </div>
          }>
            <TheorySection />
          </Suspense>
          
          {/* Footer */}
          <footer ref={footerRef} className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500">
            <p>
              <a 
                href="https://github.com/opablon/cae" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                aria-label="Ver el código fuente del proyecto en GitHub"
              >
                Ver el código fuente en GitHub
              </a>
            </p>
          </footer>
        </div>
      </div>
      
      {/* Botón de scroll optimizado */}
      <button
        onClick={scrollToMainSection}
        className={`fixed ${isFooterVisible ? 'bottom-24' : 'bottom-12'} left-1/2 -translate-x-1/2 transform bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out ${
          showScrollButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}
        aria-label="Volver al inicio de la aplicación"
        tabIndex={showScrollButton ? 0 : -1}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </>
  );
}

export default App;
