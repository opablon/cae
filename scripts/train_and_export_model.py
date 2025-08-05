# ==============================================================================
# Proyecto: Autoencoder Convolucional para Navegación de Espacio Latente
# Este script demuestra el flujo completo del proyecto: generación de datos,
# construcción y entrenamiento del modelo, análisis y exportación de resultados
# para una aplicación web.
# ==============================================================================

# --- 1. Importación de Librerías y Configuración ---
# ---------------------------------------------------
import os
import datetime
import json
import keras
from keras import models, layers
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import string
import matplotlib.pyplot as plt
import subprocess
import tensorflow as tf

# Define la ruta base para guardar los archivos.
# !IMPORTANTE!: El usuario debe crear esta carpeta y colocar la fuente
# (Roboto-Regular.ttf) aquí.
path = "./model_files"
font_path = f"{path}/Roboto-Regular.ttf"
os.makedirs(path, exist_ok=True) # Crea la carpeta si no existe

image_size = (64, 64)
font_size = 70
latent_dims = 2
characters = string.ascii_uppercase
epochs_per_run = 500

# --- 2. Generación del Dataset de Caracteres ---
# -----------------------------------------------
# Este bloque genera imágenes binarias de 64x64 de las letras mayúsculas
# de la fuente Roboto, que servirán como nuestro dataset de entrenamiento.
print("Generando dataset de caracteres...")
images_2d_list = []
labels_list = []

try:
    font = ImageFont.truetype(font_path, font_size)
except IOError:
    print(f"Error: No se pudo cargar la fuente en '{font_path}'.")
    print("Asegúrate de haber descargado 'Roboto-Regular.ttf' y haberla colocado en la carpeta 'model_files'.")
    exit()

for char in characters:
    img = Image.new('L', image_size, color=255)
    d = ImageDraw.Draw(img)
    bbox = d.textbbox((0, 0), char, font=font)
    x = (image_size[0] / 2) - ((bbox[0] + bbox[2]) / 2)
    y = (image_size[1] / 2) - ((bbox[1] + bbox[3]) / 2)
    d.text((x, y), char, font=font, fill=0)
    np_img = np.array(img)
    binary_img = (np_img < 128).astype(float)
    processed_img = np.expand_dims(binary_img, axis=-1)
    images_2d_list.append(processed_img)
    labels_list.append(char)

x_train_cae = np.array(images_2d_list)
labels_np = np.array(labels_list)
input_shape_cae = x_train_cae.shape[1:]
print("Dataset de caracteres generado con éxito.")

# --- 3. Construcción del Autoencoder Convolucional ---
# -----------------------------------------------------
print("\nConstruyendo la arquitectura del Autoencoder...")
# Encoder
cae_encoder = models.Sequential([
    layers.Input(shape=input_shape_cae),
    layers.Conv2D(filters=32, kernel_size=(3, 3), padding='same', strides=(2, 2), activation='relu'),
    layers.Conv2D(filters=64, kernel_size=(3, 3), padding='same', strides=(2, 2), activation='relu'),
    layers.Conv2D(filters=128, kernel_size=(3, 3), padding='same', strides=(2, 2), activation='relu'),
    layers.Flatten(),
    layers.Dense(units=latent_dims, activation='linear')
], name="encoder")
cae_encoder.summary()

# Decoder
decoder_input_dim = (8, 8, 128)
dense_output_units = np.prod(decoder_input_dim)
cae_decoder = models.Sequential([
    layers.Input(shape=(latent_dims,)),
    layers.Dense(dense_output_units, activation='relu'),
    layers.Reshape(decoder_input_dim),
    layers.Conv2DTranspose(filters=128, kernel_size=(3, 3), strides=(2, 2), padding='same', activation='relu'),
    layers.Conv2DTranspose(filters=64, kernel_size=(3, 3), strides=(2, 2), padding='same', activation='relu'),
    layers.Conv2DTranspose(filters=32, kernel_size=(3, 3), strides=(2, 2), padding='same', activation='relu'),
    layers.Conv2D(filters=1, kernel_size=(3, 3), padding='same', activation='sigmoid')
], name="decoder")
cae_decoder.summary()

# Autoencoder completo
cae_autoencoder = models.Sequential([cae_encoder, cae_decoder], name="cae_autoencoder")
cae_autoencoder.summary()

# Compilación del modelo
initial_learning_rate = 0.001
opt = keras.optimizers.Adam(learning_rate=initial_learning_rate)
cae_autoencoder.compile(optimizer=opt, loss='binary_crossentropy', metrics=['binary_accuracy'])

# --- 4. Entrenamiento del Modelo de Manera Incremental ---
# ---------------------------------------------------------
print("\nIniciando entrenamiento del Autoencoder...")
print(f"Entrenando por {epochs_per_run} épocas...")
historialAcumulado = {
    'loss': [],
    'binary_accuracy': []
}
history_cae = cae_autoencoder.fit(
    x_train_cae, x_train_cae,
    epochs=epochs_per_run,
    verbose=2
)
for key, value in history_cae.history.items():
    historialAcumulado[key].extend(value)
print(f"\nEntrenamiento de {epochs_per_run} épocas finalizado. ¡Puedes volver a ejecutar esta sección para continuar el entrenamiento de manera incremental! 💪")

# --- 5. Visualización del Progreso y Resultados ---
# --------------------------------------------------
print("\n--- Visualización de Métricas de Entrenamiento ---")
plt.figure(figsize=(10, 5))
plt.suptitle('Pérdida y Precisión Binaria durante el Entrenamiento')
plt.subplot(1, 2, 1)
plt.plot(historialAcumulado['loss'])
plt.title('Pérdida')
plt.xlabel('épocas')
plt.subplot(1, 2, 2)
plt.plot(historialAcumulado['binary_accuracy'])
plt.title('Precisión binaria')
plt.xlabel('épocas')
plt.tight_layout()
plt.show()

print("\n--- Visualizando Reconstrucciones (Original vs. Reconstruida) ---")
num_letters_to_show = 10
sample_original_images = x_train_cae[:num_letters_to_show]
sample_original_labels = labels_np[:num_letters_to_show]
reconstructed_images = cae_autoencoder.predict(sample_original_images)
plt.figure(figsize=(num_letters_to_show * 1.5, 4))
plt.suptitle("Original vs. Reconstrucción por Autoencoder", fontsize=16)
for i in range(num_letters_to_show):
    ax = plt.subplot(2, num_letters_to_show, i + 1)
    plt.imshow(sample_original_images[i].squeeze(), cmap='gray')
    ax.set_title(sample_original_labels[i], fontsize=12)
    ax.axis('off')
    ax = plt.subplot(2, num_letters_to_show, i + 1 + num_letters_to_show)
    plt.imshow(reconstructed_images[i].squeeze(), cmap='gray')
    ax.axis('off')
plt.show()

print("\n--- Visualizando el Espacio Latente 2D ---")
if latent_dims == 2:
    all_latent_representations = cae_encoder.predict(x_train_cae)
    plt.figure(figsize=(10, 8))
    plt.scatter(all_latent_representations[:, 0], all_latent_representations[:, 1], alpha=0.7)
    for i, char_label in enumerate(labels_np):
        plt.annotate(char_label,
                     (all_latent_representations[i, 0], all_latent_representations[i, 1]),
                     textcoords="offset points", xytext=(0, 10), ha='center', fontsize=9)
    plt.title("Visualización del Espacio Latente (2D)")
    plt.xlabel("Dimensión Latente 1")
    plt.ylabel("Dimensión Latente 2")
    plt.grid(True)
    plt.show()

# --- 6. Guardado de Modelos y Datos ---
# --------------------------------------
print("\n--- Guardando Modelos y Datos ---")
version = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
# Guarda el historial de entrenamiento
with open(f'{path}/cae_autoencoder_{version}.json', 'w') as f:
    json.dump(historialAcumulado, f)
print(f'Historial guardado en {path}/cae_autoencoder_{version}.json')
# Guarda el modelo autoencoder completo
cae_autoencoder.save(f'{path}/cae_autoencoder_{version}.h5')
print(f'Modelo completo guardado en {path}/cae_autoencoder_{version}.h5')
# Guarda el modelo encoder y decoder por separado
cae_encoder.save(f'{path}/cae_encoder_{version}.h5')
print(f'Modelo encoder guardado en {path}/cae_encoder_{version}.h5')
cae_decoder.save(f'{path}/cae_decoder_{version}.h5')
print(f'Modelo decoder guardado en {path}/cae_decoder_{version}.h5')
# Guarda las coordenadas latentes en un JSON
all_latent_representations = cae_encoder.predict(x_train_cae)
latent_coords_list = all_latent_representations.tolist()
data_to_save = {
    'latent_coords': latent_coords_list,
    'labels': labels_np.tolist()
}
output_json_filename = f'latent_space_data_{version}.json'
full_output_path = os.path.join(path, output_json_filename)
with open(full_output_path, 'w') as f:
    json.dump(data_to_save, f, indent=4)
print(f"Datos del espacio latente guardados en {full_output_path}")

# --- 7. Conversión del Decoder a TensorFlow.js ---
# --------------------------------------------------
print("\n--- Convirtiendo Decoder a TensorFlow.js ---")
try:
    # Guardar el modelo en formato SavedModel para la conversión
    saved_model_output_dir = os.path.join(path, f'cae_decoder_saved_model_{version}')
    tf.saved_model.save(cae_decoder, saved_model_output_dir)
    # Realizar la conversión
    tfjs_output_path = os.path.join(path, f'tfjs_decoder_model_{version}')
    command = [
        "tensorflowjs_converter",
        "--input_format=tf_saved_model",
        "--output_format=tfjs_graph_model",
        saved_model_output_dir,
        tfjs_output_path
    ]
    subprocess.run(command, check=True)
    print(f"Modelo TensorFlow.js guardado exitosamente en {tfjs_output_path}")
except subprocess.CalledProcessError as e:
    print(f"Error: El comando tensorflowjs_converter falló. Asegúrate de que esté instalado.")
except Exception as e:
    print(f"Ocurrió un error inesperado durante la conversión a TF.js: {e}")
