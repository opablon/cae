# Explorador Interactivo de Espacio Latente de Caracteres

## 🚀 Visión General

Este proyecto presenta una aplicación web interactiva que permite a los usuarios explorar el **espacio latente** de caracteres generados por un **Autoencoder Convolucional**. El objetivo es visualizar cómo una red neuronal comprime la información de caracteres en una representación de baja dimensión y cómo esta representación puede ser utilizada para generar nuevas variaciones de caracteres.

La aplicación permite al usuario seleccionar puntos en un gráfico de espacio latente de referencia o ajustar dimensiones manualmente para observar en tiempo real la reconstrucción del carácter por el decodificador del autoencoder.

## ✅ Deploy en GitHub Pages

[Link](https://opablon.github.io/cae/)

## ✨ Características Principales

* **Visualización Interactiva del Espacio Latente:** Gráfico 2D que mapea caracteres a un espacio bidimensional, mostrando la distribución de las letras aprendidas.
* **Generación de Caracteres en Tiempo Real:** Reconstrucción de caracteres basada en puntos seleccionados en el gráfico o coordenadas ajustadas manualmente.
* **Controles de Usuario Intuitivos:** Sliders y campos de texto para ajuste fino y entrada directa de coordenadas.
* **Explicación Teórica Integrada:** La propia aplicación web incluye una sección detallada sobre el funcionamiento de redes neuronales, CNNs y autoencoders, para un aprendizaje contextual.

## ⚙️ Tecnologías Utilizadas

* **Frontend:**
  * **Framework:** [React](https://react.dev/)
  * **Bundler/Dev Server:** [Vite](https://vitejs.dev/)
  * **Estilos CSS:** [Tailwind CSS](https://tailwindcss.com/)
  * **Visualización de Gráficos:** HTML5 Canvas
* **Machine Learning (Inferencia en navegador):** [TensorFlow.js](https://www.tensorflow.org/js)
* **Desarrollo del Modelo ML (Entrenamiento y Exportación):** [Python](https://www.python.org/), [TensorFlow](https://www.tensorflow.org/), [Keras](https://keras.io/)
* **Entorno de Desarrollo ML:** [Google Colab](https://colab.google/)
* **Manipulación de Imágenes:** [PIL (Pillow)](https://pillow.readthedocs.io/en/stable/)
* **Manipulación de Datos:** [NumPy](https://numpy.org/)
* **Visualización de Datos (en Colab):** [Matplotlib](https://matplotlib.org/)

## 🧠 El Modelo (Autoencoder Convolucional)

El corazón de esta aplicación es un **Autoencoder Convolucional** diseñado para:
1.  **Codificar** imágenes de caracteres (64x64 píxeles en escala de grises) en un espacio latente de **2 dimensiones**.
2.  **Decodificar** un punto de este espacio latente de vuelta a una imagen de carácter.

El modelo fue entrenado en un entorno de Google Colab utilizando Keras/TensorFlow con un dataset de las letras mayúsculas del alfabeto, generadas programáticamente con una fuente `Roboto-Regular.ttf`.

### **Arquitectura Detallada (Keras):**

**Encoder Summary:**

| Layer (type) | Output Shape | Param # |
| :----------- | :----------- | :------ |
| conv2d (Conv2D) | (None, 32, 32, 32) | 320 |
| conv2d_1 (Conv2D) | (None, 16, 16, 64) | 18,496 |
| conv2d_2 (Conv2D) | (None, 8, 8, 128) | 73,856 |
| flatten (Flatten) | (None, 8192) | 0 |
| dense (Dense) | (None, 2) | 16,386 |
| | **Total params:** | 109,058 |
| | **Trainable params:** | 109,058 |
| | **Non-trainable params:** | 0 |

**Decoder Summary:**

| Layer (type) | Output Shape | Param # |
| :----------- | :----------- | :------ |
| dense_1 (Dense) | (None, 8192) | 24,576 |
| reshape (Reshape) | (None, 8, 8, 128) | 0 |
| conv2d_transpose (Conv2DTranspose) | (None, 16, 16, 128) | 147,584 |
| conv2d_transpose_1 (Conv2DTranspose) | (None, 32, 32, 64) | 73,792 |
| conv2d_transpose_2 (Conv2DTranspose) | (None, 64, 64, 32) | 18,464 |
| conv2d_3 (Conv2D) | (None, 64, 64, 1) | 289 |
| | **Total params:** | 264,705 |
| | **Trainable params:** | 264,705 |
| | **Non-trainable params:** | 0 |

**Autoencoder (Full Model) Summary:**

| Layer (type) | Output Shape | Param # |
| :----------- | :----------- | :------ |
| sequential (Sequential) | (None, 2) | 109,058 |
| sequential_1 (Sequential) | (None, 64, 64, 1) | 264,705 |
| | **Total params:** | 373,763 |
| | **Trainable params:** | 373,763 |
| | **Non-trainable params:** | 0 |

### **Entrenamiento y Exportación:**
El modelo fue entrenado durante 3500 épocas (realizadas en 7 tandas de 500 épocas). Después del entrenamiento, el modelo `decoder` (que es el responsable de generar las imágenes a partir del espacio latente) fue guardado en formato SavedModel de TensorFlow y luego convertido a un `tfjs_graph_model` utilizando `tensorflowjs_converter`. Esto permite que el modelo se cargue y ejecute directamente en el navegador web utilizando TensorFlow.js.

Además, las coordenadas latentes de todos los caracteres entrenados fueron extraídas con el `encoder` y guardadas en un archivo JSON para servir como referencia en el gráfico interactivo de la aplicación web.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras un error, tienes una sugerencia de mejora o quieres añadir nuevas características, por favor, abre un "issue" o envía un "pull request".

## ✉️ Contacto

[Pablo Occhiuzzi](https://www.linkedin.com/in/opablon/)
