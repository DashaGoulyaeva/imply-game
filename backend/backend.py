from flask import Flask, request, jsonify
from flask_cors import CORS

import json
from datetime import datetime
import os
# Определяем базовую директорию проекта (папку, в которой лежит папка 'backend')
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__)
CORS(app)

@app.route('/api/submit-choice', methods=['POST'])
def submit_choice():
    # 1. Получить данные из запроса (какую карточку выбрали)
    data = request.get_json()
    card_id = data.get('card_id')  # Например, "02"
    # 2. Определить путь к файлу для сегодняшнего дня
    today = datetime.now().strftime("%Y-%m-%d")
    choices_file = os.path.join(PROJECT_ROOT, "daily_output", today, "choices.json")
    # 3. Прочитать старые выборы или создать новый список
    if os.path.exists(choices_file):
        with open(choices_file, 'r', encoding='utf-8') as f:
            choices = json.load(f)
    else:
        choices = []
    # 4. Добавить новый выбор
    choices.append({
        "card_id": card_id,
        "timestamp": datetime.now().isoformat()
    })
    # 5. Сохранить обновлённый список обратно в файл
    with open(choices_file, 'w', encoding='utf-8') as f:
        json.dump(choices, f, indent=2, ensure_ascii=False)
    # 6. Ответить фронтенду, что всё ок
    return jsonify({"success": True, "message": "Выбор сохранён!"})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Возвращает статистику выборов для указанной даты (по умолчанию — сегодня)."""
    # 1. Получаем дату из параметра запроса или берём сегодняшнюю
    date = request.args.get('date', datetime.now().strftime("%Y-%m-%d"))
    stats_file = os.path.join(PROJECT_ROOT, "daily_output", date, "choices.json")
    
    # 2. Если файла со статистикой нет — возвращаем пустой результат
    if not os.path.exists(stats_file):
        return jsonify({"date": date, "total_votes": 0, "top_card": None, "distribution": {}})
    
    # 3. Читаем и анализируем файл
    with open(stats_file, 'r', encoding='utf-8') as f:
        choices = json.load(f)
    
    # 4. Подсчитываем, сколько раз выбирали каждую карточку
    distribution = {}
    for choice in choices:
        card_id = choice.get("card_id")
        distribution[card_id] = distribution.get(card_id, 0) + 1
    
    # 5. Находим карточку-лидера
    top_card = None
    if distribution:
        top_card = max(distribution, key=distribution.get)
    
    # 6. Формируем и возвращаем ответ
    return jsonify({
        "date": date,
        "total_votes": len(choices),
        "top_card": top_card,
        "top_card_votes": distribution.get(top_card, 0) if top_card else 0,
        "distribution": distribution
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Сервер запустится на http://localhost:5000