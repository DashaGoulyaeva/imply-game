from diffusers import StableDiffusionPipeline
import torch

# Загружаем модель 
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5"
).to("cpu")  # Генерация на CPU

# Промпт, потом поменять на промпт из файла
prompt = "абстрактная весна, акварель, светлая атмосфера"

# Генерируем картинку
image = pipe(prompt).images[0]

# Сохраняем результат. потом поменять на сохранение типа sun01022026
image.save("test_image.png")

print("Генерация завершена! Файл: test_image.png")
