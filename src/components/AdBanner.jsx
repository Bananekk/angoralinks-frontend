import { useRef } from 'react';

function AdBanner({ step = 1, onAdClick = null, isMobile = false }) {
    const popunderTriggered = useRef(false);

    // Funkcja odpalająca popunder Adsterra
    const triggerPopunder = () => {
        if (popunderTriggered.current) return;
        popunderTriggered.current = true;

        // Otwórz direct link w nowej karcie (jako fallback dla popundera)
        window.open('https://www.effectivegatecpm.com/ywkxbw41h?key=d1f50bdb00b57c1ece2c8c53b6332d4d', '_blank');

        // Ładuj skrypt popunder Adsterra
        const script = document.createElement('script');
        script.src = 'https://pl28300392.effectivegatecpm.com/4c/bb/c9/4cbbc9f8d48a865dfc7e7d0b6f1015de.js';
        script.async = true;
        document.body.appendChild(script);

        // Sygnalizuj kliknięcie
        if (onAdClick) {
            onAdClick();
        }
    };

    // Styl identyczny jak directLinkButton w Unlock.jsx
    const buttonStyle = {
        backgroundColor: '#eab308',
        color: '#000000',
        padding: isMobile ? '14px 24px' : '16px 32px',
        borderRadius: '12px',
        fontWeight: 'bold',
        fontSize: isMobile ? '16px' : '18px',
        border: 'none',
        cursor: 'pointer',
        width: isMobile ? '100%' : 'auto',
        minHeight: '48px',
        transition: 'all 0.3s',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    };

    return (
        <button onClick={triggerPopunder} style={buttonStyle}>
            🔗 Otwórz reklamę
        </button>
    );
}

export default AdBanner;