const input = document.getElementById("guessInput");
const button = document.getElementById("checkButton");
const result = document.getElementById("resultText");
const words = ["spring", "summer", "autumn", "winter"]; // список слов для угадывания

function getRandomWord() {
    const index = Math.floor(Math.random() * words.length);
    return words[index];
}

// Слово для угадывания
let secretWord = getRandomWord();
loadImageForWord(secretWord);


function loadImageForWord(word) {
    const image = document.getElementById("gameImage");
    // Используем вашу локальную картинку
    image.src = "test-image.jpg";;
}


button.addEventListener("click", function () {
    const userText = input.value.trim().toLowerCase();

    if (userText === secretWord) {
        result.textContent = "Correct! 🎉";
        result.style.color = "green";
        
        // новое случайное слово и новая картинка
        secretWord = getRandomWord();
        loadImageForWord(secretWord);

    } else {
        result.textContent = "Try again ❌";
        result.style.color = "red";
    }

    input.value = "";
    input.focus();
});

