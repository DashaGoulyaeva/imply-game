// Конфигурация
const TODAY = new Date().toISOString().split('T')[0]; // Получаем сегодняшнюю дату, например "2026-02-03"
const IMAGES_BASE_PATH = `daily_output/${TODAY}/`; // Путь к папке с сегодняшними картинками
const CARD_COUNT = 5; // Количество карточек

// Элементы страницы
const cardsContainer = document.getElementById('cardsContainer');
const submitButton = document.getElementById('submitButton');
const messageEl = document.getElementById('message');

// Состояние игры
let selectedCardId = null;

// Функции
function showMessage(text, isError = false) {
    messageEl.textContent = text;
    messageEl.style.color = isError ? '#d32f2f' : '#666';
}

function createCardElement(cardNumber) {
    const cardId = cardNumber.toString().padStart(2, '0'); // "01", "02"...
    const imageUrl = `${IMAGES_BASE_PATH}card_${cardId}.png`;
    
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = cardId;
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="Карточка дня #${cardNumber}" class="card-image">
        <div class="card-label">#${cardNumber}</div>
    `;
    
    // Обработчик клика
    card.addEventListener('click', () => {
        if (selectedCardId === cardId) {
            // Отменяем выбор
            card.classList.remove('selected');
            selectedCardId = null;
            submitButton.disabled = true;
            showMessage('');
        } else {
            // Снимаем выделение со всех карточек
            document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
            // Выделяем новую
            card.classList.add('selected');
            selectedCardId = cardId;
            submitButton.disabled = false;
            showMessage(`Выбрана карточка #${cardNumber}. Нажмите "Сделать выбор".`);
        }
    });
    
    return card;
}

function loadCards() {
    cardsContainer.innerHTML = '';
    
    for (let i = 1; i <= CARD_COUNT; i++) {
        const cardElement = createCardElement(i);
        cardsContainer.appendChild(cardElement);
    }
}

// Обработчик кнопки "Сделать выбор"
submitButton.addEventListener('click', () => {
    if (!selectedCardId) return;
    
    submitButton.disabled = true;
    showMessage("Обрабатываю ваш выбор...");
    
    // Отправляем выбор на сервер (бэкенд)
    fetch('http://localhost:5000/api/submit-choice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            card_id: selectedCardId, // Например, "02"
            date: TODAY // Передаем дату для проверки
        })
    })
    .then(response => {
        console.log("Ответ получен, статус:", response.status);
        // Сначала читаем как текст, чтобы в любом случае увидеть ответ сервера
        return response.text().then(text => {
            console.log("Тело ответа (сырой текст):", text);
            try {
                // Пытаемся распарсить JSON
                return JSON.parse(text);
            } catch (e) {
                console.error("Ответ не в формате JSON:", e);
                throw new Error(`Сервер вернул не JSON. Ответ: "${text.slice(0, 100)}..."`);
            }
        });
    })
    .then(data => {
        console.log("Распарсенный data:", data);
        // Проверяем структуру ответа
        if (data && data.success === true) {
            showMessage(`✅ Спасибо! Вы выбрали карточку #${selectedCardId}.`);
            console.log('Успех:', data.message);
        } else {
            // Если сервер вернул успех, но без флага success, или success=false
            showMessage('❌ Сервер сообщил об ошибке.', true);
            console.error('Структура ответа:', data);
        }
    })
    .catch(error => {
        console.error('Ошибка в цепочке fetch:', error);
        showMessage('⚠️ Проблема с отправкой выбора. Подробности в консоли (F12).', true);
        submitButton.disabled = false; // Разблокируем кнопку при ошибке
    });
});
    
    // Имитация отправки (позже заменим на реальный запрос)
setTimeout(() => {
    showMessage(`✅ Спасибо! Вы выбрали карточку #${selectedCardId}.`);
    // Здесь позже: вызов ИИ-ведущего, запись статистики
}, 800);

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    showMessage(`Загружаю карточки за ${TODAY}...`);
    loadCards();
    
    // Проверяем, есть ли папка с картинками
    fetch(`${IMAGES_BASE_PATH}card_01.png`)
        .then(response => {
            if (!response.ok) {
                showMessage(`❌ Карточки за ${TODAY} не найдены. Запустите генератор.`, true);
            }
        })
        .catch(() => {
            showMessage(`⚠️ Не могу загрузить карточки. Проверьте папку ${IMAGES_BASE_PATH}`, true);
        });
});