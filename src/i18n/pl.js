// src/i18n/pl.js - Polskie tłumaczenia
export default {
    // Ogólne
    common: {
        loading: 'Ładowanie...',
        save: 'Zapisz',
        cancel: 'Anuluj',
        delete: 'Usuń',
        edit: 'Edytuj',
        close: 'Zamknij',
        confirm: 'Potwierdź',
        yes: 'Tak',
        no: 'Nie',
        error: 'Błąd',
        success: 'Sukces',
        copiedToClipboard: 'Skopiowano do schowka!',
        backToHome: 'Wróć na stronę główną',
        somethingWentWrong: 'Coś poszło nie tak',
        refreshPage: 'Odśwież stronę',
        pageNotFound: 'Strona nie została znaleziona'
    },

    // Navbar
    navbar: {
        dashboard: 'Panel',
        stats: 'Statystyki',
        payouts: 'Wypłaty',
        profile: 'Profil',
        admin: 'Admin',
        login: 'Zaloguj się',
        register: 'Zarejestruj się',
        logout: 'Wyloguj się'
    },

    // Strona główna
    home: {
        hero: {
            badge: 'Najlepsza platforma do zarabiania na linkach',
            titlePart1: 'Zarabiaj na',
            titleHighlight: 'linkach',
            subtitle: 'Skracaj linki i zarabiaj pieniądze za każde kliknięcie. Dołącz do tysięcy użytkowników, którzy już zarabiają z AngoraLinks.',
            cta: 'Zacznij zarabiać',
            ctaSecondary: 'Mam już konto'
        },
        stats: {
            users: 'Użytkowników',
            clicks: 'Kliknięć',
            paidOut: 'Wypłacono',
            uptime: 'Uptime'
        },
        features: {
            title: 'Dlaczego AngoraLinks?',
            subtitle: 'Oferujemy najlepsze warunki dla twórców treści i marketerów',
            highRates: {
                title: 'Wysokie stawki',
                description: 'Zarabiaj do $3 CPM za ruch z krajów Tier 1. Konkurencyjne stawki dla całego świata.'
            },
            fastPayouts: {
                title: 'Szybkie wypłaty',
                description: 'Wypłaty już od $10. PayPal, Bitcoin, przelew bankowy. Otrzymaj pieniądze w 24h.'
            },
            secureLinks: {
                title: 'Bezpieczne linki',
                description: 'Wszystkie linki są sprawdzane. Ochrona przed złośliwym oprogramowaniem.'
            }
        },
        howItWorks: {
            title: 'Jak to działa?',
            subtitle: 'Zacznij zarabiać w trzech prostych krokach',
            step1: {
                title: 'Zarejestruj się',
                description: 'Stwórz darmowe konto w kilka sekund. Bez ukrytych opłat.'
            },
            step2: {
                title: 'Skróć link',
                description: 'Wklej dowolny link i otrzymaj skrócony URL gotowy do udostępnienia.'
            },
            step3: {
                title: 'Zarabiaj',
                description: 'Udostępniaj link i zarabiaj za każde kliknięcie. To takie proste!'
            }
        },
        cta: {
            title: 'Gotowy, żeby zacząć zarabiać?',
            subtitle: 'Dołącz do {{count}} użytkowników, którzy już zarabiają z AngoraLinks',
            button: 'Zarejestruj się za darmo'
        },
        footer: {
            copyright: '© 2025 AngoraLinks. Wszystkie prawa zastrzeżone.'
        },
        loggedIn: {
            subtitle: 'Zarządzaj swoimi linkami i zarabiaj więcej.',
            availableBalance: 'Dostępne saldo',
            totalEarned: 'Łącznie zarobione',
            manageLinks: 'Zarządzaj linkami',
            analyzeTraffic: 'Analizuj ruch',
            withdrawFunds: 'Wypłać środki',
            settings: 'Ustawienia'
        }
    },

    // Dashboard
    dashboard: {
        title: 'Panel główny',
        welcome: 'Witaj',
        tabs: {
            links: 'Moje linki',
            referrals: 'Program polecający'
        },
        stats: {
            balance: 'Saldo',
            totalClicks: 'Kliknięcia',
            totalEarnings: 'Zarobki',
            activeLinks: 'Aktywne linki'
        },
        links: {
            create: 'Utwórz link',
            noLinks: 'Nie masz jeszcze żadnych linków',
            createFirst: 'Utwórz swój pierwszy link i zacznij zarabiać!',
            copyLink: 'Kopiuj link',
            openOriginal: 'Otwórz oryginalny',
            clicks: 'kliknięć',
            earned: 'zarobione',
            active: 'Aktywny',
            inactive: 'Nieaktywny'
        },
        createModal: {
            title: 'Utwórz nowy link',
            urlLabel: 'URL docelowy',
            urlPlaceholder: 'https://przykład.com',
            titleLabel: 'Tytuł (opcjonalnie)',
            titlePlaceholder: 'Mój link',
            creating: 'Tworzenie...',
            create: 'Utwórz link'
        },
        editModal: {
            title: 'Edytuj link',
            urlLabel: 'URL docelowy',
            titleLabel: 'Tytuł',
            descriptionLabel: 'Opis',
            descriptionPlaceholder: 'Opcjonalny opis linka...',
            statusLabel: 'Status',
            active: 'Aktywny',
            inactive: 'Nieaktywny',
            saving: 'Zapisywanie...',
            save: 'Zapisz zmiany'
        },
        deleteConfirm: 'Czy na pewno chcesz usunąć ten link?'
    },

    // Logowanie
    login: {
        title: 'Zaloguj się',
        email: 'Email',
        password: 'Hasło',
        submit: 'Zaloguj',
        loggingIn: 'Logowanie...',
        noAccount: 'Nie masz konta?',
        register: 'Zarejestruj się',
        forgotPassword: 'Zapomniałeś hasła?'
    },

    // Rejestracja
    register: {
        title: 'Zarejestruj się',
        username: 'Nazwa użytkownika',
        email: 'Email',
        password: 'Hasło',
        confirmPassword: 'Potwierdź hasło',
        submit: 'Zarejestruj',
        registering: 'Rejestracja...',
        hasAccount: 'Masz już konto?',
        login: 'Zaloguj się',
        termsAgree: 'Akceptuję regulamin'
    },

    // Wylogowanie
    logout: {
        confirmTitle: 'Wylogowanie',
        confirmMessage: 'Czy na pewno chcesz się wylogować?',
        success: 'Wylogowano'
    },

    // Statystyki
    stats: {
        title: 'Statystyki',
        period: {
            today: 'Dziś',
            week: 'Ten tydzień',
            month: 'Ten miesiąc',
            all: 'Wszystko'
        },
        clicks: 'Kliknięcia',
        earnings: 'Zarobki',
        topLinks: 'Najlepsze linki',
        byCountry: 'Według kraju'
    },

    // Wypłaty
    payouts: {
        title: 'Wypłaty',
        balance: 'Dostępne saldo',
        minPayout: 'Minimalna wypłata',
        requestPayout: 'Wypłać środki',
        history: 'Historia wypłat',
        status: {
            pending: 'Oczekuje',
            processing: 'Przetwarzanie',
            completed: 'Zrealizowana',
            rejected: 'Odrzucona'
        },
        noHistory: 'Brak historii wypłat'
    },

    // Profil
    profile: {
        title: 'Profil',
        personalInfo: 'Dane osobowe',
        security: 'Bezpieczeństwo',
        paymentMethods: 'Metody płatności',
        changePassword: 'Zmień hasło',
        twoFactor: 'Weryfikacja dwuetapowa',
        enable2FA: 'Włącz 2FA',
        disable2FA: 'Wyłącz 2FA'
    },

    // Unlock (strona odblokowywania)
    unlock: {
        title: 'Odblokuj link',
        step: 'Krok',
        of: 'z',
        completeSteps: 'Wykonaj poniższe kroki aby odblokować link',
        getLink: 'Odbierz link',
        redirecting: 'Przekierowywanie...',
        visitWebsite: 'Odwiedź stronę',
        watchVideo: 'Obejrzyj wideo',
        waitSeconds: 'Poczekaj {{seconds}} sekund'
    },

    // Stawki CPM
    cpmRates: {
        title: 'Stawki CPM',
        subtitle: 'Zarobki za 1000 wyświetleń według kraju',
        tier: 'Poziom',
        countries: 'Kraje',
        rate: 'Stawka'
    },

    // Kontakt
    contact: {
        title: 'Kontakt',
        subtitle: 'Masz pytania? Napisz do nas!',
        name: 'Imię',
        email: 'Email',
        subject: 'Temat',
        message: 'Wiadomość',
        send: 'Wyślij wiadomość',
        sending: 'Wysyłanie...',
        success: 'Wiadomość wysłana!'
    },

    // Regulamin
    terms: {
        title: 'Regulamin',
        lastUpdated: 'Ostatnia aktualizacja'
    },

    // Program polecający
    referrals: {
        title: 'Program polecający',
        yourLink: 'Twój link polecający',
        copyLink: 'Kopiuj link',
        stats: {
            invited: 'Zaproszonych',
            active: 'Aktywnych',
            earnings: 'Zarobki z poleceń'
        },
        howItWorks: 'Jak to działa?',
        commission: 'Otrzymujesz {{percent}}% od zarobków poleconych osób'
    },

    // Popup zmiany języka
    languagePopup: {
        title: 'Change language?',
        message: 'Would you like to view this page in English?',
        yes: 'Yes, switch to English',
        no: 'Nie, zostań przy polskim',
        dontShowAgain: "Don't show again"
    },

    // Przełącznik języka
    languageSwitcher: {
        tooltip: 'Zmień język',
        pl: 'Polski',
        en: 'English'
    }
};