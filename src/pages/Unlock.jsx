// Unlock.jsx - Z DWUETAPOWYM SYSTEMEM ZAROBKÓW
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Link2, Clock, CheckCircle, ExternalLink, Loader2, AlertCircle, Shield, MousePointer, ShieldOff, RefreshCw } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import AdBanner from '../components/AdBanner';
import { useTranslation } from '../i18n';

const API_URL = 'https://angoralinks-backend.onrender.com';

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

const usePopunder = (shouldLoad) => {
    const popunderLoaded = useRef(false);

    useEffect(() => {
        if (shouldLoad && !popunderLoaded.current) {
            popunderLoaded.current = true;
            const script = document.createElement('script');
            script.src = 'https://pl28300392.effectivegatecpm.com/4c/bb/c9/4cbbc9f8d48a865dfc7e7d0b6f1015de.js';
            script.async = true;
            document.body.appendChild(script);

            return () => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };
        }
    }, [shouldLoad]);
};

const TOTAL_STEPS = 5;

function Unlock() {
    const { shortCode } = useParams();
    const { isMobile } = useWindowSize();
    const { t } = useTranslation();

    const STEPS_CONFIG = [
        { type: 'URL', label: t('unlock.steps.openAd') },
        { type: 'BANNER', label: t('unlock.steps.openAd') },
        { type: 'URL', label: t('unlock.steps.openAd') },
        { type: 'BANNER', label: t('unlock.steps.openAd') },
        { type: 'URL', label: t('unlock.steps.openAd') }
    ];

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
    const [showPopunderOverlay, setShowPopunderOverlay] = useState(false);

    // 🔥 NOWE: Przechowujemy visitId z /unlock
    const [visitId, setVisitId] = useState(null);

    const RECAPTCHA_SITE_KEY = '6Lcy02QsAAAAAD3R7ZxXE-1ZljnjptF4qhz3hVCb';
    const DIRECT_LINK = 'https://www.effectivegatecpm.com/ywkxbw41h?key=d1f50bdb00b57c1ece2c8c53b6332d4d';

    // Pokaż overlay gdy pojawi się captcha
    useEffect(() => {
        if (showCaptcha) {
            setShowPopunderOverlay(true);
        }
    }, [showCaptcha]);

    // Funkcja odpalająca popunder i ukrywająca overlay
    const handleOverlayClick = () => {
        // Odpal popunder
        const script = document.createElement('script');
        script.src = 'https://pl28300392.effectivegatecpm.com/4c/bb/c9/4cbbc9f8d48a865dfc7e7d0b6f1015de.js';
        script.async = true;
        document.body.appendChild(script);

        // Ukryj overlay
        setShowPopunderOverlay(false);
    };

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

    useEffect(() => {
        const fetchLink = async () => {
            try {
                const response = await fetch(`${API_URL}/l/info/${shortCode}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || t('unlock.errors.linkNotExists'));
                setLinkData(data.link);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchLink();
    }, [shortCode, t]);

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

    const handleDirectLinkClick = () => {
        window.open(DIRECT_LINK, '_blank');
        setAdClicked(true);
        if (isLastStep) {
            setTimerStarted(true);
        }
    };

    const handleAdClick = () => {
        if (!adClicked) {
            setAdClicked(true);
            if (isLastStep) {
                setTimerStarted(true);
            }
        }
    };

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

    // 🔥 ZAKTUALIZOWANE: Dwuetapowe odblokowywanie
    const handleUnlock = async () => {
        if (!timerDone) return;

        if (showCaptcha && !captchaToken) {
            setError(t('unlock.errors.solveCaptchaFirst'));
            return;
        }

        setUnlocking(true);
        setError(null);

        try {
            // KROK 1: Unlock - rejestracja wizyty (bez zarobku)
            const unlockResponse = await fetch(`${API_URL}/l/unlock/${shortCode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recaptchaToken: captchaToken,
                    country: 'PL',
                    device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
                })
            });

            const unlockData = await unlockResponse.json();

            if (!unlockResponse.ok) {
                throw new Error(unlockData.message || t('unlock.errors.unlockFailed'));
            }

            // KROK 2: Jeśli mamy visitId (unikalna wizyta), potwierdź wyświetlenie reklamy
            if (unlockData.visitId) {
                try {
                    const confirmResponse = await fetch(`${API_URL}/l/confirm-ad/${shortCode}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            visitId: unlockData.visitId
                        })
                    });

                    const confirmData = await confirmResponse.json();

                    if (confirmResponse.ok) {
                        console.log(`✅ Zarobek potwierdzony: $${confirmData.earned?.toFixed(6) || 0}`);
                    } else {
                        console.warn('⚠️ Nie udało się potwierdzić zarobku:', confirmData.message);
                    }
                } catch (confirmError) {
                    console.error('❌ Błąd potwierdzania reklamy:', confirmError);
                    // Nie blokujemy przekierowania - user i tak dostaje link
                }
            }

            // Przekierowanie do docelowego URL
            setTargetUrl(unlockData.redirectUrl);
            setTimeout(() => {
                window.location.href = unlockData.redirectUrl;
            }, 1500);

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

    const getStepStatusText = () => {
        if (adClicked) {
            if (isLastStep && !timerDone) {
                return `${t('unlock.status.watching')} - ${timer}s`;
            }
            if (isLastStep && timerDone) {
                return `✓ ${t('unlock.status.solveCaptcha')}`;
            }
            return `✓ ${t('unlock.status.clickToContinue')}`;
        }
        return `${t('unlock.step')} ${step}/${TOTAL_STEPS} - ${currentStepConfig.label}`;
    };

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

    if (checkingAdBlock) {
        return (
            <div style={styles.centerScreen}>
                <Loader2 className="animate-spin" style={{ width: '48px', height: '48px', color: '#0ea5e9' }} />
                <p style={{ color: '#94a3b8', fontSize: '16px' }}>{t('unlock.checkingConnection')}</p>
            </div>
        );
    }

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
                        {t('unlock.adBlock.title')}
                    </h1>

                    <p style={{ color: '#94a3b8', fontSize: isMobile ? '14px' : '16px', lineHeight: '1.6', marginBottom: '24px' }}>
                        {t('unlock.adBlock.description')}
                    </p>

                    <div style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        borderRadius: '16px',
                        padding: isMobile ? '16px' : '24px',
                        marginBottom: '24px',
                        textAlign: 'left'
                    }}>
                        <h3 style={{ color: '#f8fafc', fontSize: isMobile ? '14px' : '16px', fontWeight: 'bold', marginBottom: '12px' }}>
                            {t('unlock.adBlock.howToDisable')}
                        </h3>
                        <ol style={{ color: '#94a3b8', fontSize: isMobile ? '13px' : '14px', lineHeight: '2', paddingLeft: '20px', margin: 0 }}>
                            <li>{t('unlock.adBlock.step1')}</li>
                            <li>{t('unlock.adBlock.step2')}</li>
                            <li>{t('unlock.adBlock.step3')}</li>
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
                        {t('unlock.adBlock.checkAgain')}
                    </button>

                    <p style={{ color: '#64748b', fontSize: '12px', marginTop: '24px' }}>
                        {t('unlock.adsHelpCreators')} ❤️
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
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{t('common.error')}</h1>
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
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{t('unlock.success.title')}</h1>
                    <p style={{ color: '#94a3b8', marginBottom: '16px' }}>{t('unlock.success.redirecting')}</p>
                    <a href={targetUrl} style={{ color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {t('unlock.success.clickIfNotRedirected')}
                        <ExternalLink style={{ width: '16px', height: '16px' }} />
                    </a>
                </div>
            </div>
        );
    }

    const renderURLStep = () => (
        <div style={{ marginBottom: '24px' }}>
            <div style={styles.adCard(adClicked)}>
                {!adClicked ? (
                    <>
                        <ExternalLink style={{ width: isMobile ? '48px' : '64px', height: isMobile ? '48px' : '64px', color: '#eab308', margin: '0 auto 16px' }} />
                        <p style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold', color: '#eab308', marginBottom: '16px' }}>
                            {t('unlock.clickButtonBelow')}
                        </p>
                        <button onClick={handleDirectLinkClick} style={styles.directLinkButton}>
                            🔗 {t('unlock.openAd')}
                        </button>
                    </>
                ) : (
                    <>
                        <CheckCircle style={{ width: '64px', height: '64px', color: '#22c55e', margin: '0 auto 16px' }} />
                        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#22c55e' }}>{t('unlock.adOpened')}</p>
                    </>
                )}
            </div>
            <div style={{ textAlign: 'center' }}>
                <button onClick={handleNextStep} disabled={!adClicked} style={styles.button(adClicked)}>
                    {adClicked ? (
                        <>{t('unlock.continue')} <CheckCircle style={{ width: '20px', height: '20px' }} /></>
                    ) : (
                        <><MousePointer style={{ width: '20px', height: '20px' }} /> {t('unlock.openAdFirst')}</>
                    )}
                </button>
            </div>
        </div>
    );

    // Krok BANNER - wygląda jak URL step ale odpala popunder
    const renderBannerStep = () => (
        <div style={{ marginBottom: '24px' }}>
            <div style={styles.adCard(adClicked)}>
                {!adClicked ? (
                    <>
                        <ExternalLink style={{ width: isMobile ? '48px' : '64px', height: isMobile ? '48px' : '64px', color: '#eab308', margin: '0 auto 16px' }} />
                        <p style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold', color: '#eab308', marginBottom: '16px' }}>
                            {t('unlock.clickButtonBelow')}
                        </p>
                        <AdBanner step={step} onAdClick={handleAdClick} isMobile={isMobile} />
                    </>
                ) : (
                    <>
                        <CheckCircle style={{ width: '64px', height: '64px', color: '#22c55e', margin: '0 auto 16px' }} />
                        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#22c55e' }}>{t('unlock.adOpened')}</p>
                    </>
                )}
            </div>
            <div style={{ textAlign: 'center' }}>
                <button onClick={handleNextStep} disabled={!adClicked} style={styles.button(adClicked)}>
                    {adClicked ? (
                        <>{t('unlock.continue')} <CheckCircle style={{ width: '20px', height: '20px' }} /></>
                    ) : (
                        <><MousePointer style={{ width: '20px', height: '20px' }} /> {t('unlock.openAdFirst')}</>
                    )}
                </button>
            </div>
        </div>
    );

    // Ostatni krok URL - z timerem i captchą
    const renderFinalURLStep = () => (
        <div style={{ marginBottom: '24px' }}>
            <div style={styles.adCard(adClicked)}>
                {!adClicked ? (
                    <>
                        <ExternalLink style={{ width: isMobile ? '48px' : '64px', height: isMobile ? '48px' : '64px', color: '#eab308', margin: '0 auto 16px' }} />
                        <p style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold', color: '#eab308', marginBottom: '16px' }}>
                            {t('unlock.clickButtonBelow')}
                        </p>
                        <button onClick={handleDirectLinkClick} style={styles.directLinkButton}>
                            🔗 {t('unlock.openAd')}
                        </button>
                    </>
                ) : !timerDone ? (
                    <>
                        <Clock style={{ width: isMobile ? '48px' : '64px', height: isMobile ? '48px' : '64px', color: '#0ea5e9', margin: '0 auto 16px' }} />
                        <p style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold', color: '#0ea5e9', marginBottom: '8px' }}>
                            {t('unlock.watchingAd')}
                        </p>
                        <p style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 'bold', color: '#0ea5e9' }}>
                            {timer}s
                        </p>
                    </>
                ) : (
                    <>
                        <CheckCircle style={{ width: '64px', height: '64px', color: '#22c55e', margin: '0 auto 16px' }} />
                        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#22c55e' }}>{t('unlock.readySolveCaptcha')}</p>
                    </>
                )}
            </div>

            <div style={{ textAlign: 'center' }}>
                {!adClicked ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: isMobile ? '12px 20px' : '16px 32px', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                        <MousePointer style={{ width: '20px', height: '20px', color: '#eab308' }} />
                        <span style={{ fontSize: isMobile ? '14px' : '20px', fontWeight: 'bold', color: '#94a3b8' }}>{t('unlock.openAdFirst')}</span>
                    </div>
                ) : !timerDone ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: isMobile ? '12px 20px' : '16px 32px', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
                        <Clock style={{ width: '24px', height: '24px', color: '#0ea5e9' }} />
                        <span style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 'bold' }}>
                            {t('unlock.wait')} <span style={{ color: '#0ea5e9', fontSize: isMobile ? '24px' : '28px' }}>{timer}</span>s
                        </span>
                    </div>
                ) : (
                    <div>
                        {showCaptcha && (
                            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center', transform: isMobile ? 'scale(0.9)' : 'none', transformOrigin: 'center' }}>
                                <ReCAPTCHA
                                    ref={captchaRef}
                                    sitekey={RECAPTCHA_SITE_KEY}
                                    onChange={handleCaptchaVerify}
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
                                <><Loader2 className="animate-spin" style={{ width: '24px', height: '24px' }} /> {t('unlock.unlocking')}</>
                            ) : (showCaptcha && !captchaToken) ? (
                                <><Shield style={{ width: '24px', height: '24px' }} /> {t('unlock.solveCaptcha')}</>
                            ) : (
                                <><CheckCircle style={{ width: '24px', height: '24px' }} /> {t('unlock.unlockLink')}</>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderCurrentStep = () => {
        if (isLastStep) {
            return renderFinalURLStep();
        } else if (currentStepConfig.type === 'URL') {
            return renderURLStep();
        } else if (currentStepConfig.type === 'BANNER') {
            return renderBannerStep();
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link2 style={{ width: '24px', height: '24px', color: '#0ea5e9' }} />
                        <span style={{ fontWeight: 'bold', fontSize: isMobile ? '16px' : '18px' }}>AngoraLinks</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: isMobile ? '12px' : '14px', color: '#94a3b8' }}>
                        <Shield style={{ width: '16px', height: '16px' }} />
                        <span style={{ display: isMobile ? 'none' : 'inline' }}>{t('unlock.secureLink')}</span>
                    </div>
                </div>
            </header>

            <div style={{ backgroundColor: '#1e293b', height: '6px' }}>
                <div style={{ backgroundColor: '#0ea5e9', height: '100%', width: `${(step / TOTAL_STEPS) * 100}%`, transition: 'width 0.5s' }} />
            </div>

            <main style={styles.main}>
                <div style={styles.stepIndicator}>
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
                        <div key={s} style={styles.stepCircle(s === step, s < step)}>
                            {s < step ? <CheckCircle style={{ width: isMobile ? '16px' : '20px', height: isMobile ? '16px' : '20px' }} /> : s}
                        </div>
                    ))}
                </div>

                <div style={styles.infoCard}>
                    <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                        {linkData?.title || t('unlock.goToPage')}
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: isMobile ? '14px' : '16px' }}>
                        {getStepStatusText()}
                    </p>
                </div>

                {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
                        <p style={{ color: '#ef4444', fontSize: '14px' }}>{error}</p>
                    </div>
                )}

                {renderCurrentStep()}

                <p style={{ textAlign: 'center', fontSize: isMobile ? '12px' : '14px', color: '#64748b', marginTop: '24px' }}>
                    {t('unlock.adsHelpCreators')} ❤️
                </p>
            </main>

            {/* Pełnoekranowa nakładka popunder - pierwszy klik odpala reklamę */}
            {showPopunderOverlay && (
                <div
                    onClick={handleOverlayClick}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999,
                        cursor: 'pointer',
                        backgroundColor: 'transparent'
                    }}
                />
            )}
        </div>
    );
}

export default Unlock;