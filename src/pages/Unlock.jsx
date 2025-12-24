// Unlock.jsx - RESPONSYWNY - 5 KROKÓW
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Link2, Clock, CheckCircle, ExternalLink, Loader2, AlertCircle, Shield, MousePointer, ShieldOff, RefreshCw } from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import AdBanner from '../components/AdBanner';

// API URL - łatwa zmiana w przyszłości
const API_URL = 'https://angoralinks-backend-production.up.railway.app';

// Hook do wykrywania rozmiaru ekranu
const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        ...windowSize,
        isMobile: windowSize.width < 768
    };
};

// Konfiguracja kroków: URL = direct link, BANNER = reklama banerowa
const STEPS_CONFIG = [
    { type: 'URL', label: 'Otwórz reklamę' },
    { type: 'BANNER', label: 'Kliknij w reklamę' },
    { type: 'URL', label: 'Otwórz reklamę' },
    { type: 'URL', label: 'Otwórz reklamę' },
    { type: 'BANNER', label: 'Oglądaj reklamę' }
];

const TOTAL_STEPS = STEPS_CONFIG.length;

function Unlock() {
    const { shortCode } = useParams();
    const { isMobile } = useWindowSize();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [linkData, setLinkData] = useState(null);
    const [step, setStep] = useState(1);
    const [adClicked, setAdClicked] = useState(false);
    const [timer, setTimer] = useState(20);
    const [timerStarted, setTimerStarted] = useState(false);
    const [timerDone, setTimerDone] = useState(false);
    const [unlocking, setUnlocking] = useState(false);
    const [targetUrl, setTargetUrl] = useState(null);
    
    const [adBlockDetected, setAdBlockDetected] = useState(false);
    const [checkingAdBlock, setCheckingAdBlock] = useState(true);
    
    const [captchaToken, setCaptchaToken] = useState(null);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const captchaRef = useRef(null);

    const HCAPTCHA_SITE_KEY = 'c6486bc4-4a2e-4c3c-b8e6-720cf3dc324e';
    const DIRECT_LINK = 'https://www.effectivegatecpm.com/ywkxbw41h?key=d1f50bdb00b57c1ece2c8c53b6332d4d';

    // Pobierz aktualną konfigurację kroku
    const currentStepConfig = STEPS_CONFIG[step - 1];
    const isLastStep = step === TOTAL_STEPS;

    const detectAdBlock = async () => {
        setCheckingAdBlock(true);
        
        try {
            const testAd = document.createElement('div');
            testAd.innerHTML = '&nbsp;';
            testAd.className = 'adsbox ad-banner ad-placeholder textads banner-ads';
            testAd.style.cssText = 'position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px;';
            document.body.appendChild(testAd);
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const isBlocked = testAd.offsetHeight === 0 || 
                              testAd.offsetWidth === 0 || 
                              testAd.clientHeight === 0 ||
                              window.getComputedStyle(testAd).display === 'none';
            
            document.body.removeChild(testAd);
            
            if (isBlocked) {
                setAdBlockDetected(true);
                setCheckingAdBlock(false);
                return;
            }
            
            try {
                await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
                    method: 'HEAD',
                    mode: 'no-cors',
                    cache: 'no-cache'
                });
                setAdBlockDetected(false);
            } catch (e) {
                setAdBlockDetected(true);
            }
            
        } catch (e) {
            setAdBlockDetected(true);
        }
        
        setCheckingAdBlock(false);
    };

    useEffect(() => {
        detectAdBlock();
    }, []);

    const recheckAdBlock = () => {
        detectAdBlock();
    };

    // Pobieranie danych o linku
    useEffect(() => {
        const fetchLink = async () => {
            try {
                const response = await fetch(`${API_URL}/l/info/${shortCode}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Link nie istnieje');
                setLinkData(data.link);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchLink();
    }, [shortCode]);

    // Timer - tylko na ostatnim kroku (BANNER)
    useEffect(() => {
        if (!timerStarted || timerDone) return;
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    setTimerDone(true);
                    setShowCaptcha(true);
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timerStarted, timerDone]);

    // Kliknięcie w Direct Link (URL)
    const handleDirectLinkClick = () => {
        window.open(DIRECT_LINK, '_blank');
        setAdClicked(true);
    };

    // Kliknięcie w Banner
    const handleAdClick = () => {
        if (!adClicked) {
            setAdClicked(true);
            // Jeśli to ostatni krok, uruchom timer
            if (isLastStep) {
                setTimerStarted(true);
            }
        }
    };

    // Przejście do następnego kroku
    const handleNextStep = () => {
        if (!adClicked) return;
        
        if (step < TOTAL_STEPS) {
            setStep(step + 1);
            setAdClicked(false);
        }
    };

    const handleCaptchaVerify = (token) => {
        setCaptchaToken(token);
    };

    // Odblokowywanie linku
    const handleUnlock = async () => {
        if (!timerDone) return;
        
        if (showCaptcha && !captchaToken) {
            setError('Najpierw rozwiąż captcha');
            return;
        }

        setUnlocking(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/l/unlock/${shortCode}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    hcaptchaToken: captchaToken,
                    country: 'PL',
                    device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
                })
            });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Błąd odblokowania');
            }
            
            setTargetUrl(data.redirectUrl);
            setTimeout(() => { window.location.href = data.redirectUrl; }, 1500);
        } catch (err) {
            setError(err.message);
            if (captchaRef.current) {
                captchaRef.current.resetCaptcha();
            }
            setCaptchaToken(null);
        } finally {
            setUnlocking(false);
        }
    };

    // Generuj tekst statusu dla kroku
    const getStepStatusText = () => {
        if (adClicked) {
            if (isLastStep && !timerDone) {
                return `Oglądaj - ${timer}s`;
            }
            if (isLastStep && timerDone) {
                return '✓ Rozwiąż captcha';
            }
            return '✓ Kliknij przycisk aby przejść dalej';
        }
        return `Krok ${step}/${TOTAL_STEPS} - ${currentStepConfig.label}`;
    };

    // Styles
    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: '#0f172a',
            color: '#f8fafc'
        },
        centerScreen: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            padding: '16px',
            flexDirection: 'column',
            gap: '16px'
        },
        header: {
            borderBottom: '1px solid #1e293b',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: isMobile ? '12px' : '16px',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backdropFilter: 'blur(8px)'
        },
        headerContent: {
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        main: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: isMobile ? '16px 12px' : '32px 16px'
        },
        stepIndicator: {
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile ? '8px' : '12px',
            marginBottom: isMobile ? '20px' : '32px',
            flexWrap: 'wrap'
        },
        stepCircle: (isActive, isComplete) => ({
            width: isMobile ? '32px' : '40px',
            height: isMobile ? '32px' : '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: isMobile ? '12px' : '16px',
            backgroundColor: isComplete ? '#22c55e' : isActive ? '#0ea5e9' : '#334155',
            color: isComplete || isActive ? '#ffffff' : '#94a3b8',
            transition: 'all 0.3s'
        }),
        infoCard: {
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: isMobile ? '12px' : '16px',
            padding: isMobile ? '16px' : '24px',
            marginBottom: isMobile ? '20px' : '32px',
            textAlign: 'center'
        },
        adCard: (clicked) => ({
            backgroundColor: clicked ? 'rgba(34, 197, 94, 0.1)' : 'rgba(30, 41, 59, 0.3)',
            border: clicked ? '2px solid #22c55e' : '2px solid #eab308',
            borderRadius: isMobile ? '12px' : '16px',
            padding: isMobile ? '20px 16px' : '32px',
            marginBottom: '16px',
            textAlign: 'center'
        }),
        button: (enabled) => ({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: isMobile ? '14px 24px' : '16px 32px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: isMobile ? '16px' : '18px',
            border: 'none',
            backgroundColor: enabled ? '#0ea5e9' : '#334155',
            color: enabled ? '#ffffff' : '#94a3b8',
            cursor: enabled ? 'pointer' : 'not-allowed',
            width: isMobile ? '100%' : 'auto',
            minHeight: '48px',
            transition: 'all 0.3s'
        }),
        unlockButton: (enabled) => ({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            backgroundColor: enabled ? '#22c55e' : '#334155',
            color: '#ffffff',
            padding: isMobile ? '14px 24px' : '16px 32px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: isMobile ? '16px' : '18px',
            border: 'none',
            cursor: enabled ? 'pointer' : 'not-allowed',
            opacity: enabled ? 1 : 0.7,
            width: isMobile ? '100%' : 'auto',
            minHeight: '48px',
            transition: 'all 0.3s'
        }),
        directLinkButton: {
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
            transition: 'all 0.3s'
        }
    };

    // Ekran ładowania sprawdzania AdBlocka
    if (checkingAdBlock) {
        return (
            <div style={styles.centerScreen}>
                <Loader2 className="animate-spin" style={{ width: '48px', height: '48px', color: '#0ea5e9' }} />
                <p style={{ color: '#94a3b8', fontSize: '16px' }}>Sprawdzanie połączenia...</p>
            </div>
        );
    }

    // Ekran blokady - AdBlock wykryty
    if (adBlockDetected) {
        return (
            <div style={styles.centerScreen}>
                <div style={{ 
                    maxWidth: '500px', 
                    width: '100%',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    border: '2px solid #ef4444',
                    borderRadius: '24px',
                    padding: isMobile ? '32px 20px' : '48px 32px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: isMobile ? '64px' : '80px',
                        height: isMobile ? '64px' : '80px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <ShieldOff style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', color: '#ef4444' }} />
                    </div>

                    <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold', color: '#f8fafc', marginBottom: '16px' }}>
                        AdBlock wykryty
                    </h1>

                    <p style={{ color: '#94a3b8', fontSize: isMobile ? '14px' : '16px', lineHeight: '1.6', marginBottom: '24px' }}>
                        Aby uzyskać dostęp do tego linku, wyłącz rozszerzenie blokujące reklamy i odśwież stronę.
                    </p>

                    <div style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: '16px',
                        padding: isMobile ? '16px' : '24px',
                        marginBottom: '24px',
                        textAlign: 'left'
                    }}>
                        <h3 style={{ color: '#f8fafc', fontSize: isMobile ? '14px' : '16px', fontWeight: 'bold', marginBottom: '12px' }}>
                            Jak wyłączyć AdBlock:
                        </h3>
                        <ol style={{ color: '#94a3b8', fontSize: isMobile ? '13px' : '14px', lineHeight: '2', paddingLeft: '20px', margin: 0 }}>
                            <li>Kliknij ikonę AdBlocka w przeglądarce</li>
                            <li>Wybierz "Wyłącz na tej stronie"</li>
                            <li>Kliknij przycisk poniżej</li>
                        </ol>
                    </div>

                    <button
                        onClick={recheckAdBlock}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            backgroundColor: '#0ea5e9',
                            color: '#ffffff',
                            padding: '16px 32px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            minHeight: '48px'
                        }}
                    >
                        <RefreshCw style={{ width: '20px', height: '20px' }} />
                        Sprawdź ponownie
                    </button>

                    <p style={{ color: '#64748b', fontSize: '12px', marginTop: '24px' }}>
                        Reklamy pozwalają nam utrzymać serwis ❤️
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.centerScreen}>
                <Loader2 className="animate-spin" style={{ width: '32px', height: '32px', color: '#0ea5e9' }} />
            </div>
        );
    }

    if (error && !linkData) {
        return (
            <div style={styles.centerScreen}>
                <div style={{ textAlign: 'center' }}>
                    <AlertCircle style={{ width: '64px', height: '64px', color: '#ef4444', margin: '0 auto 16px' }} />
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Błąd</h1>
                    <p style={{ color: '#94a3b8' }}>{error}</p>
                </div>
            </div>
        );
    }

    if (targetUrl) {
        return (
            <div style={styles.centerScreen}>
                <div style={{ textAlign: 'center' }}>
                    <CheckCircle style={{ width: '64px', height: '64px', color: '#22c55e', margin: '0 auto 16px' }} />
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Link odblokowany!</h1>
                    <p style={{ color: '#94a3b8', marginBottom: '16px' }}>Przekierowywanie...</p>
                    <a href={targetUrl} style={{ color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        Kliknij tutaj jeśli nie zostałeś przekierowany
                        <ExternalLink style={{ width: '16px', height: '16px' }} />
                    </a>
                </div>
            </div>
        );
    }

    // Renderowanie kroku typu URL (Direct Link)
    const renderURLStep = () => (
        <div style={{ marginBottom: '24px' }}>
            <div style={styles.adCard(adClicked)}>
                {!adClicked ? (
                    <>
                        <ExternalLink style={{ width: isMobile ? '48px' : '64px', height: isMobile ? '48px' : '64px', color: '#eab308', margin: '0 auto 16px' }} />
                        <p style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold', color: '#eab308', marginBottom: '16px' }}>
                            Kliknij przycisk poniżej
                        </p>
                        <button onClick={handleDirectLinkClick} style={styles.directLinkButton}>
                            🔗 Otwórz reklamę
                        </button>
                    </>
                ) : (
                    <>
                        <CheckCircle style={{ width: '64px', height: '64px', color: '#22c55e', margin: '0 auto 16px' }} />
                        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#22c55e' }}>Reklama otwarta!</p>
                    </>
                )}
            </div>
            <div style={{ textAlign: 'center' }}>
                <button onClick={handleNextStep} disabled={!adClicked} style={styles.button(adClicked)}>
                    {adClicked ? (
                        <>Kontynuuj <CheckCircle style={{ width: '20px', height: '20px' }} /></>
                    ) : (
                        <><MousePointer style={{ width: '20px', height: '20px' }} /> Najpierw otwórz reklamę</>
                    )}
                </button>
            </div>
        </div>
    );

    // Renderowanie kroku typu BANNER (bez timera - kroki pośrednie)
    const renderBannerStep = () => (
        <div style={{ marginBottom: '24px' }}>
            <div style={styles.adCard(adClicked)}>
                {!adClicked && (
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <p style={{ fontWeight: 'bold', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: isMobile ? '14px' : '16px' }}>
                            <MousePointer style={{ width: '20px', height: '20px' }} />
                            Kliknij w reklamę
                        </p>
                    </div>
                )}
                {adClicked && (
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <p style={{ fontWeight: 'bold', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <CheckCircle style={{ width: '20px', height: '20px' }} />
                            Reklama kliknięta!
                        </p>
                    </div>
                )}
                <AdBanner step={step} onAdClick={handleAdClick} />
            </div>
            <div style={{ textAlign: 'center' }}>
                <button onClick={handleNextStep} disabled={!adClicked} style={styles.button(adClicked)}>
                    {adClicked ? (
                        <>Kontynuuj <CheckCircle style={{ width: '20px', height: '20px' }} /></>
                    ) : (
                        <><MousePointer style={{ width: '20px', height: '20px' }} /> Najpierw kliknij reklamę</>
                    )}
                </button>
            </div>
        </div>
    );

    // Renderowanie ostatniego kroku BANNER (z timerem i captcha)
    const renderFinalBannerStep = () => (
        <div style={{ marginBottom: '24px' }}>
            <div style={styles.adCard(adClicked)}>
                {!adClicked && (
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <p style={{ fontWeight: 'bold', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: isMobile ? '14px' : '16px' }}>
                            <MousePointer style={{ width: '20px', height: '20px' }} />
                            Kliknij reklamę aby rozpocząć timer
                        </p>
                    </div>
                )}
                {adClicked && !timerDone && (
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <p style={{ fontWeight: 'bold', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Clock style={{ width: '20px', height: '20px' }} />
                            Oglądaj reklamę...
                        </p>
                    </div>
                )}
                {timerDone && (
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <p style={{ fontWeight: 'bold', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <CheckCircle style={{ width: '20px', height: '20px' }} />
                            Gotowe! Rozwiąż captcha.
                        </p>
                    </div>
                )}
                <AdBanner step={step} onAdClick={handleAdClick} />
            </div>

            {/* Timer / Captcha / Unlock */}
            <div style={{ textAlign: 'center' }}>
                {!adClicked ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: isMobile ? '12px 20px' : '16px 32px', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                        <MousePointer style={{ width: '20px', height: '20px', color: '#eab308' }} />
                        <span style={{ fontSize: isMobile ? '14px' : '20px', fontWeight: 'bold', color: '#94a3b8' }}>Kliknij reklamę</span>
                    </div>
                ) : !timerDone ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: isMobile ? '12px 20px' : '16px 32px', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                        <Clock style={{ width: '24px', height: '24px', color: '#0ea5e9' }} />
                        <span style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 'bold' }}>
                            Poczekaj <span style={{ color: '#0ea5e9', fontSize: isMobile ? '24px' : '28px' }}>{timer}</span>s
                        </span>
                    </div>
                ) : (
                    <div>
                        {showCaptcha && (
                            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center', transform: isMobile ? 'scale(0.9)' : 'none', transformOrigin: 'center' }}>
                                <HCaptcha
                                    ref={captchaRef}
                                    sitekey={HCAPTCHA_SITE_KEY}
                                    onVerify={handleCaptchaVerify}
                                    theme="dark"
                                />
                            </div>
                        )}
                        
                        <button
                            onClick={handleUnlock}
                            disabled={unlocking || (showCaptcha && !captchaToken)}
                            style={styles.unlockButton(!unlocking && (!showCaptcha || captchaToken))}
                        >
                            {unlocking ? (
                                <><Loader2 className="animate-spin" style={{ width: '24px', height: '24px' }} /> Odblokowywanie...</>
                            ) : (showCaptcha && !captchaToken) ? (
                                <><Shield style={{ width: '24px', height: '24px' }} /> Rozwiąż captcha</>
                            ) : (
                                <><CheckCircle style={{ width: '24px', height: '24px' }} /> Odblokuj link</>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    // Wybierz odpowiedni renderer dla aktualnego kroku
    const renderCurrentStep = () => {
        if (currentStepConfig.type === 'URL') {
            return renderURLStep();
        } else if (currentStepConfig.type === 'BANNER') {
            if (isLastStep) {
                return renderFinalBannerStep();
            } else {
                return renderBannerStep();
            }
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link2 style={{ width: '24px', height: '24px', color: '#0ea5e9' }} />
                        <span style={{ fontWeight: 'bold', fontSize: isMobile ? '16px' : '18px' }}>AngoraLinks</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: isMobile ? '12px' : '14px', color: '#94a3b8' }}>
                        <Shield style={{ width: '16px', height: '16px' }} />
                        <span style={{ display: isMobile ? 'none' : 'inline' }}>Bezpieczny link</span>
                    </div>
                </div>
            </header>

            {/* Progress bar */}
            <div style={{ backgroundColor: '#1e293b', height: '6px' }}>
                <div style={{ backgroundColor: '#0ea5e9', height: '100%', width: `${(step / TOTAL_STEPS) * 100}%`, transition: 'width 0.5s' }} />
            </div>

            {/* Main */}
            <main style={styles.main}>
                {/* Kroki - 5 kółek */}
                <div style={styles.stepIndicator}>
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
                        <div key={s} style={styles.stepCircle(s === step, s < step)}>
                            {s < step ? <CheckCircle style={{ width: isMobile ? '16px' : '20px', height: isMobile ? '16px' : '20px' }} /> : s}
                        </div>
                    ))}
                </div>

                {/* Link info */}
                <div style={styles.infoCard}>
                    <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                        {linkData?.title || 'Przejdź do strony'}
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: isMobile ? '14px' : '16px' }}>
                        {getStepStatusText()}
                    </p>
                </div>

                {/* Błąd */}
                {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
                        <p style={{ color: '#ef4444', fontSize: '14px' }}>{error}</p>
                    </div>
                )}

                {/* Renderuj aktualny krok */}
                {renderCurrentStep()}

                <p style={{ textAlign: 'center', fontSize: isMobile ? '12px' : '14px', color: '#64748b', marginTop: '24px' }}>
                    Reklamy pomagają twórcom zarabiać. Dziękujemy! ❤️
                </p>
            </main>
        </div>
    );
}

export default Unlock;