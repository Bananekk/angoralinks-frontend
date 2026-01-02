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
        pageNotFound: 'Strona nie została znaleziona',
        menu: 'Menu'
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
            referrals: 'Polecenia'
        },
        stats: {
            balance: 'Saldo',
            totalClicks: 'Całkowite kliknięcia',
            totalEarnings: 'Zarobki',
            activeLinks: 'Aktywne linki',
            allLinks: 'Wszystkie linki',
            earned: 'Zarobione (85%)'
        },
        yourLinks: 'Twoje linki',
        links: {
            create: 'Nowy link',
            noLinks: 'Nie masz jeszcze żadnych linków',
            createFirst: 'Utwórz pierwszy link',
            copyLink: 'Kopiuj link',
            openOriginal: 'Otwórz oryginalny',
            clicks: 'Kliknięcia',
            earned: 'Zarobione',
            active: 'Aktywny',
            inactive: 'Nieaktywny'
        },
        createModal: {
            title: 'Nowy link',
            urlLabel: 'URL do skrócenia',
            urlPlaceholder: 'https://example.com/long-url',
            titleLabel: 'Tytuł (opcjonalnie)',
            titlePlaceholder: 'Mój link',
            creating: 'Tworzenie...',
            create: 'Utwórz'
        },
        editModal: {
            title: 'Edytuj link',
            urlLabel: 'Docelowy URL',
            titleLabel: 'Tytuł (opcjonalnie)',
            descriptionLabel: 'Opis (opcjonalnie)',
            descriptionPlaceholder: 'Opis linka...',
            statusLabel: 'Status linka',
            statusActive: 'Link jest aktywny i działa',
            statusInactive: 'Link jest wyłączony',
            shortUrl: 'Skrócony URL',
            save: 'Zapisz zmiany'
        },
        deleteConfirm: 'Czy na pewno chcesz usunąć ten link?',
        errors: {
            fetchLinks: 'Błąd pobierania linków',
            createLink: 'Błąd tworzenia linka',
            deleteLink: 'Błąd usuwania linka',
            updateLink: 'Błąd aktualizacji linka'
        },
        messages: {
            linkCreated: 'Link utworzony!',
            linkDeleted: 'Link usunięty',
            linkUpdated: 'Link zaktualizowany!'
        },
        validation: {
            urlRequired: 'URL jest wymagany',
            urlProtocol: 'URL musi zaczynać się od http:// lub https://',
            urlInvalid: 'Nieprawidłowy format URL',
            titleMaxLength: 'Tytuł może mieć maksymalnie 100 znaków',
            descriptionMaxLength: 'Opis może mieć maksymalnie 500 znaków'
        }
    },

    // Logowanie
    login: {
        title: 'Zaloguj się',
        email: 'Email',
        emailPlaceholder: 'twoj@email.pl',
        password: 'Hasło',
        submit: 'Zaloguj się',
        loggingIn: 'Logowanie...',
        noAccount: 'Nie masz konta?',
        register: 'Zarejestruj się',
        forgotPassword: 'Zapomniałeś hasła?',
        errors: {
            loginFailed: 'Błąd logowania',
            enterValidCode: 'Wprowadź poprawny kod',
            invalidCode: 'Nieprawidłowy kod',
            webAuthnNotSupported: 'Twoja przeglądarka nie obsługuje kluczy bezpieczeństwa',
            verificationCancelled: 'Weryfikacja została anulowana',
            securityError: 'Błąd bezpieczeństwa - sprawdź czy używasz HTTPS',
            keyNotRegistered: 'Klucz nie jest zarejestrowany dla tego konta',
            keyVerificationFailed: 'Błąd weryfikacji klucza',
            verificationFailed: 'Błąd weryfikacji'
        },
        messages: {
            success: 'Zalogowano pomyślnie!'
        },
        twoFactor: {
            title: 'Weryfikacja 2FA',
            confirmIdentity: 'Potwierdź swoją tożsamość',
            enterCodeOrKey: 'Wprowadź kod 2FA lub użyj klucza',
            adminRequires2FA: 'Administrator wymaga włączenia 2FA',
            waitingForKey: 'Oczekiwanie na klucz...',
            useSecurityKey: 'Użyj klucza bezpieczeństwa',
            keyOptions: 'Touch ID, Face ID, Windows Hello lub YubiKey',
            orUseCode: 'lub użyj kodu',
            app: 'Aplikacja',
            key: 'Klucz',
            backup: 'Zapasowy',
            backupCode8Chars: 'Kod zapasowy (8 znaków)',
            appCode6Digits: 'Kod z aplikacji (6 cyfr)',
            verifying: 'Weryfikacja...',
            verify: 'Zweryfikuj',
            backToLogin: 'Wróć do logowania',
            keyProblem: 'Problem z kluczem?',
            useAppCode: 'Użyj kodu z aplikacji',
            noDeviceAccess: 'Brak dostępu do urządzenia?',
            useBackupCode: 'Użyj kodu zapasowego'
        },
        setup2FA: {
            title: 'Wymagana konfiguracja 2FA',
            description: 'Administrator wymaga włączenia dwuskładnikowego uwierzytelniania na Twoim koncie.',
            warning: 'Nie możesz korzystać z serwisu bez włączenia 2FA',
            configureNow: 'Skonfiguruj 2FA teraz',
            cancelAndLogout: 'Anuluj i wyloguj'
        }
    },

    // Rejestracja
    register: {
        title: 'Utwórz konto',
        email: 'Email',
        emailPlaceholder: 'twoj@email.pl',
        password: 'Hasło',
        passwordPlaceholder: 'Min. 8 znaków, 1 cyfra, 1 wielka litera',
        confirmPassword: 'Potwierdź hasło',
        repeatPassword: 'Powtórz hasło',
        referralCode: 'Kod polecający',
        referralCodePlaceholder: 'np. A1B2C3D4',
        optional: 'opcjonalnie',
        submit: 'Zarejestruj się',
        creatingAccount: 'Tworzenie konta...',
        hasAccount: 'Masz już konto?',
        login: 'Zaloguj się',
        referral: {
            referred: 'Zostałeś polecony!',
            verifying: 'Weryfikacja kodu...',
            commission: 'Twój polecający otrzyma 10% prowizji od Twoich zarobków',
            willBeVerified: 'Kod zostanie zweryfikowany przy rejestracji',
            codeValid: 'Kod prawidłowy'
        },
        errors: {
            passwordsNotMatch: 'Hasła nie są identyczne',
            registrationFailed: 'Błąd rejestracji',
            invalidReferralCode: 'Nieprawidłowy kod polecający'
        },
        messages: {
            checkEmail: 'Sprawdź email i wpisz kod weryfikacyjny!'
        }
    },

    // Wylogowanie
    logout: {
        confirmTitle: 'Wylogowanie',
        confirmMessage: 'Czy na pewno chcesz się wylogować z konta?',
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
        tabs: {
            profile: 'Profil',
            security: 'Bezpieczeństwo',
            password: 'Hasło',
            delete: 'Usuń'
        },
        stats: {
            balance: 'Saldo',
            links: 'Linki',
            joined: 'Dołączył'
        },
        changeEmail: 'Zmień email',
        emailAddress: 'Adres email',
        changePassword: 'Zmień hasło',
        currentPassword: 'Aktualne hasło',
        newPassword: 'Nowe hasło',
        confirmNewPassword: 'Potwierdź nowe hasło',
        passwordRequirements: 'Min. 8 znaków, 1 cyfra, 1 wielka litera',
        never: 'Nigdy',
        or: 'lub',
        codeFromApp: 'Kod z aplikacji (6 cyfr)',
        accountPassword: 'Hasło do konta',
        enter2FAOrPasswordToConfirm: 'Wprowadź kod 2FA lub hasło aby potwierdzić:',
        
        twoFactor: {
            title: 'Dwuskładnikowe uwierzytelnianie (2FA)',
            enabled: '2FA jest włączone',
            disabled: '2FA jest wyłączone',
            methods: 'Metody',
            app: 'Aplikacja',
            key: 'Klucz',
            none: 'Brak',
            notSecured: 'Twoje konto nie jest w pełni zabezpieczone',
            requiredByAdmin: '2FA jest wymagane przez administratora i nie może być wyłączone',
            enable: 'Włącz 2FA'
        },
        
        totp: {
            title: 'Aplikacja Authenticator',
            description: 'Użyj Google Authenticator, Authy lub Microsoft Authenticator',
            configure: 'Skonfiguruj TOTP',
            configured: 'Skonfigurowano',
            disable: 'Wyłącz',
            setupTitle: 'Konfiguracja Authenticator',
            step1: '1. Zeskanuj kod QR w aplikacji authenticator:',
            orEnterManually: 'Lub wprowadź ręcznie:',
            step2: '2. Wprowadź 6-cyfrowy kod z aplikacji:',
            disableTitle: 'Wyłącz TOTP',
            disableDescription: 'Aby wyłączyć aplikację authenticator, wprowadź kod 2FA lub hasło do konta.'
        },
        
        webauthn: {
            title: 'Klucze bezpieczeństwa / Biometria',
            description: 'YubiKey, Touch ID, Face ID, Windows Hello',
            notSupported: '⚠️ Twoja przeglądarka nie obsługuje kluczy bezpieczeństwa',
            securityKey: 'Klucz bezpieczeństwa',
            hardwareKey: 'Klucz sprzętowy',
            passkey: 'Passkey (synchronizowany)',
            synced: 'Zsynchronizowany',
            lastUsed: 'Ostatnio',
            rename: 'Zmień nazwę',
            deleteKey: 'Usuń klucz',
            noKeys: 'Brak zarejestrowanych kluczy',
            addKey: 'Dodaj klucz bezpieczeństwa',
            addKeyTitle: 'Dodaj klucz bezpieczeństwa',
            prepareKey: 'Przygotuj klucz bezpieczeństwa lub użyj biometrii urządzenia',
            deviceName: 'Nazwa urządzenia (opcjonalne)',
            deviceNamePlaceholder: 'np. YubiKey 5, MacBook Pro, iPhone',
            afterClick: 'Po kliknięciu "Zarejestruj":',
            instruction1: 'Włóż klucz USB lub dotknij czytnika NFC',
            instruction2: 'Lub użyj Face ID / Touch ID / Windows Hello',
            instruction3: 'Postępuj zgodnie z instrukcjami przeglądarki',
            waiting: 'Oczekiwanie...',
            registerKey: 'Zarejestruj klucz',
            renameKey: 'Zmień nazwę klucza',
            newName: 'Nowa nazwa',
            namePlaceholder: 'np. MacBook Pro',
            deleteKeyTitle: 'Usuń klucz bezpieczeństwa',
            deleteConfirm: 'Czy na pewno chcesz usunąć klucz'
        },
        
        backupCodes: {
            title: 'Kody zapasowe',
            description: 'Kody jednorazowe na wypadek utraty dostępu do urządzenia',
            remaining: 'Pozostałe kody',
            lowCodes: 'Mało kodów zapasowych! Wygeneruj nowe.',
            generate: 'Wygeneruj nowe kody',
            generateNew: 'Wygeneruj nowe kody zapasowe',
            oldCodesInvalidated: 'Stare kody zostaną unieważnione',
            generateCodes: 'Generuj kody',
            saveSecurely: 'Zapisz te kody w bezpiecznym miejscu',
            important: 'Ważne!',
            notShownAgain: 'Te kody nie będą pokazane ponownie.',
            copy: 'Kopiuj',
            download: 'Pobierz',
            savedClose: 'Zapisałem kody - zamknij',
            eachCodeOnce: 'Każdy kod może być użyty tylko raz.',
            storeSecurely: 'Przechowuj w bezpiecznym miejscu!'
        },
        
        deleteAccount: {
            title: 'Usuń konto',
            warning: 'Ta akcja jest nieodwracalna. Wszystkie Twoje dane zostaną trwale usunięte.',
            wantToDelete: 'Chcę usunąć konto',
            enterPassword: 'Wpisz hasło aby potwierdzić'
        },
        
        errors: {
            fetchProfile: 'Błąd pobierania profilu',
            totpInit: 'Błąd inicjalizacji TOTP',
            enter6DigitCode: 'Wprowadź 6-cyfrowy kod',
            invalidCode: 'Nieprawidłowy kod',
            enter2FAOrPassword: 'Wprowadź kod 2FA lub hasło',
            disableTotp: 'Błąd wyłączania TOTP',
            webAuthnNotSupported: 'Twoja przeglądarka nie obsługuje kluczy bezpieczeństwa',
            registrationCancelled: 'Rejestracja została anulowana',
            securityError: 'Błąd bezpieczeństwa - sprawdź czy używasz HTTPS',
            keyAlreadyRegistered: 'Ten klucz jest już zarejestrowany',
            keyRegistration: 'Błąd rejestracji klucza',
            nameEmpty: 'Nazwa nie może być pusta',
            nameChange: 'Błąd zmiany nazwy',
            keyDelete: 'Błąd usuwania klucza',
            generateCodes: 'Błąd generowania kodów',
            updateEmail: 'Błąd aktualizacji',
            passwordsNotMatch: 'Nowe hasła nie są identyczne',
            changePassword: 'Błąd zmiany hasła',
            enterPasswordToConfirm: 'Wpisz hasło aby potwierdzić',
            deleteAccount: 'Błąd usuwania konta'
        },
        
        messages: {
            totpEnabled: 'TOTP zostało włączone!',
            totpDisabled: 'TOTP zostało wyłączone',
            keyRegistered: 'Klucz bezpieczeństwa został zarejestrowany!',
            keyNameChanged: 'Nazwa klucza została zmieniona',
            keyDeleted: 'Klucz został usunięty',
            backupCodesGenerated: 'Wygenerowano nowe kody zapasowe',
            codesCopied: 'Kody skopiowane do schowka',
            fileDownloaded: 'Plik pobrany',
            emailUpdated: 'Email zaktualizowany',
            passwordChanged: 'Hasło zmienione',
            accountDeleted: 'Konto usunięte',
            copied: 'Skopiowano!'
        }
    },

    // Unlock (strona odblokowywania)
    unlock: {
        title: 'Odblokuj link',
        step: 'Krok',
        of: 'z',
        secureLink: 'Bezpieczny link',
        goToPage: 'Przejdź do strony',
        checkingConnection: 'Sprawdzanie połączenia...',
        steps: {
            openAd: 'Otwórz reklamę',
            clickAd: 'Kliknij w reklamę',
            watchAd: 'Oglądaj reklamę'
        },
        status: {
            watching: 'Oglądaj',
            solveCaptcha: 'Rozwiąż captcha',
            clickToContinue: 'Kliknij przycisk aby przejść dalej'
        },
        clickButtonBelow: 'Kliknij przycisk poniżej',
        openAd: 'Otwórz reklamę',
        adOpened: 'Reklama otwarta!',
        continue: 'Kontynuuj',
        openAdFirst: 'Najpierw otwórz reklamę',
        clickOnAd: 'Kliknij w reklamę',
        adClicked: 'Reklama kliknięta!',
        clickAdFirst: 'Najpierw kliknij reklamę',
        clickAdToStartTimer: 'Kliknij reklamę aby rozpocząć timer',
        watchingAd: 'Oglądaj reklamę...',
        readySolveCaptcha: 'Gotowe! Rozwiąż captcha.',
        clickAd: 'Kliknij reklamę',
        wait: 'Poczekaj',
        unlocking: 'Odblokowywanie...',
        solveCaptcha: 'Rozwiąż captcha',
        unlockLink: 'Odblokuj link',
        adsHelpCreators: 'Reklamy pomagają twórcom zarabiać. Dziękujemy!',
        success: {
            title: 'Link odblokowany!',
            redirecting: 'Przekierowywanie...',
            clickIfNotRedirected: 'Kliknij tutaj jeśli nie zostałeś przekierowany'
        },
        adBlock: {
            title: 'AdBlock wykryty',
            description: 'Aby uzyskać dostęp do tego linku, wyłącz rozszerzenie blokujące reklamy i odśwież stronę.',
            howToDisable: 'Jak wyłączyć AdBlock:',
            step1: 'Kliknij ikonę AdBlocka w przeglądarce',
            step2: 'Wybierz "Wyłącz na tej stronie"',
            step3: 'Kliknij przycisk poniżej',
            checkAgain: 'Sprawdź ponownie'
        },
        errors: {
            linkNotExists: 'Link nie istnieje',
            solveCaptchaFirst: 'Najpierw rozwiąż captcha',
            unlockFailed: 'Błąd odblokowania'
        }
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