// src/i18n/en.js - English translations
export default {
    // Common
    common: {
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No',
        error: 'Error',
        success: 'Success',
        copiedToClipboard: 'Copied to clipboard!',
        backToHome: 'Back to homepage',
        somethingWentWrong: 'Something went wrong',
        refreshPage: 'Refresh page',
        pageNotFound: 'Page not found',
        menu: 'Menu'
    },

    // Navbar
    navbar: {
        dashboard: 'Dashboard',
        stats: 'Statistics',
        payouts: 'Payouts',
        profile: 'Profile',
        admin: 'Admin',
        login: 'Login',
        register: 'Register',
        logout: 'Logout'
    },

    // Home page
    home: {
        hero: {
            badge: 'Best platform for earning from links',
            titlePart1: 'Earn from',
            titleHighlight: 'links',
            subtitle: 'Shorten links and earn money for every click. Join thousands of users who already earn with AngoraLinks.',
            cta: 'Start earning',
            ctaSecondary: 'I have an account'
        },
        stats: {
            users: 'Users',
            clicks: 'Clicks',
            paidOut: 'Paid out',
            uptime: 'Uptime'
        },
        features: {
            title: 'Why AngoraLinks?',
            subtitle: 'We offer the best conditions for content creators and marketers',
            highRates: {
                title: 'High rates',
                description: 'Earn up to $3 CPM for Tier 1 traffic. Competitive rates worldwide.'
            },
            fastPayouts: {
                title: 'Fast payouts',
                description: 'Payouts from $10. PayPal, Bitcoin, bank transfer. Get your money in 24h.'
            },
            secureLinks: {
                title: 'Secure links',
                description: 'All links are verified. Protection against malware.'
            }
        },
        howItWorks: {
            title: 'How it works?',
            subtitle: 'Start earning in three simple steps',
            step1: {
                title: 'Register',
                description: 'Create a free account in seconds. No hidden fees.'
            },
            step2: {
                title: 'Shorten link',
                description: 'Paste any link and get a shortened URL ready to share.'
            },
            step3: {
                title: 'Earn',
                description: 'Share your link and earn for every click. It\'s that simple!'
            }
        },
        cta: {
            title: 'Ready to start earning?',
            subtitle: 'Join {{count}} users who already earn with AngoraLinks',
            button: 'Register for free'
        },
        footer: {
            copyright: '© 2025 AngoraLinks. All rights reserved.'
        },
        loggedIn: {
            subtitle: 'Manage your links and earn more.',
            availableBalance: 'Available balance',
            totalEarned: 'Total earned',
            manageLinks: 'Manage links',
            analyzeTraffic: 'Analyze traffic',
            withdrawFunds: 'Withdraw funds',
            settings: 'Settings'
        }
    },

    // Dashboard
    dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome',
        tabs: {
            links: 'My links',
            referrals: 'Referrals'
        },
        stats: {
            balance: 'Balance',
            totalClicks: 'Total clicks',
            totalEarnings: 'Earnings',
            activeLinks: 'Active links',
            allLinks: 'All links',
            earned: 'Earned (85%)'
        },
        yourLinks: 'Your links',
        links: {
            create: 'New link',
            noLinks: "You don't have any links yet",
            createFirst: 'Create first link',
            copyLink: 'Copy link',
            openOriginal: 'Open original',
            clicks: 'Clicks',
            earned: 'Earned',
            active: 'Active',
            inactive: 'Inactive'
        },
        createModal: {
            title: 'New link',
            urlLabel: 'URL to shorten',
            urlPlaceholder: 'https://example.com/long-url',
            titleLabel: 'Title (optional)',
            titlePlaceholder: 'My link',
            creating: 'Creating...',
            create: 'Create'
        },
        editModal: {
            title: 'Edit link',
            urlLabel: 'Destination URL',
            titleLabel: 'Title (optional)',
            descriptionLabel: 'Description (optional)',
            descriptionPlaceholder: 'Link description...',
            statusLabel: 'Link status',
            statusActive: 'Link is active and working',
            statusInactive: 'Link is disabled',
            shortUrl: 'Short URL',
            save: 'Save changes'
        },
        deleteConfirm: 'Are you sure you want to delete this link?',
        errors: {
            fetchLinks: 'Error fetching links',
            createLink: 'Error creating link',
            deleteLink: 'Error deleting link',
            updateLink: 'Error updating link'
        },
        messages: {
            linkCreated: 'Link created!',
            linkDeleted: 'Link deleted',
            linkUpdated: 'Link updated!'
        },
        validation: {
            urlRequired: 'URL is required',
            urlProtocol: 'URL must start with http:// or https://',
            urlInvalid: 'Invalid URL format',
            titleMaxLength: 'Title can have max 100 characters',
            descriptionMaxLength: 'Description can have max 500 characters'
        }
    },

    // Login
    login: {
        title: 'Login',
        email: 'Email',
        emailPlaceholder: 'your@email.com',
        password: 'Password',
        submit: 'Login',
        loggingIn: 'Logging in...',
        noAccount: "Don't have an account?",
        register: 'Register',
        forgotPassword: 'Forgot password?',
        errors: {
            loginFailed: 'Login failed',
            enterValidCode: 'Enter valid code',
            invalidCode: 'Invalid code',
            webAuthnNotSupported: 'Your browser does not support security keys',
            verificationCancelled: 'Verification was cancelled',
            securityError: 'Security error - check if using HTTPS',
            keyNotRegistered: 'Key is not registered for this account',
            keyVerificationFailed: 'Key verification failed',
            verificationFailed: 'Verification failed'
        },
        messages: {
            success: 'Logged in successfully!'
        },
        twoFactor: {
            title: '2FA Verification',
            confirmIdentity: 'Confirm your identity',
            enterCodeOrKey: 'Enter 2FA code or use key',
            adminRequires2FA: 'Administrator requires 2FA enabled',
            waitingForKey: 'Waiting for key...',
            useSecurityKey: 'Use security key',
            keyOptions: 'Touch ID, Face ID, Windows Hello or YubiKey',
            orUseCode: 'or use code',
            app: 'App',
            key: 'Key',
            backup: 'Backup',
            backupCode8Chars: 'Backup code (8 characters)',
            appCode6Digits: 'Code from app (6 digits)',
            verifying: 'Verifying...',
            verify: 'Verify',
            backToLogin: 'Back to login',
            keyProblem: 'Problem with key?',
            useAppCode: 'Use app code',
            noDeviceAccess: 'No device access?',
            useBackupCode: 'Use backup code'
        },
        setup2FA: {
            title: '2FA Setup Required',
            description: 'Administrator requires two-factor authentication to be enabled on your account.',
            warning: 'You cannot use the service without enabling 2FA',
            configureNow: 'Configure 2FA now',
            cancelAndLogout: 'Cancel and logout'
        }
    },

    // Register
    register: {
        title: 'Create account',
        email: 'Email',
        emailPlaceholder: 'your@email.com',
        password: 'Password',
        passwordPlaceholder: 'Min. 8 chars, 1 digit, 1 uppercase',
        confirmPassword: 'Confirm password',
        repeatPassword: 'Repeat password',
        referralCode: 'Referral code',
        referralCodePlaceholder: 'e.g. A1B2C3D4',
        optional: 'optional',
        submit: 'Register',
        creatingAccount: 'Creating account...',
        hasAccount: 'Already have an account?',
        login: 'Login',
        referral: {
            referred: 'You were referred!',
            verifying: 'Verifying code...',
            commission: 'Your referrer will receive 10% commission from your earnings',
            willBeVerified: 'Code will be verified during registration',
            codeValid: 'Code valid'
        },
        errors: {
            passwordsNotMatch: 'Passwords do not match',
            registrationFailed: 'Registration failed',
            invalidReferralCode: 'Invalid referral code'
        },
        messages: {
            checkEmail: 'Check your email and enter verification code!'
        }
    },

    // Logout
    logout: {
        confirmTitle: 'Logout',
        confirmMessage: 'Are you sure you want to logout?',
        success: 'Logged out'
    },

    // Stats
    stats: {
        title: 'Statistics',
        period: {
            today: 'Today',
            week: 'This week',
            month: 'This month',
            all: 'All time'
        },
        clicks: 'Clicks',
        earnings: 'Earnings',
        topLinks: 'Top links',
        byCountry: 'By country'
    },

    // Payouts
    payouts: {
        title: 'Payouts',
        balance: 'Available balance',
        minPayout: 'Minimum payout',
        requestPayout: 'Request payout',
        history: 'Payout history',
        status: {
            pending: 'Pending',
            processing: 'Processing',
            completed: 'Completed',
            rejected: 'Rejected'
        },
        noHistory: 'No payout history'
    },

    // Profile
    profile: {
        title: 'Profile',
        tabs: {
            profile: 'Profile',
            security: 'Security',
            password: 'Password',
            delete: 'Delete'
        },
        stats: {
            balance: 'Balance',
            links: 'Links',
            joined: 'Joined'
        },
        changeEmail: 'Change email',
        emailAddress: 'Email address',
        changePassword: 'Change password',
        currentPassword: 'Current password',
        newPassword: 'New password',
        confirmNewPassword: 'Confirm new password',
        passwordRequirements: 'Min. 8 chars, 1 digit, 1 uppercase',
        never: 'Never',
        or: 'or',
        codeFromApp: 'Code from app (6 digits)',
        accountPassword: 'Account password',
        enter2FAOrPasswordToConfirm: 'Enter 2FA code or password to confirm:',
        
        twoFactor: {
            title: 'Two-factor authentication (2FA)',
            enabled: '2FA is enabled',
            disabled: '2FA is disabled',
            methods: 'Methods',
            app: 'App',
            key: 'Key',
            none: 'None',
            notSecured: 'Your account is not fully secured',
            requiredByAdmin: '2FA is required by administrator and cannot be disabled',
            enable: 'Enable 2FA'
        },
        
        totp: {
            title: 'Authenticator App',
            description: 'Use Google Authenticator, Authy or Microsoft Authenticator',
            configure: 'Configure TOTP',
            configured: 'Configured',
            disable: 'Disable',
            setupTitle: 'Authenticator Setup',
            step1: '1. Scan QR code in authenticator app:',
            orEnterManually: 'Or enter manually:',
            step2: '2. Enter 6-digit code from app:',
            disableTitle: 'Disable TOTP',
            disableDescription: 'To disable authenticator app, enter 2FA code or account password.'
        },
        
        webauthn: {
            title: 'Security Keys / Biometrics',
            description: 'YubiKey, Touch ID, Face ID, Windows Hello',
            notSupported: '⚠️ Your browser does not support security keys',
            securityKey: 'Security key',
            hardwareKey: 'Hardware key',
            passkey: 'Passkey (synced)',
            synced: 'Synced',
            lastUsed: 'Last used',
            rename: 'Rename',
            deleteKey: 'Delete key',
            noKeys: 'No registered keys',
            addKey: 'Add security key',
            addKeyTitle: 'Add security key',
            prepareKey: 'Prepare security key or use device biometrics',
            deviceName: 'Device name (optional)',
            deviceNamePlaceholder: 'e.g. YubiKey 5, MacBook Pro, iPhone',
            afterClick: 'After clicking "Register":',
            instruction1: 'Insert USB key or tap NFC reader',
            instruction2: 'Or use Face ID / Touch ID / Windows Hello',
            instruction3: 'Follow browser instructions',
            waiting: 'Waiting...',
            registerKey: 'Register key',
            renameKey: 'Rename key',
            newName: 'New name',
            namePlaceholder: 'e.g. MacBook Pro',
            deleteKeyTitle: 'Delete security key',
            deleteConfirm: 'Are you sure you want to delete key'
        },
        
        backupCodes: {
            title: 'Backup codes',
            description: 'One-time codes in case you lose access to your device',
            remaining: 'Remaining codes',
            lowCodes: 'Low backup codes! Generate new ones.',
            generate: 'Generate new codes',
            generateNew: 'Generate new backup codes',
            oldCodesInvalidated: 'Old codes will be invalidated',
            generateCodes: 'Generate codes',
            saveSecurely: 'Save these codes in a safe place',
            important: 'Important!',
            notShownAgain: 'These codes will not be shown again.',
            copy: 'Copy',
            download: 'Download',
            savedClose: 'I saved the codes - close',
            eachCodeOnce: 'Each code can only be used once.',
            storeSecurely: 'Store in a safe place!'
        },
        
        deleteAccount: {
            title: 'Delete account',
            warning: 'This action is irreversible. All your data will be permanently deleted.',
            wantToDelete: 'I want to delete account',
            enterPassword: 'Enter password to confirm'
        },
        
        errors: {
            fetchProfile: 'Error fetching profile',
            totpInit: 'Error initializing TOTP',
            enter6DigitCode: 'Enter 6-digit code',
            invalidCode: 'Invalid code',
            enter2FAOrPassword: 'Enter 2FA code or password',
            disableTotp: 'Error disabling TOTP',
            webAuthnNotSupported: 'Your browser does not support security keys',
            registrationCancelled: 'Registration was cancelled',
            securityError: 'Security error - check if using HTTPS',
            keyAlreadyRegistered: 'This key is already registered',
            keyRegistration: 'Error registering key',
            nameEmpty: 'Name cannot be empty',
            nameChange: 'Error changing name',
            keyDelete: 'Error deleting key',
            generateCodes: 'Error generating codes',
            updateEmail: 'Error updating',
            passwordsNotMatch: 'New passwords do not match',
            changePassword: 'Error changing password',
            enterPasswordToConfirm: 'Enter password to confirm',
            deleteAccount: 'Error deleting account'
        },
        
        messages: {
            totpEnabled: 'TOTP has been enabled!',
            totpDisabled: 'TOTP has been disabled',
            keyRegistered: 'Security key has been registered!',
            keyNameChanged: 'Key name has been changed',
            keyDeleted: 'Key has been deleted',
            backupCodesGenerated: 'New backup codes generated',
            codesCopied: 'Codes copied to clipboard',
            fileDownloaded: 'File downloaded',
            emailUpdated: 'Email updated',
            passwordChanged: 'Password changed',
            accountDeleted: 'Account deleted',
            copied: 'Copied!'
        }
    },

    // Unlock page
    unlock: {
        title: 'Unlock link',
        step: 'Step',
        of: 'of',
        secureLink: 'Secure link',
        goToPage: 'Go to page',
        checkingConnection: 'Checking connection...',
        steps: {
            openAd: 'Open ad',
            clickAd: 'Click on ad',
            watchAd: 'Watch ad'
        },
        status: {
            watching: 'Watch',
            solveCaptcha: 'Solve captcha',
            clickToContinue: 'Click button to continue'
        },
        clickButtonBelow: 'Click button below',
        openAd: 'Open ad',
        adOpened: 'Ad opened!',
        continue: 'Continue',
        openAdFirst: 'First open ad',
        clickOnAd: 'Click on ad',
        adClicked: 'Ad clicked!',
        clickAdFirst: 'First click ad',
        clickAdToStartTimer: 'Click ad to start timer',
        watchingAd: 'Watching ad...',
        readySolveCaptcha: 'Ready! Solve captcha.',
        clickAd: 'Click ad',
        wait: 'Wait',
        unlocking: 'Unlocking...',
        solveCaptcha: 'Solve captcha',
        unlockLink: 'Unlock link',
        adsHelpCreators: 'Ads help creators earn. Thank you!',
        success: {
            title: 'Link unlocked!',
            redirecting: 'Redirecting...',
            clickIfNotRedirected: 'Click here if not redirected'
        },
        adBlock: {
            title: 'AdBlock detected',
            description: 'To access this link, disable your ad blocker extension and refresh the page.',
            howToDisable: 'How to disable AdBlock:',
            step1: 'Click AdBlock icon in browser',
            step2: 'Select "Disable on this site"',
            step3: 'Click button below',
            checkAgain: 'Check again'
        },
        errors: {
            linkNotExists: 'Link does not exist',
            solveCaptchaFirst: 'First solve captcha',
            unlockFailed: 'Unlock failed'
        }
    },

    // CPM Rates
    cpmRates: {
        title: 'CPM Rates',
        subtitle: 'Earnings per 1000 views by country',
        tier: 'Tier',
        countries: 'Countries',
        rate: 'Rate'
    },

    // Contact
    contact: {
        title: 'Contact',
        subtitle: 'Have questions? Contact us!',
        name: 'Name',
        email: 'Email',
        subject: 'Subject',
        message: 'Message',
        send: 'Send message',
        sending: 'Sending...',
        success: 'Message sent!'
    },

    // Terms
    terms: {
        title: 'Terms of Service',
        lastUpdated: 'Last updated'
    },

    // Referrals
    referrals: {
        title: 'Referral program',
        yourLink: 'Your referral link',
        copyLink: 'Copy link',
        stats: {
            invited: 'Invited',
            active: 'Active',
            earnings: 'Referral earnings'
        },
        howItWorks: 'How it works?',
        commission: 'You receive {{percent}}% of your referrals earnings'
    },

    // Language popup
    languagePopup: {
        title: 'Zmienić język?',
        message: 'Czy chcesz wyświetlić stronę po polsku?',
        yes: 'Tak, zmień na polski',
        no: 'No, keep English',
        dontShowAgain: 'Nie pokazuj ponownie'
    },

    // Language switcher
    languageSwitcher: {
        tooltip: 'Change language',
        pl: 'Polski',
        en: 'English'
    }
};