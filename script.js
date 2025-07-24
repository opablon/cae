// --- RUTAS DE ARCHIVOS ---
const modelPath = './tfjs_decoder_model_20250724_135134/model.json';
const latentDataPath = './latent_space_data_20250724_130013.json';

// --- Variables Globales ---
let decoderModel;
let latentData;

// Variables globales para los rangos del espacio latente
let xMinGlobal, xMaxGlobal, yMinGlobal, yMaxGlobal;

// Obtener referencias a los elementos del DOM (HTML)
const canvas = document.getElementById('generatedLetterCanvas');
const ctx = canvas.getContext('2d'); // Contexto 2D para dibujar en el canvas del carácter

const plotCanvas = document.getElementById('latentPlotCanvas');
const plotCtx = plotCanvas.getContext('2d'); // Contexto 2D para dibujar en el canvas del gráfico

const latentDim1Slider = document.getElementById('latentDim1');
const latentDim2Slider = document.getElementById('latentDim2');
const latentDim1ValueSpan = document.getElementById('latentDim1Value'); // Span para el valor numérico al lado del slider
const latentDim2ValueSpan = document.getElementById('latentDim2Value'); // Span para el valor numérico al lado del slider
const resetViewButton = document.getElementById('resetView');
const inputLatentX = document.getElementById('inputLatentX'); // Input editable para X
const inputLatentY = document.getElementById('inputLatentY'); // Input editable para Y

const imageSize = 64; // El tamaño de las imágenes de tus caracteres (64x64 píxeles)
let plotData = []; // Array que contendrá los datos de las coordenadas latentes y sus etiquetas para el gráfico
const plotPointSize = 5; // Tamaño de los puntos en el gráfico
const plotMargin = 70;   // Margen alrededor del gráfico para asegurar que los puntos no queden en el borde (AUMENTADO OTRA VEZ)

// --- Funciones de Carga (Asíncronas) ---

/**
 * Carga el modelo decodificador de TensorFlow.js.
 */
async function loadModel() {
    try {
        decoderModel = await tf.loadGraphModel(modelPath);
        console.log('Modelo decodificador cargado exitosamente.');
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
            label: latentData.labels[index] // Etiqueta (carácter) correspondiente
        }));
        console.log('Datos del espacio latente cargados exitosamente.');

        // --- Calcular los rangos reales y ajustar los sliders ---
        const xCoords = plotData.map(p => p.x);
        const yCoords = plotData.map(p => p.y);
        xMinGlobal = Math.min(...xCoords);
        xMaxGlobal = Math.max(...xCoords);
        yMinGlobal = Math.min(...yCoords);
        yMaxGlobal = Math.max(...yCoords);

        // Ajustar los sliders al rango real de los datos latentes
        // Añadimos un pequeño margen extra para que no estén justo en el borde
        const sliderPadding = 5; 
        latentDim1Slider.min = (xMinGlobal - sliderPadding).toFixed(2);
        latentDim1Slider.max = (xMaxGlobal + sliderPadding).toFixed(2);
        latentDim2Slider.min = (yMinGlobal - sliderPadding).toFixed(2);
        latentDim2Slider.max = (yMaxGlobal + sliderPadding).toFixed(2);

        // Reiniciar los valores de los sliders al centro del nuevo rango (0,0)
        latentDim1Slider.value = 0; 
        latentDim2Slider.value = 0; 
        latentDim1ValueSpan.textContent = '0.00'; // Actualizar span del slider
        latentDim2ValueSpan.textContent = '0.00'; // Actualizar span del slider
        inputLatentX.value = '0.00'; // Actualizar input editable
        inputLatentY.value = '0.00'; // Actualizar input editable

        drawLatentSpace(); // Dibujar el espacio latente una vez cargados los datos
        generateLetter([0, 0]); // Generar el carácter inicial después de cargar todo
    } catch (error) {
        console.error('Error al cargar los datos latentes:', error);
        alert('No se pudieron cargar los datos del espacio latente. Consulta la consola para más detalles.');
    }
}

// --- Funciones de Dibujo ---

/**
 * Dibuja una grilla y ejes en el canvas del espacio latente.
 * @param {number} width - Ancho del canvas.
 * @param {number} height - Alto del canvas.
 * @param {number} xMin - Valor mínimo de la dimensión X latente.
 * @param {number} xMax - Valor máximo de la dimensión X latente.
 * @param {number} yMin - Valor mínimo de la dimensión Y latente.
 * @param {number} yMax - Valor máximo de la dimensión Y latente.
 */
function drawGridAndAxes(width, height, xMin, xMax, yMin, yMax) {
    plotCtx.strokeStyle = '#e0e0e0'; // Color de la grilla (gris claro)
    plotCtx.lineWidth = 0.5;

    const numGridLines = 10; // Número aproximado de líneas de grilla

    // Calcular los factores de escala para mapear valores latentes a píxeles
    // Restamos un poco más para asegurar el margen extra para las letras
    const effectiveWidth = width - 2 * plotMargin - 20; // Reduce el área de dibujo 20px extra
    const effectiveHeight = height - 2 * plotMargin - 20; // Reduce el área de dibujo 20px extra

    const xScale = effectiveWidth / (xMax - xMin);
    const yScale = effectiveHeight / (yMax - yMin);

    // Desplazamiento adicional para centrar el área de dibujo reducida
    const xOffset = plotMargin + 10; // 10px adicionales de margen a la izquierda/derecha
    const yOffset = plotMargin + 10; // 10px adicionales de margen arriba/abajo

    // --- Dibujar Grilla ---
    // Líneas verticales (eje X)
    for (let i = 0; i <= numGridLines; i++) {
        const xVal = xMin + (i / numGridLines) * (xMax - xMin);
        const xPixel = xOffset + (xVal - xMin) * xScale;
        plotCtx.beginPath();
        plotCtx.moveTo(xPixel, yOffset);
        plotCtx.lineTo(xPixel, height - yOffset);
        plotCtx.stroke();
    }

    // Líneas horizontales (eje Y)
    for (let i = 0; i <= numGridLines; i++) {
        const yVal = yMin + (i / numGridLines) * (yMax - yMin);
        // Recordar invertir Y para píxeles
        const yPixel = height - yOffset - (yVal - yMin) * yScale;
        plotCtx.beginPath();
        plotCtx.moveTo(xOffset, yPixel);
        plotCtx.lineTo(width - xOffset, yPixel);
        plotCtx.stroke();
    }

    // --- Dibujar Ejes (más oscuros y gruesos) ---
    plotCtx.strokeStyle = '#666'; // Color de los ejes (gris más oscuro)
    plotCtx.lineWidth = 1;

    // Eje X (horizontal)
    plotCtx.beginPath();
    plotCtx.moveTo(xOffset, height - yOffset);
    plotCtx.lineTo(width - xOffset, height - yOffset);
    plotCtx.stroke();

    // Eje Y (vertical)
    plotCtx.beginPath();
    plotCtx.moveTo(xOffset, yOffset);
    plotCtx.lineTo(xOffset, height - yOffset);
    plotCtx.stroke();

    // --- Etiquetas de los Ejes (Valores) ---
    plotCtx.fillStyle = '#333';
    plotCtx.font = '10px Arial';
    plotCtx.textAlign = 'center';
    plotCtx.textBaseline = 'top';

    // Etiquetas Eje X
    const xStep = (xMax - xMin) / 5; // Aproximadamente 5 etiquetas en X
    for (let i = 0; i <= 5; i++) {
        const val = xMin + i * xStep;
        const xPixel = xOffset + (val - xMin) * xScale;
        plotCtx.fillText(val.toFixed(1), xPixel, height - yOffset + 5); // Ajustado
    }

    plotCtx.textAlign = 'right';
    plotCtx.textBaseline = 'middle';
    // Etiquetas Eje Y
    const yStep = (yMax - yMin) / 5; // Aproximadamente 5 etiquetas en Y
    for (let i = 0; i <= 5; i++) {
        const val = yMin + i * yStep;
        const yPixel = height - yOffset - (val - yMin) * yScale;
        plotCtx.fillText(val.toFixed(1), xOffset - 5, yPixel); // Ajustado
    }

    // Títulos de los ejes
    plotCtx.textAlign = 'center';
    plotCtx.textBaseline = 'top';
    plotCtx.font = '12px Arial';
    plotCtx.fillText('Dimensión Latente 1', width / 2, height - plotMargin + 40); // Ajustado

    plotCtx.save(); // Guarda el estado actual del contexto
    plotCtx.translate(plotMargin - 65, height / 2); // Mueve el origen para rotar (AJUSTADO AÚN MÁS)
    plotCtx.rotate(-Math.PI / 2); // Rota 90 grados a la izquierda
    plotCtx.fillText('Dimensión Latente 2', 0, 0);
    plotCtx.restore(); // Restaura el estado original del contexto
}

/**
 * Dibuja los puntos de referencia del espacio latente en el canvas del gráfico.
 */
function drawLatentSpace() {
    if (!plotData || !plotCanvas || xMinGlobal === undefined) { // Añadir comprobación para rangos globales
        return;
    }

    const width = plotCanvas.width;
    const height = plotCanvas.height;
    plotCtx.clearRect(0, 0, width, height); // Limpiar el canvas antes de redibujar

    // Dibujar grilla y ejes usando los rangos globales
    drawGridAndAxes(width, height, xMinGlobal, xMaxGlobal, yMinGlobal, yMaxGlobal);

    // Calcular factores de escala para mapear valores latentes a píxeles
    // Usar los mismos "effective" width/height y "offset" que en drawGridAndAxes
    const effectiveWidth = width - 2 * plotMargin - 20;
    const effectiveHeight = height - 2 * plotMargin - 20;
    const xOffset = plotMargin + 10;
    const yOffset = plotMargin + 10;

    const xScale = effectiveWidth / (xMaxGlobal - xMinGlobal);
    const yScale = effectiveHeight / (yMaxGlobal - yMinGlobal);

    // Dibujar cada punto y su etiqueta
    plotData.forEach(point => {
        // Convertir coordenadas latentes a coordenadas de píxeles en el canvas
        const xPixel = xOffset + (point.x - xMinGlobal) * xScale;
        // El eje Y del canvas va de arriba (0) a abajo (max), así que lo invertimos para el gráfico
        const yPixel = height - yOffset - (point.y - yMinGlobal) * yScale;

        // Dibujar el círculo
        plotCtx.beginPath();
        plotCtx.arc(xPixel, yPixel, plotPointSize, 0, 2 * Math.PI);
        plotCtx.fillStyle = '#007bff'; // Color de los puntos
        plotCtx.fill();
        plotCtx.strokeStyle = '#0056b3'; // Borde de los puntos
        plotCtx.lineWidth = 1;
        plotCtx.stroke();

        // Dibujar la etiqueta (el carácter)
        plotCtx.font = '12px Arial';
        plotCtx.fillStyle = '#333';
        plotCtx.textAlign = 'center';
        plotCtx.textBaseline = 'bottom'; // Alinea el texto a la parte inferior
        plotCtx.fillText(point.label, xPixel, yPixel - plotPointSize - 2); // Posicionar encima del punto
    });
}

/**
 * Genera y dibuja un carácter en el canvas de salida a partir de un vector latente.
 * @param {Array<number>} latentVector - Un array de 2 elementos [dim1, dim2] representando el vector latente.
 */
async function generateLetter(latentVector) {
    if (!decoderModel) {
        console.warn('El modelo decodificador no está cargado. No se puede generar el carácter.');
        return;
    }

    // Crear un tensor de entrada con la forma esperada por el decodificador: [1, 2]
    // (1 para el batch_size, 2 para las dimensiones latentes)
    const latentTensor = tf.tensor2d([latentVector]);
    let outputTensor = null;
    let imageTensor = null;
    let normalizedImageTensor = null;

    try {
        // Realizar la predicción (reconstrucción de la imagen)
        outputTensor = decoderModel.predict(latentTensor);

        // El tensor de salida suele tener la forma [1, imageSize, imageSize, 1] (batch, alto, ancho, canales)
        // Eliminamos las dimensiones de batch y canal para obtener un tensor 2D de la imagen
        imageTensor = outputTensor.squeeze(); // Ahora es [imageSize, imageSize]

        // Normalizar los valores del tensor (0-1) a un rango de 0-255 (para los píxeles)
        // Redondear, asegurar valores entre 0-255 y castear a int32 para ImageData
        normalizedImageTensor = imageTensor.mul(255).round().clipByValue(0, 255).cast('int32');

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
        
        // Limpiar el canvas del carácter antes de dibujar
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Crear un objeto ImageData y dibujarlo en el canvas
        const imageDataObject = new ImageData(rgbaData, imageSize, imageSize);
        ctx.putImageData(imageDataObject, 0, 0); // Dibuja la imagen reconstruida

    } catch (error) {
        console.error('Error al generar el carácter:', error);
        alert('Ocurrió un error al generar el carácter. Consulta la consola para más detalles.');
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
    if (!decoderModel || !latentData || xMinGlobal === undefined) {
        console.warn('El modelo, los datos latentes o los rangos no se han cargado aún. Esperando...');
        return;
    }

    // Obtener la posición del clic relativa al canvas
    const rect = plotCanvas.getBoundingClientRect();
    const xPixel = event.clientX - rect.left;
    const yPixel = event.clientY - rect.top;

    const width = plotCanvas.width;
    const height = plotCanvas.height;

    // COMPROBACIÓN: Asegurarse de que el clic esté dentro del área de la grilla
    // Usar los mismos offsets que en drawGridAndAxes
    const xOffset = plotMargin + 10;
    const yOffset = plotMargin + 10;

    if (xPixel < xOffset || xPixel > (width - xOffset) ||
        yPixel < yOffset || yPixel > (height - yOffset)) {
        console.log('Clic fuera del área de la grilla. Ignorado.');
        return; // Ignorar el clic si está fuera de los márgenes de la grilla
    }

    // Revertir la normalización para obtener las coordenadas latentes correspondientes al clic
    const effectiveWidth = width - 2 * plotMargin - 20;
    const effectiveHeight = height - 2 * plotMargin - 20;

    const xScale = effectiveWidth / (xMaxGlobal - xMinGlobal);
    const yScale = effectiveHeight / (yMaxGlobal - yMinGlobal);

    const latentX = xMinGlobal + (xPixel - xOffset) / xScale;
    const latentY = yMaxGlobal - (yPixel - yOffset) / yScale; // Invertir el eje Y de nuevo para obtener el valor latente correcto

    // Actualizar los inputs editables
    inputLatentX.value = latentX.toFixed(2);
    inputLatentY.value = latentY.toFixed(2);

    // Actualizar los sliders y sus spans de valor numérico
    latentDim1Slider.value = latentX;
    latentDim1ValueSpan.textContent = latentX.toFixed(2);
    latentDim2Slider.value = latentY;
    latentDim2ValueSpan.textContent = latentY.toFixed(2);
    
    // Generar el carácter con las nuevas coordenadas latentes
    generateLetter([latentX, latentY]);
});

// Listener para el slider de la Dimensión Latente 1
latentDim1Slider.addEventListener('input', () => {
    const value = parseFloat(latentDim1Slider.value);
    latentDim1ValueSpan.textContent = value.toFixed(2); // Actualizar span del slider
    inputLatentX.value = value.toFixed(2); // Sincronizar input editable
    generateLetter([value, parseFloat(latentDim2Slider.value)]);
});

// Listener para el slider de la Dimensión Latente 2
latentDim2Slider.addEventListener('input', () => {
    const value = parseFloat(latentDim2Slider.value);
    latentDim2ValueSpan.textContent = value.toFixed(2); // Actualizar span del slider
    inputLatentY.value = value.toFixed(2); // Sincronizar input editable
    generateLetter([parseFloat(latentDim1Slider.value), value]);
});

// Listener para el botón de Reiniciar Vista
resetViewButton.addEventListener('click', () => {
    latentDim1Slider.value = 0;
    latentDim1ValueSpan.textContent = '0.00';
    latentDim2Slider.value = 0;
    latentDim2ValueSpan.textContent = '0.00';
    inputLatentX.value = '0.00'; // Sincronizar input editable
    inputLatentY.value = '0.00'; // Sincronizar input editable
    generateLetter([0, 0]); // Genera el carácter para el punto central (0,0)
});

// Listener para el input de la Dimensión Latente X
inputLatentX.addEventListener('change', () => { // 'change' se dispara al perder el foco o presionar Enter
    let value = parseFloat(inputLatentX.value);
    if (isNaN(value)) value = 0.00; // Si no es un número válido, usa 0
    inputLatentX.value = value.toFixed(2); // Formatear el valor
    
    // Asegurarse de que el valor del slider esté dentro de sus límites
    value = Math.max(parseFloat(latentDim1Slider.min), Math.min(parseFloat(latentDim1Slider.max), value));
    latentDim1Slider.value = value; // Sincronizar slider
    latentDim1ValueSpan.textContent = value.toFixed(2); // Sincronizar span del slider
    
    generateLetter([value, parseFloat(inputLatentY.value)]);
});

// Listener para el input de la Dimensión Latente Y
inputLatentY.addEventListener('change', () => { // 'change' se dispara al perder el foco o presionar Enter
    let value = parseFloat(inputLatentY.value);
    if (isNaN(value)) value = 0.00; // Si no es un número válido, usa 0
    inputLatentY.value = value.toFixed(2); // Formatear el valor

    // Asegurarse de que el valor del slider esté dentro de sus límites
    value = Math.max(parseFloat(latentDim2Slider.min), Math.min(parseFloat(latentDim2Slider.max), value));
    latentDim2Slider.value = value; // Sincronizar slider
    latentDim2ValueSpan.textContent = value.toFixed(2); // Sincronizar span del slider

    generateLetter([parseFloat(inputLatentX.value), value]);
});

// --- Inicio de la Aplicación ---
// Cargar el modelo y los datos latentes cuando la página se carga
loadModel();
loadLatentData();
