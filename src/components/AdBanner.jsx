import { useEffect, useRef } from 'react';

function AdBanner({ step = 1, onAdClick = null }) {
    const adRef = useRef(null);
    const clickDetected = useRef(false);

    // Link reklamowy NV Partners
    const generateAdUrl = () => {
        const clickId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const baseUrl = 'https://nvpartnerspromo.com/l/6966b969bf661818d005c932';
        const params = new URLSearchParams({
            sub_id: `step_${step}`,
            sub_id_2: 'angoralinks',
            sub_id_3: window.location.hostname,
            sub_id_4: navigator.language || 'unknown',
            sub_id_5: window.innerWidth < 768 ? 'mobile' : 'desktop',
            click_id: clickId
        });
        return `${baseUrl}?${params.toString()}`;
    };

    useEffect(() => {
        if (!adRef.current) return;

        // Wyczyść kontener
        adRef.current.innerHTML = '';
        clickDetected.current = false;

        // Utwórz iframe z reklamą
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.minHeight = '280px';
        iframe.style.border = 'none';
        iframe.style.overflow = 'hidden';
        iframe.style.display = 'block';
        
        adRef.current.appendChild(iframe);

        const adUrl = generateAdUrl();

        // Wstaw baner reklamowy do iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body { 
                        margin: 0; 
                        padding: 0; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center;
                        min-height: 280px;
                        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }
                    .ad-container {
                        width: 100%;
                        max-width: 500px;
                        padding: 24px;
                        text-align: center;
                    }
                    .ad-link {
                        display: block;
                        text-decoration: none;
                        color: inherit;
                        padding: 20px;
                        border-radius: 16px;
                        background: rgba(30, 41, 59, 0.8);
                        border: 2px dashed #eab308;
                        transition: all 0.3s ease;
                    }
                    .ad-link:hover {
                        background: rgba(234, 179, 8, 0.15);
                        border-style: solid;
                        transform: scale(1.02);
                    }
                    .icon-wrapper {
                        width: 64px;
                        height: 64px;
                        border-radius: 50%;
                        background: rgba(234, 179, 8, 0.2);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 16px;
                        font-size: 28px;
                    }
                    .ad-title {
                        font-size: 18px;
                        font-weight: bold;
                        color: #f8fafc;
                        margin-bottom: 8px;
                    }
                    .ad-description {
                        font-size: 14px;
                        color: #94a3b8;
                        margin-bottom: 16px;
                    }
                    .ad-button {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        background: #eab308;
                        color: #000;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: bold;
                        font-size: 14px;
                        transition: all 0.2s;
                    }
                    .ad-link:hover .ad-button {
                        background: #facc15;
                    }
                    .ad-footer {
                        font-size: 11px;
                        color: #64748b;
                        margin-top: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="ad-container">
                    <a href="${adUrl}" target="_blank" rel="noopener noreferrer" class="ad-link">
                        <div class="icon-wrapper">🎁</div>
                        <div class="ad-title">Exclusive Offer Available!</div>
                        <div class="ad-description">Click to discover special deals and promotions</div>
                        <div class="ad-button">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            View Offer
                        </div>
                        <div class="ad-footer">Sponsored • Step ${step}/5</div>
                    </a>
                </div>
            </body>
            </html>
        `);
        iframeDoc.close();

        // Wykryj kliknięcie - aktywuj od razu
        const triggerClick = () => {
            if (!clickDetected.current && onAdClick) {
                clickDetected.current = true;
                onAdClick();
            }
        };

        // Wykryj gdy okno traci focus (kliknięcie w iframe)
        const handleWindowBlur = () => {
            // Małe opóźnienie żeby upewnić się że focus przeszedł do iframe
            setTimeout(() => {
                triggerClick();
            }, 100);
        };

        iframe.addEventListener('mouseenter', () => {
            // Gdy mysz wejdzie na iframe, nasłuchuj na blur okna
            window.addEventListener('blur', handleWindowBlur, { once: true });
        });

        iframe.addEventListener('mouseleave', () => {
            window.removeEventListener('blur', handleWindowBlur);
        });

        return () => {
            window.removeEventListener('blur', handleWindowBlur);
        };

    }, [step, onAdClick]);

    return (
        <div 
            ref={adRef}
            style={{ 
                minHeight: '280px', 
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        />
    );
}

export default AdBanner;