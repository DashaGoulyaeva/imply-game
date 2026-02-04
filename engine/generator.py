import random
import torch
from pathlib import Path
from datetime import datetime
from diffusers import StableDiffusionPipeline

# Конфигурация
IMG_WIDTH = 512
IMG_HEIGHT = 768
NUM_IMAGES = 5
MODEL_NAME = "runwayml/stable-diffusion-v1-5"

# Пути
BASE_DIR = Path(__file__).parent
DICT_DIR = BASE_DIR / "dictionaries"
TEMPLATE_FILE = BASE_DIR / "prompt_templates" / "main.txt"
TODAY = datetime.now().strftime("%Y-%m-%d")
OUTPUT_DIR = BASE_DIR.parent / "daily_output" / TODAY

def load_dict(name):
    filepath = DICT_DIR / f"{name}.txt"
    with open(filepath, 'r', encoding='utf-8') as f:
        return [line.strip() for line in f if line.strip()]

def load_template():
    with open(TEMPLATE_FILE, 'r', encoding='utf-8') as f:
        return f.read().strip()

def main():
    print(f"Генерация картин дня {TODAY}")
    
    # Создаем папку
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Генерируем промпты
    nouns = load_dict("nouns")
    themes = load_dict("themes")
    moods = load_dict("moods")
    template = load_template()
    
    prompts = []
    for i in range(NUM_IMAGES):
        prompt = template.replace("{noun}", random.choice(nouns)) \
                         .replace("{theme}", random.choice(themes)) \
                         .replace("{mood}", random.choice(moods))
        prompts.append(prompt)
    
    # Загружаем модель
    print("Загружаю модель Stable Diffusion...")
    pipe = StableDiffusionPipeline.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.float32,
        safety_checker=None
    )
    pipe = pipe.to("cpu")
    
    # Генерируем картинки
    for i, prompt in enumerate(prompts, 1):
        print(f"Генерация карточки {i}/{NUM_IMAGES}...")
        
        image = pipe(
            prompt=prompt,
            height=IMG_HEIGHT,
            width=IMG_WIDTH,
            num_inference_steps=25,
            guidance_scale=7.5
        ).images[0]
        
        # Сохраняем
        image.save(OUTPUT_DIR / f"card_{i:02d}.png")
        with open(OUTPUT_DIR / f"card_{i:02d}_prompt.txt", 'w', encoding='utf-8') as f:
            f.write(prompt)
    
    print(f"Готово! Результаты в {OUTPUT_DIR}")

if __name__ == "__main__":
    main()