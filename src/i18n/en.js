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
        pageNotFound: 'Page not found'
    },

    // Navbar
    navbar: {
        dashboard: 'Dashboard',
        stats: 'Statistics',
        payouts: 'Payouts',
        profile: 'Profile',
        admin: 'Admin',
        login: 'Login',
        register: 'Join now',
        logout: 'Logout'
    },

    // Home page
    home: {
        hero: {
            title: 'Earn money from your links',
            subtitle: 'Shorten links and earn for every click. Join thousands of users.',
            cta: 'Start earning',
            ctaSecondary: 'View CPM rates'
        },
        stats: {
            users: 'Users',
            clicks: 'Clicks',
            paidOut: 'Paid out',
            uptime: 'Uptime'
        },
        features: {
            title: 'Why choose us?',
            fast: {
                title: 'Fast payouts',
                description: 'Payouts processed within 24-48 hours'
            },
            secure: {
                title: 'Security',
                description: 'Your data is fully protected'
            },
            global: {
                title: 'Global reach',
                description: 'Earn from traffic worldwide'
            }
        }
    },

    // Dashboard
    dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome',
        tabs: {
            links: 'My links',
            referrals: 'Referral program'
        },
        stats: {
            balance: 'Balance',
            totalClicks: 'Clicks',
            totalEarnings: 'Earnings',
            activeLinks: 'Active links'
        },
        links: {
            create: 'Create link',
            noLinks: "You don't have any links yet",
            createFirst: 'Create your first link and start earning!',
            copyLink: 'Copy link',
            openOriginal: 'Open original',
            clicks: 'clicks',
            earned: 'earned',
            active: 'Active',
            inactive: 'Inactive'
        },
        createModal: {
            title: 'Create new link',
            urlLabel: 'Destination URL',
            urlPlaceholder: 'https://example.com',
            titleLabel: 'Title (optional)',
            titlePlaceholder: 'My link',
            creating: 'Creating...',
            create: 'Create link'
        },
        editModal: {
            title: 'Edit link',
            urlLabel: 'Destination URL',
            titleLabel: 'Title',
            descriptionLabel: 'Description',
            descriptionPlaceholder: 'Optional link description...',
            statusLabel: 'Status',
            active: 'Active',
            inactive: 'Inactive',
            saving: 'Saving...',
            save: 'Save changes'
        },
        deleteConfirm: 'Are you sure you want to delete this link?'
    },

    // Login
    login: {
        title: 'Login',
        email: 'Email',
        password: 'Password',
        submit: 'Login',
        loggingIn: 'Logging in...',
        noAccount: "Don't have an account?",
        register: 'Register',
        forgotPassword: 'Forgot password?'
    },

    // Register
    register: {
        title: 'Register',
        username: 'Username',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm password',
        submit: 'Register',
        registering: 'Registering...',
        hasAccount: 'Already have an account?',
        login: 'Login',
        termsAgree: 'I accept the terms of service'
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
        personalInfo: 'Personal information',
        security: 'Security',
        paymentMethods: 'Payment methods',
        changePassword: 'Change password',
        twoFactor: 'Two-factor authentication',
        enable2FA: 'Enable 2FA',
        disable2FA: 'Disable 2FA'
    },

    // Unlock page
    unlock: {
        title: 'Unlock link',
        step: 'Step',
        of: 'of',
        completeSteps: 'Complete the steps below to unlock the link',
        getLink: 'Get link',
        redirecting: 'Redirecting...',
        visitWebsite: 'Visit website',
        watchVideo: 'Watch video',
        waitSeconds: 'Wait {{seconds}} seconds'
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