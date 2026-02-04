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

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Сервер запустится на http://localhost:5000