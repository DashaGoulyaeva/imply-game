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

    // ШАГ 1: Сохраняем выбор игрока
    fetch('http://localhost:5000/api/submit-choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: selectedCardId, date: TODAY })
    })
    .then(response => {
        if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);
        return response.json();
    })
    .then(choiceData => {
        // Проверяем ответ от endpoint сохранения
        if (!choiceData || !choiceData.success) {
            throw new Error('Сервер не подтвердил сохранение выбора.');
        }
        console.log('✅ Выбор сохранён:', choiceData.message);
        showMessage(`✅ Ваш выбор (#${selectedCardId}) сохранён. Загружаю статистику...`);

        // ШАГ 2: Запрашиваем статистику ОТДЕЛЬНО
        return fetch(`http://localhost:5000/api/stats?date=${TODAY}`);
    })
    .then(response => {
        if (!response.ok) throw new Error(`Не удалось загрузить статистику: ${response.status}`);
        return response.json();
    })
    .then(statsData => {
        // Обрабатываем статистику
        console.log('📊 Получена статистика:', statsData);
        let finalMessage = `✅ Спасибо! Вы выбрали карточку #${selectedCardId}. `;

        if (statsData.total_votes > 0 && statsData.top_card) {
            finalMessage += `Сегодня всего выборов: ${statsData.total_votes}. Чаще всего выбирают карточку #${statsData.top_card} (${statsData.top_card_votes} раз).`;
            // Подсветка популярной карточки (если это не выбранная игроком)
            const popularCard = document.querySelector(`.card[data-id="${statsData.top_card}"]`);
            if (popularCard && popularCard.dataset.id !== selectedCardId) {
                popularCard.style.boxShadow = '0 0 0 3px gold';
                popularCard.title = 'Самая популярная карточка сегодня';
            }
        } else {
            finalMessage += 'Вы — первый сегодня!';
        }
        showMessage(finalMessage);
    })
    .catch(error => {
        console.error('❌ Ошибка в цепочке:', error);
        // Даже если статистика не загрузилась, сообщаем, что выбор сохранён
        showMessage(`✅ Ваш выбор (#${selectedCardId}) сохранён. (Статистика временно недоступна)`);
    })
    .finally(() => {
        // В любом случае, через 5 секунд снимаем блокировку с кнопки
        setTimeout(() => { submitButton.disabled = false; }, 5000);
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