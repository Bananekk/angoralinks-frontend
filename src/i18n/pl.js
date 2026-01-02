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
        login: 'Zaloguj',
        register: 'Dołącz teraz',
        logout: 'Wyloguj'
    },

    // Strona główna
    home: {
        hero: {
            title: 'Zarabiaj na swoich linkach',
            subtitle: 'Skracaj linki i zarabiaj za każde kliknięcie. Dołącz do tysięcy użytkowników.',
            cta: 'Rozpocznij zarabianie',
            ctaSecondary: 'Zobacz stawki CPM'
        },
        stats: {
            users: 'Użytkowników',
            clicks: 'Kliknięć',
            paidOut: 'Wypłacono',
            uptime: 'Uptime'
        },
        features: {
            title: 'Dlaczego my?',
            fast: {
                title: 'Błyskawiczne wypłaty',
                description: 'Wypłaty przetwarzane w ciągu 24-48 godzin'
            },
            secure: {
                title: 'Bezpieczeństwo',
                description: 'Twoje dane są w pełni chronione'
            },
            global: {
                title: 'Globalny zasięg',
                description: 'Zarabiaj na ruchu z całego świata'
            }
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