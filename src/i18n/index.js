// src/i18n/index.js - System tłumaczeń
import { useState, useEffect, createContext, useContext } from 'react';
import pl from './pl';
import en from './en';

const translations = { pl, en };

// Kontekst języka
const LanguageContext = createContext();

// Wykryj preferowany język przeglądarki
const detectBrowserLanguage = () => {
    const browserLang = navigator.language || navigator.userLanguage;
    // Jeśli przeglądarka jest po polsku, zwróć 'pl', w przeciwnym razie 'en'
    return browserLang.startsWith('pl') ? 'pl' : 'en';
};

// Pobierz zapisany język lub wykryj automatycznie
const getInitialLanguage = () => {
    const saved = localStorage.getItem('language');
    if (saved && (saved === 'pl' || saved === 'en')) {
        return saved;
    }
    // Domyślnie polska strona
    return 'pl';
};

// Sprawdź czy pokazać popup
const shouldShowLanguagePopup = () => {
    const saved = localStorage.getItem('language');
    const popupDismissed = localStorage.getItem('languagePopupDismissed');
    
    // Jeśli użytkownik już wybrał język lub zamknął popup - nie pokazuj
    if (saved || popupDismissed) {
        return false;
    }
    
    // Pokaż popup tylko jeśli przeglądarka NIE jest po polsku
    const browserLang = navigator.language || navigator.userLanguage;
    return !browserLang.startsWith('pl');
};

// Provider komponent
export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(getInitialLanguage);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        // Sprawdź czy pokazać popup po załadowaniu
        const timer = setTimeout(() => {
            if (shouldShowLanguagePopup()) {
                setShowPopup(true);
            }
        }, 1000); // Pokaż po 1 sekundzie

        return () => clearTimeout(timer);
    }, []);

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const dismissPopup = (dontShowAgain = false) => {
        setShowPopup(false);
        if (dontShowAgain) {
            localStorage.setItem('languagePopupDismissed', 'true');
        }
    };

    const switchToEnglish = () => {
        changeLanguage('en');
        dismissPopup(true);
    };

    const keepPolish = () => {
        changeLanguage('pl');
        dismissPopup(true);
    };

    // Funkcja do pobierania tłumaczenia
    const t = (key, params = {}) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation missing: ${key} for language: ${language}`);
                return key; // Zwróć klucz jeśli brak tłumaczenia
            }
        }

        // Zamień parametry typu {{param}}
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => {
                return params[paramKey] !== undefined ? params[paramKey] : `{{${paramKey}}}`;
            });
        }

        return value;
    };

    return (
        <LanguageContext.Provider value={{
            language,
            changeLanguage,
            t,
            showPopup,
            dismissPopup,
            switchToEnglish,
            keepPolish
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Hook do używania tłumaczeń
export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};

export default useTranslation;