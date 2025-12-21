import { useEffect, useRef } from 'react';

function AdBanner({ step = 1, onAdClick = null }) {
    const adRef = useRef(null);
    const clickDetected = useRef(false);

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

        // Wstaw skrypt reklamy do iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { 
                        margin: 0; 
                        padding: 0; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center;
                        min-height: 280px;
                        background: transparent;
                    }
                </style>
            </head>
            <body>
                <div id="container-4382c60a0d00345284e499938ab2e8c4"></div>
                <script async data-cfasync="false" src="https://pl28300458.effectivegatecpm.com/4382c60a0d00345284e499938ab2e8c4/invoke.js"><\/script>
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

        // Wykryj focus na iframe
        const handleFocus = () => {
            triggerClick();
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