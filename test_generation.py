#!/usr/bin/env python3
"""Простой тест генерации изображений через Stable Diffusion на CPU."""

import torch
from diffusers import StableDiffusionPipeline
from PIL import Image
import time
import os

def test_sd_generation():
    """Тестирует базовую генерацию изображения."""
    
    print("🔍 Проверяем окружение...")
    print(f"PyTorch версия: {torch.__version__}")
    print(f"Доступен CUDA: {torch.cuda.is_available()}")
    print(f"Количество CPU потоков: {torch.get_num_threads()}")
    
    # Создаём папку для результатов, если её нет
    os.makedirs("test_outputs", exist_ok=True)
    
    print("\n🚀 Загружаем модель Stable Diffusion...")
    print("(Первая загрузка может занять несколько минут)")
    
    try:
        # Используем облегчённую модель для CPU
        model_id = "runwayml/stable-diffusion-v1-5"
        
        # Инициализируем пайплайн для CPU
        pipe = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float32,
            safety_checker=None,  # Ускоряет загрузку
            requires_safety_checker=False
        )
        pipe = pipe.to("cpu")
        
        print("✅ Модель загружена успешно!")
        
        # Простой промпт для теста
        prompt = "a beautiful sunset over mountains, digital art"
        
        print(f"\n🎨 Генерируем изображение по промпту: '{prompt}'")
        print("⏳ Это может занять 2-5 минут на CPU...")
        
        start_time = time.time()
        
        # Генерация изображения
        with torch.no_grad():
            image = pipe(
                prompt,
                num_inference_steps=20,  # Меньше шагов для быстрой генерации
                guidance_scale=7.5,
                height=256,  # Меньшее разрешение для скорости
                width=256
            ).images[0]
        
        generation_time = time.time() - start_time
        
        # Сохраняем результат
        output_path = "test_outputs/first_generation.png"
        image.save(output_path)
        
        print(f"✅ Генерация завершена за {generation_time:.1f} секунд")
        print(f"💾 Изображение сохранено: {output_path}")
        
        # Показываем информацию об изображении
        print(f"\n📊 Информация об изображении:")
        print(f"   Размер: {image.size}")
        print(f"   Режим: {image.mode}")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка при генерации: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Тест Stable Diffusion на CPU")
    print("=" * 60)
    
    success = test_sd_generation()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ Тест пройден успешно! Stable Diffusion работает.")
        print("🎉 Можете приступать к интеграции в свою игру!")
    else:
        print("❌ Тест не пройден. Проверьте зависимости и настройки.")
    print("=" * 60)
