from diffusers import StableDiffusionPipeline
import torch

# Загружаем модель
    "runwayml/stable-diffusion-v1-5"
).to("cpu")  # Генерация на CPU

# Промпт для генерации, заменить на промт из файла
prompt = "абстрактная весна, акварель, светлая атмосфера"

# Генерируем картинку
image = pipe(prompt).images[0]

# Сохраняем результат, потом заменить на генерацию по системному времени вида sun0102 (воскресенье первое февраля)
image.save("test_image.png")

print("Генерация завершена! Файл: test_image.png")
