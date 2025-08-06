# Instrucciones para el Agente de IA en el Explorador de Espacio Latente

Este documento proporciona orientación para trabajar en esta base de código.

## Descripción General del Proyecto

Esta es una aplicación web de React construida con Vite que permite a los usuarios explorar interactivamente el espacio latente de un autoencoder convolucional entrenado para generar caracteres. La aplicación visualiza el espacio latente en un gráfico 2D y genera una imagen de carácter en tiempo real basada en las coordenadas seleccionadas por el usuario.

El modelo de Machine Learning (específicamente, el decodificador) se ejecuta directamente en el navegador utilizando TensorFlow.js.

## Tecnologías y Librerías Clave

- **Framework Frontend:** React
- **Servidor de Desarrollo/Bundler:** Vite
- **Estilos:** Tailwind CSS
- **Inferencia de ML en el Navegador:** TensorFlow.js

## Arquitectura y Flujo de Datos

El flujo de trabajo central de la aplicación es el siguiente:

1.  **Carga del Modelo y Datos:** Al iniciar, la aplicación carga el modelo decodificador de TensorFlow.js desde `/public/tfjs_decoder_model.../` y los datos de referencia del espacio latente desde `/public/latent_space_data.json`. La lógica para esto está encapsulada en el hook `src/hooks/useAutoencoder.js`.
2.  **Interacción del Usuario:** El usuario interactúa con el componente `src/components/LatentSpacePlot.jsx` (haciendo clic en el canvas) o con `src/components/ControlPanel.jsx` (ajustando los sliders).
3.  **Actualización de Estado:** Estas interacciones actualizan el estado de las coordenadas del espacio latente, que se gestiona en el componente principal `src/App.jsx`.
4.  **Inferencia del Modelo:** El hook `useAutoencoder` se activa cuando cambian las coordenadas. Llama al modelo decodificador con las nuevas coordenadas para generar un tensor de imagen.
5.  **Renderizado:** El tensor de imagen resultante se renderiza en un elemento `<canvas>` dentro del componente `src/components/GeneratedCharacter.jsx`.

## Archivos y Directorios Clave

-   `src/App.jsx`: El componente principal que orquesta la aplicación.
-   `src/hooks/useAutoencoder.js`: Hook personalizado crucial que maneja toda la lógica de TensorFlow.js (carga del modelo, predicción y formateo de la salida). Este es el núcleo de la funcionalidad de ML.
-   `src/components/LatentSpacePlot.jsx`: Muestra el gráfico del espacio latente y gestiona las interacciones de clic del usuario.
-   `src/components/ControlPanel.jsx`: Proporciona sliders y entradas para que el usuario ajuste manualmente las coordenadas del espacio latente.
-   `public/`: Este directorio es muy importante. Contiene los archivos del modelo de TF.js y los datos JSON que se sirven como activos estáticos. **No modifiques los nombres de archivo con hash aquí**, ya que se generan a partir de un proceso de entrenamiento externo.

## Flujo de Trabajo de Desarrollo

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```
2.  **Iniciar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.

## Patrones Específicos del Proyecto

-   **Gestión de la Lógica de ML:** Toda la interacción con TensorFlow.js está aislada en el hook `useAutoencoder.js`. Cualquier cambio relacionado con la inferencia del modelo debe realizarse allí.
-   **Activos Estáticos:** El modelo y los datos se cargan desde el directorio `public/`. Vite sirve estos archivos directamente en la raíz. Las rutas en el código (por ejemplo, para `loadGraphModel`) son relativas a la raíz del servidor, como `/tfjs_decoder_model.../model.json`.
-   **Renderizado en Canvas:** La salida del modelo se dibuja en un `<canvas>`. La lógica para esto se encuentra en `GeneratedCharacter.jsx` y `LatentSpacePlot.jsx`.

## Buenas Prácticas de Git

-   **Mensajes de Commit:** SIEMPRE usar mensajes cortos y concisos (máximo 50 caracteres) al ejecutar `git commit -m`. Los mensajes largos pueden causar problemas en el entorno de chat. Ejemplo: `git commit -m "fix: corregir errores de linting"` en lugar de mensajes multilínea.
-   **Formato de Commit:** Seguir el formato convencional: `tipo: descripción breve` (ej: `fix:`, `feat:`, `docs:`, `refactor:`)