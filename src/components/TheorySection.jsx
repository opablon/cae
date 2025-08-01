import React from 'react';
import redNeuronalBasica from '../assets/red_neuronal_basica.png';
import operacionConvolucion from '../assets/operacion_convolucion.png';
import autoencoder from '../assets/autoencoder.png';

const TheorySection = () => {
  return (
    <div className="max-w-7xl mx-auto mt-12 text-left text-gray-800">
      <h2 className="mb-6 text-3xl font-bold text-center text-blue-600">Comprendiendo el Espacio Latente: Un Viaje a través de las Redes Neuronales</h2>
      <p className="mb-4 leading-relaxed">Esta aplicación interactiva te permite explorar un concepto fascinante en el mundo de las redes neuronales artificiales: el espacio latente. Pero para entender qué es y cómo funciona, primero necesitamos desentrañar algunos principios básicos de las mismas.</p>

      <div className="p-6 my-6 bg-gray-50 rounded-lg">
        <h3 className="mb-4 text-2xl font-semibold text-blue-800">1. ¿Qué es una red neuronal artificial? El cerebro artificial</h3>
        <p>Imagina una red neuronal artificial como un "cerebro" simplificado diseñado para aprender de los datos. Está compuesta por capas de "neuronas" interconectadas, inspiradas en las neuronas biológicas.</p>
        <ul className="pl-5 my-4 space-y-2 list-disc">
          <li><strong>Neuronas:</strong> Cada neurona recibe una o más entradas, realiza una operación matemática (como una suma ponderada), y luego aplica una función de activación para producir una salida.</li>
          <li><strong>Conexiones (pesos):</strong> Las conexiones entre neuronas tienen "pesos" asociados. Estos pesos son los parámetros que la red ajusta durante el entrenamiento para aprender patrones en los datos.</li>
          <li><strong>Capas:</strong> Las neuronas se organizan en capas:
            <ul className="pl-5 mt-2 space-y-1 list-circle">
              <li><strong>Capa de entrada:</strong> Recibe los datos iniciales (por ejemplo, los píxeles de una imagen o las características de un objeto).</li>
              <li><strong>Capas ocultas:</strong> Son las "cajas negras" donde ocurre la magia del procesamiento. Aquí, la red extrae características y patrones complejos de los datos.</li>
              <li><strong>Capa de salida:</strong> Produce el resultado final de la red (por ejemplo, la clasificación de una imagen o un valor numérico).</li>
            </ul>
          </li>
        </ul>
        <p>El aprendizaje en una red neuronal artificial implica ajustar estos pesos y sesgos (valores adicionales que permiten a la neurona activar su salida incluso cuando sus entradas son cero) a través de un proceso llamado propagación hacia atrás (backpropagation) y descenso de gradiente (gradient descent), donde la red minimiza la diferencia entre sus predicciones y los valores reales.</p>
        <div className="my-6 text-center">
            <img src={redNeuronalBasica} alt="Diagrama de una Red Neuronal Artificial Básica" className="inline-block max-w-[50%] h-auto rounded-lg shadow-md"/>
            <p className="mt-2 text-sm text-gray-600 italic">Componentes básicos y flujo de datos en una red neuronal artificial.</p>
        </div>
      </div>

      <div className="p-6 my-6 bg-gray-50 rounded-lg">
        <h3 className="mb-4 text-2xl font-semibold text-blue-800">2. Redes Neuronales Convolucionales (CNNs): Viendo el Mundo como Imágenes</h3>
        <p>Mientras que una red neuronal "densa" (totalmente conectada) es excelente para datos estructurados, no es la más eficiente para imágenes. Aquí es donde entran en juego las Redes Neuronales Convolucionales (CNNs o ConvNets), diseñadas específicamente para procesar datos con una topología conocida, como imágenes.</p>
        <p>La clave de las CNNs radica en sus capas de convolución y agrupamiento (pooling):</p>
        <ul className="pl-5 my-4 space-y-2 list-disc">
            <li><strong>Capas de convolución:</strong> En lugar de conectar cada píxel a cada neurona (como lo haría una red densa), una capa de convolución utiliza pequeños "filtros" (también llamados kernels) que se "deslizan" sobre la imagen. Cada filtro detecta una característica específica, como bordes, esquinas o texturas.</li>
            <li><strong>Operación de convolución:</strong> Es como pasar una pequeña ventana sobre la imagen, multiplicando los píxeles de la ventana por los valores del filtro y sumándolos. El resultado es un "mapa de características" que resalta dónde se encontró esa característica en la imagen original.</li>
            <li><strong>Capas de agrupamiento (submuestreo):</strong> Estas capas reducen la dimensionalidad de los mapas de características. El tipo más común es el "Max Pooling", que toma el valor más grande dentro de una pequeña región, conservando la información más relevante y haciendo la red más robusta a pequeñas traslaciones.</li>
        </ul>
        <p>Después de varias capas de convolución y agrupamiento, las características extraídas se "aplanan" y se pasan a capas densas para realizar la tarea final (clasificación, generación, etc.).</p>
        <div className="my-6 text-center">
            <img src={operacionConvolucion} alt="Diagrama de la operación de convolución y pooling en una CNN" className="inline-block max-w-[90%] h-auto rounded-lg shadow-md"/>
            <p className="mt-2 text-sm text-gray-600 italic">Proceso de extracción de características en una Red Neuronal Convolucional.</p>
        </div>
      </div>

      <div className="p-6 my-6 bg-gray-50 rounded-lg">
        <h3 className="mb-4 text-2xl font-semibold text-blue-800">3. Autocodificadores: Aprendiendo a Comprimir y Generar</h3>
        <p>La aplicación que estás usando se basa en un tipo especial de red neuronal llamada autocodificador (autoencoder). Su objetivo principal es aprender una representación "comprimida" (o latente) de los datos de entrada y luego ser capaz de reconstruir el dato original a partir de esa representación comprimida.</p>
        <div className="my-6 text-center">
            <img src={autoencoder} alt="Diagrama de la arquitectura de un Autoencoder" className="inline-block max-w-[60%] h-auto rounded-lg shadow-md"/>
            <p className="mt-2 text-sm text-gray-600 italic">Arquitectura básica de un Autocodificador: Codificador, Espacio Latente y Decodificador.</p>
        </div>
        <p>Un Autocodificador se compone de dos partes principales:</p>
        <ul className="pl-5 my-4 space-y-2 list-disc">
            <li><strong>Codificador (Encoder ):</strong> Toma los datos de entrada (en este caso, una imagen de un carácter) y los comprime en un vector de baja dimensión, el espacio latente. Este vector captura las características más importantes de la imagen. Por ejemplo, para un carácter, podría aprender dimensiones que representen "curvatura", "inclinación", "anchura", etc.</li>
            <li>En esta aplicación, el encoder sería una red convolucional que "lee" la imagen del carácter y produce los dos valores X e Y que ves en el espacio latente.</li>
            <li><strong>Decodificador (Decoder ):</strong> Toma un punto del espacio latente (los valores X e Y que controlas con los sliders o haciendo clic) y lo "descomprime" para reconstruir la imagen original.</li>
            <li>En esta aplicación, el decoder es también una red convolucional (o una serie de capas convolucionales inversas/transpuestas) que toma los valores X e Y y los convierte en una imagen de carácter.</li>
        </ul>
        <p>El autoencoder se entrena para que la imagen reconstruida sea lo más parecida posible a la imagen de entrada original. De esta manera, el espacio latente se convierte en un mapa significativo donde puntos cercanos representan caracteres similares, y moverte por este espacio te permite "generar" nuevos caracteres que son combinaciones intermedias de los caracteres que la red ha visto durante su entrenamiento.</p>
        <p className="p-4 mt-6 font-semibold text-center text-blue-700 border-2 border-dashed border-blue-500 rounded-lg bg-blue-50"><strong>¡Ahora, explora!</strong> Cada punto en el gráfico representa un carácter que la red ha aprendido. Al hacer clic o mover los sliders, estás navegando por este espacio latente, y el decodificador te muestra cómo se "imagina" el carácter en esa posición.</p>
      </div>
    </div>
  );
};

export default TheorySection;
