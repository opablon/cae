// --- RUTAS DE ARCHIVOS (¡CONFIRMADAS!) ---
const modelPath = './tfjs_decoder_model_20250723_154646/model.json';
const latentDataPath = './latent_space_data_20250723_143922.json';

// --- Variables Globales ---
let decoderModel;
let latentData;

// Obtener referencias a los elementos del DOM (HTML)
const canvas = document.getElementById('generatedLetterCanvas');
const ctx = canvas.getContext('2d'); // Contexto 2D para dibujar en el canvas de la letra

const plotCanvas = document.getElementById('latentPlotCanvas');
const plotCtx = plotCanvas.getContext('2d'); // Contexto 2D para dibujar en el canvas del gráfico

const latentDim1Slider = document.getElementById('latentDim1');
const latentDim2Slider = document.getElementById('latentDim2');
const latentDim1ValueSpan = document.getElementById('latentDim1Value');
const latentDim2ValueSpan = document.getElementById('latentDim2Value');
const currentLatentXSpan = document.getElementById('currentLatentX');
const currentLatentYSpan = document = document.getElementById('currentLatentY');
const resetViewButton = document.getElementById('resetView');

const imageSize = 64; // El tamaño de las imágenes de tus letras (64x64 píxeles)
let plotData = []; // Array que contendrá los datos de las coordenadas latentes y sus etiquetas para el gráfico
const plotPointSize = 5; // Tamaño de los puntos en el gráfico
const plotMargin = 40;   // Margen alrededor del gráfico para asegurar que los puntos no queden en el borde

// --- Funciones de Carga (Asíncronas) ---

/**
 * Carga el modelo decodificador de TensorFlow.js.
 */
async function loadModel() {
    try {
        decoderModel = await tf.loadGraphModel(modelPath);
        console.log('Modelo decodificador cargado exitosamente.');
        // Generar una letra inicial (por ejemplo, con el punto central del espacio latente)
        generateLetter([0, 0]);
    } catch (error) {
        console.error('Error al cargar el modelo decodificador:', error);
        alert('No se pudo cargar el modelo decodificador. Consulta la consola para más detalles.');
    }
}

/**
 * Carga los datos de las coordenadas del espacio latente y las etiquetas desde el archivo JSON.
 */
async function loadLatentData() {
    try {
        const response = await fetch(latentDataPath);
        latentData = await response.json();
        
        // Mapear los datos brutos a un formato más fácil de usar para el gráfico
        plotData = latentData.latent_coords.map((coord, index) => ({
            x: coord[0], // Primera dimensión latente
            y: coord[1], // Segunda dimensión latente
            label: latentData.labels[index] // Etiqueta (letra) correspondiente
        }));
        console.log('Datos del espacio latente cargados exitosamente.');
        drawLatentSpace(); // Dibujar el espacio latente una vez cargados los datos
    } catch (error) {
        console.error('Error al cargar los datos latentes:', error);
        alert('No se pudieron cargar los datos del espacio latente. Consulta la consola para más detalles.');
    }
}

// --- Funciones de Dibujo ---

/**
 * Dibuja los puntos de referencia del espacio latente en el canvas del gráfico.
 */
function drawLatentSpace() {
    if (!plotData || !plotCanvas) {
        return; // No dibujar si los datos o el canvas no están listos
    }

    const width = plotCanvas.width;
    const height = plotCanvas.height;
    plotCtx.clearRect(0, 0, width, height); // Limpiar el canvas antes de redibujar

    // Calcular los rangos de los datos latentes para la normalización (escalado)
    const xCoords = plotData.map(p => p.x);
    const yCoords = plotData.map(p => p.y);
    const xMin = Math.min(...xCoords);
    const xMax = Math.max(...xCoords);
    const yMin = Math.min(...yCoords);
    const yMax = Math.max(...yCoords);

    // Calcular factores de escala para mapear valores latentes a píxeles
    const xScale = (width - 2 * plotMargin) / (xMax - xMin);
    const yScale = (height - 2 * plotMargin) / (yMax - yMin);

    // Dibujar cada punto y su etiqueta
    plotData.forEach(point => {
        // Convertir coordenadas latentes a coordenadas de píxeles en el canvas
        const xPixel = plotMargin + (point.x - xMin) * xScale;
        // El eje Y del canvas va de arriba (0) a abajo (max), así que lo invertimos para el gráfico
        const yPixel = height - plotMargin - (point.y - yMin) * yScale;

        // Dibujar el círculo
        plotCtx.beginPath();
        plotCtx.arc(xPixel, yPixel, plotPointSize, 0, 2 * Math.PI);
        plotCtx.fillStyle = '#007bff'; // Color de los puntos
        plotCtx.fill();
        plotCtx.strokeStyle = '#0056b3'; // Borde de los puntos
        plotCtx.lineWidth = 1;
        plotCtx.stroke();

        // Dibujar la etiqueta (la letra)
        plotCtx.font = '12px Arial';
        plotCtx.fillStyle = '#333';
        plotCtx.textAlign = 'center';
        plotCtx.textBaseline = 'bottom'; // Alinea el texto a la parte inferior
        plotCtx.fillText(point.label, xPixel, yPixel - plotPointSize - 2); // Posicionar encima del punto
    });
}

/**
 * Genera y dibuja una letra en el canvas de salida a partir de un vector latente.
 * @param {Array<number>} latentVector - Un array de 2 elementos [dim1, dim2] representando el vector latente.
 */
async function generateLetter(latentVector) {
    if (!decoderModel) {
        console.warn('El modelo decodificador no está cargado. No se puede generar la letra.');
        return;
    }

    // Crear un tensor de entrada con la forma esperada por el decodificador: [1, 2]
    // (1 para el batch_size, 2 para las dimensiones latentes)
    const latentTensor = tf.tensor2d([latentVector]);

    try {
        // Realizar la predicción (reconstrucción de la imagen)
        const outputTensor = decoderModel.predict(latentTensor);

        // El tensor de salida suele tener la forma [1, imageSize, imageSize, 1] (batch, alto, ancho, canales)
        // Eliminamos las dimensiones de batch y canal para obtener un tensor 2D de la imagen
        const imageTensor = outputTensor.squeeze(); // Ahora es [imageSize, imageSize]

        // Normalizar los valores del tensor (0-1) a un rango de 0-255 (para los píxeles)
        // Redondear, asegurar valores entre 0-255 y castear a int32 para ImageData
        const normalizedImageTensor = imageTensor.mul(255).round().clipByValue(0, 255).cast('int32');

        // Obtener los datos de los píxeles como un array de JavaScript
        // Los datos de tf.ImageData esperan un array plano de RGBA, incluso para escala de grises.
        // Convertimos el tensor de escala de grises a RGBA
        const imageDataArray = await normalizedImageTensor.data();
        const rgbaData = new Uint8ClampedArray(imageSize * imageSize * 4);

        for (let i = 0; i < imageSize * imageSize; i++) {
            const pixelValue = imageDataArray[i];
            rgbaData[i * 4 + 0] = pixelValue; // Rojo
            rgbaData[i * 4 + 1] = pixelValue; // Verde
            rgbaData[i * 4 + 2] = pixelValue; // Azul
            rgbaData[i * 4 + 3] = 255;       // Alfa (totalmente opaco)
        }
        
        // Limpiar el canvas de la letra antes de dibujar
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Crear un objeto ImageData y dibujarlo en el canvas
        const imageDataObject = new ImageData(rgbaData, imageSize, imageSize);
        ctx.putImageData(imageDataObject, 0, 0); // Dibuja la imagen reconstruida

    } catch (error) {
        console.error('Error al generar la letra:', error);
        alert('Ocurrió un error al generar la letra. Consulta la consola para más detalles.');
    } finally {
        // Limpiar los tensores para liberar memoria de la GPU
        latentTensor.dispose();
        if (outputTensor) outputTensor.dispose();
        if (imageTensor) imageTensor.dispose();
        if (normalizedImageTensor) normalizedImageTensor.dispose();
    }
}


// --- Event Listeners ---

// Listener para los clics en el canvas del espacio latente
plotCanvas.addEventListener('click', async (event) => {
    if (!decoderModel || !latentData) {
        console.warn('El modelo o los datos latentes no se han cargado aún. Esperando...');
        return;
    }

    // Obtener la posición del clic relativa al canvas
    const rect = plotCanvas.getBoundingClientRect();
    const xPixel = event.clientX - rect.left;
    const yPixel = event.clientY - rect.top;

    const width = plotCanvas.width;
    const height = plotCanvas.height;

    // Revertir la normalización para obtener las coordenadas latentes correspondientes al clic
    const xMin = Math.min(...plotData.map(p => p.x));
    const xMax = Math.max(...plotData.map(p => p.x));
    const yMin = Math.min(...plotData.map(p => p.y));
    const yMax = Math.max(...plotData.map(p => p.y));

    const xScale = (width - 2 * plotMargin) / (xMax - xMin);
    const yScale = (height - 2 * plotMargin) / (yMax - yMin);

    const latentX = xMin + (xPixel - plotMargin) / xScale;
    const latentY = yMax - (yPixel - plotMargin) / yScale; // Invertir el eje Y de nuevo para obtener el valor latente correcto

    // Actualizar los sliders y los spans de valor con las coordenadas del clic
    latentDim1Slider.value = latentX;
    latentDim1ValueSpan.textContent = latentX.toFixed(2);
    latentDim2Slider.value = latentY;
    latentDim2ValueSpan.textContent = latentY.toFixed(2);
    currentLatentXSpan.textContent = latentX.toFixed(2);
    currentLatentYSpan.textContent = latentY.toFixed(2);

    // Generar la letra con las nuevas coordenadas latentes
    generateLetter([latentX, latentY]);
});

// Listener para el slider de la Dimensión Latente 1
latentDim1Slider.addEventListener('input', () => {
    const value = parseFloat(latentDim1Slider.value);
    latentDim1ValueSpan.textContent = value.toFixed(2);
    currentLatentXSpan.textContent = value.toFixed(2);
    generateLetter([value, parseFloat(latentDim2Slider.value)]);
});

// Listener para el slider de la Dimensión Latente 2
latentDim2Slider.addEventListener('input', () => {
    const value = parseFloat(latentDim2Slider.value);
    latentDim2ValueSpan.textContent = value.toFixed(2);
    currentLatentYSpan.textContent = value.toFixed(2);
    generateLetter([parseFloat(latentDim1Slider.value), value]);
});

// Listener para el botón de Reiniciar Vista
resetViewButton.addEventListener('click', () => {
    latentDim1Slider.value = 0;
    latentDim1ValueSpan.textContent = '0.00';
    currentLatentXSpan.textContent = '0.00';
    latentDim2Slider.value = 0;
    latentDim2ValueSpan.textContent = '0.00';
    currentLatentYSpan.textContent = '0.00';
    generateLetter([0, 0]); // Genera la letra para el punto central (0,0)
});

// --- Inicio de la Aplicación ---
// Cargar el modelo y los datos latentes cuando la página se carga
loadModel();
loadLatentData();