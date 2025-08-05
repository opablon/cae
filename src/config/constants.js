// Constantes de configuración de la aplicación
export const CONFIG = {
  // Modelo y datos
  MODEL_PATH: 'tfjs_decoder_model_20250724_135134/model.json',
  LATENT_DATA_PATH: 'latent_space_data_20250724_130013.json',
  
  // Dimensiones del canvas
  IMAGE_SIZE: 64,
  
  // Configuración del plot
  PLOT_POINT_SIZE: 5,
  PLOT_MARGIN: 40,
  PLOT_GRID_LINES: 10,
  PLOT_OFFSET: 10,
  
  // Factores de padding y escala
  PADDING_FACTOR: 0.05,
  SLIDER_PADDING: 5,
  
  // Configuración de UI
  TRANSITION_DELAY: 50,
  
  // Precisión numérica
  COORDINATE_PRECISION: 2,
  DISPLAY_PRECISION: 1,
  
  // Configuración de estilos
  COLORS: {
    PRIMARY: '#007bff',
    PRIMARY_HOVER: '#0056b3',
    GRID: '#e0e0e0',
    AXES: '#666',
    TEXT: '#333',
    MARKER: 'red',
    POINT: 'blue'
  },
  
  // Configuración de fuentes
  FONTS: {
    AXIS_LABEL: '10px Arial',
    POINT_LABEL: '12px Arial'
  }
};

// Tipos de datos para mejor tipado
export const DATA_TYPES = {
  LATENT_COORDS: 'latentCoords',
  LATENT_BOUNDS: 'latentBounds',
  LATENT_DATA: 'latentData'
};

// Estados de la aplicación
export const APP_STATES = {
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error'
};
