import { useRef } from 'react';

function AdBanner({ step = 1, onAdClick = null }) {
    const popunderTriggered = useRef(false);

    // Funkcja odpalająca popunder Adsterra
    const triggerPopunder = () => {
        if (popunderTriggered.current) return;
        popunderTriggered.current = true;

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

    return (
        <div
            style={{
                minHeight: '200px',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '16px',
                padding: '24px'
            }}
        >
            <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(234, 179, 8, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
            }}>
                🎁
            </div>

            <p style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#eab308',
                textAlign: 'center',
                margin: 0
            }}>
                Kliknij przycisk poniżej aby kontynuować
            </p>

            <button
                onClick={triggerPopunder}
                disabled={popunderTriggered.current}
                style={{
                    backgroundColor: '#eab308',
                    color: '#000000',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s'
                }}
            >
                🔗 Otwórz reklamę
            </button>

            <p style={{
                fontSize: '11px',
                color: '#64748b',
                margin: 0
            }}>
                Sponsored • Krok {step}/5
            </p>
        </div>
    );
}

export default AdBanner;