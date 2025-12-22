import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Link2, Clock, CheckCircle, ExternalLink, Loader2, AlertCircle, Shield, MousePointer } from 'lucide-react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import AdBanner from '../components/AdBanner';

function Unlock() {
    const { shortCode } = useParams();
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
    
    // Captcha
    const [captchaToken, setCaptchaToken] = useState(null);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const captchaRef = useRef(null);

    // Twój Site Key z hCaptcha (zamień na swój!)
    const HCAPTCHA_SITE_KEY = 'c6486bc4-4a2e-4c3c-b8e6-720cf3dc324e';

    const DIRECT_LINK = 'https://www.effectivegatecpm.com/ywkxbw41h?key=d1f50bdb00b57c1ece2c8c53b6332d4d';

    useEffect(() => {
        const fetchLink = async () => {
            try {
                const response = await fetch(`https://angoralinks-backend-production.up.railway.app/l/${shortCode}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Link nie istnieje');
                setLinkData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchLink();
    }, [shortCode]);

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
    };

    const handleAdClick = () => {
        if (!adClicked) {
            setAdClicked(true);
            if (step === 3) {
                setTimerStarted(true);
            }
        }
    };

    const handleNextStep = () => {
        if (!adClicked) return;
        if (step === 1) {
            setStep(2);
            setAdClicked(false);
        } else if (step === 2) {
            setStep(3);
            setAdClicked(false);
        }
    };

    const handleCaptchaVerify = (token) => {
        setCaptchaToken(token);
    };

    const handleUnlock = async () => {
        if (!timerDone) return;
        
        // Sprawdź captcha (jeśli wymagana)
        if (showCaptcha && !captchaToken) {
            setError('Najpierw rozwiąż captcha');
            return;
        }

        setUnlocking(true);
        setError(null);

        try {
            const response = await fetch(`https://angoralinks-backend-production.up.railway.app/l/${shortCode}/unlock`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Captcha-Token': captchaToken || ''
                },
                body: JSON.stringify({ captchaToken })
            });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Błąd odblokowania');
            }
            
            setTargetUrl(data.url);
            setTimeout(() => { window.location.href = data.url; }, 1500);
        } catch (err) {
            setError(err.message);
            // Reset captcha przy błędzie
            if (captchaRef.current) {
                captchaRef.current.resetCaptcha();
            }
            setCaptchaToken(null);
        } finally {
            setUnlocking(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
                <Loader2 className="animate-spin" style={{ width: '32px', height: '32px', color: '#0ea5e9' }} />
            </div>
        );
    }

    if (error && !linkData) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', padding: '16px' }}>
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
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', padding: '16px' }}>
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

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc' }}>
            {/* Header */}
            <header style={{ borderBottom: '1px solid #1e293b', backgroundColor: 'rgba(15, 23, 42, 0.8)', padding: '16px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link2 style={{ width: '24px', height: '24px', color: '#0ea5e9' }} />
                        <span style={{ fontWeight: 'bold' }}>AngoraLinks</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#94a3b8' }}>
                        <Shield style={{ width: '16px', height: '16px' }} />
                        Bezpieczny link
                    </div>
                </div>
            </header>

            {/* Progress bar */}
            <div style={{ backgroundColor: '#1e293b', height: '8px' }}>
                <div style={{ backgroundColor: '#0ea5e9', height: '100%', width: `${(step / 3) * 100}%`, transition: 'width 0.5s' }} />
            </div>

            {/* Main */}
            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
                {/* Kroki */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
                    {[1, 2, 3].map((s) => (
                        <div 
                            key={s}
                            style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontWeight: 'bold',
                                backgroundColor: s < step ? '#22c55e' : s === step ? '#0ea5e9' : '#334155',
                                color: s <= step ? '#ffffff' : '#94a3b8'
                            }}
                        >
                            {s < step ? <CheckCircle style={{ width: '20px', height: '20px' }} /> : s}
                        </div>
                    ))}
                </div>

                {/* Link info */}
                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: '24px', marginBottom: '32px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{linkData?.title || 'Przejdź do strony'}</h1>
                    <p style={{ color: '#94a3b8' }}>
                        {step === 1 && (adClicked ? '✓ Kliknij przycisk aby przejść dalej' : 'Krok 1 z 3 - Kliknij przycisk aby otworzyć reklamę')}
                        {step === 2 && (adClicked ? '✓ Kliknij przycisk aby przejść dalej' : 'Krok 2 z 3 - Kliknij w reklamę')}
                        {step === 3 && (!adClicked ? 'Krok 3 z 3 - Kliknij w reklamę aby rozpocząć timer' : timerDone ? '✓ Rozwiąż captcha i odblokuj link' : `Oglądaj reklamę - ${timer} sekund`)}
                    </p>
                </div>

                {/* Błąd */}
                {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'center' }}>
                        <p style={{ color: '#ef4444' }}>{error}</p>
                    </div>
                )}

                {/* KROK 1 */}
                {step === 1 && (
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ 
                            backgroundColor: adClicked ? 'rgba(34, 197, 94, 0.1)' : 'rgba(30, 41, 59, 0.3)',
                            border: adClicked ? '2px solid #22c55e' : '2px solid #eab308',
                            borderRadius: '16px', 
                            padding: '32px', 
                            marginBottom: '16px', 
                            textAlign: 'center' 
                        }}>
                            {!adClicked ? (
                                <>
                                    <ExternalLink style={{ width: '64px', height: '64px', color: '#eab308', margin: '0 auto 16px' }} />
                                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#eab308', marginBottom: '16px' }}>
                                        Kliknij przycisk poniżej aby otworzyć reklamę
                                    </p>
                                    <button
                                        onClick={handleDirectLinkClick}
                                        style={{ backgroundColor: '#eab308', color: '#000000', padding: '16px 32px', borderRadius: '12px', fontWeight: 'bold', fontSize: '18px', border: 'none', cursor: 'pointer' }}
                                    >
                                        🔗 Otwórz reklamę w nowej karcie
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
                            <button
                                onClick={handleNextStep}
                                disabled={!adClicked}
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '12px', 
                                    padding: '16px 32px', 
                                    borderRadius: '12px', 
                                    fontWeight: 'bold', 
                                    fontSize: '18px', 
                                    border: 'none',
                                    backgroundColor: adClicked ? '#0ea5e9' : '#334155',
                                    color: adClicked ? '#ffffff' : '#94a3b8',
                                    cursor: adClicked ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {adClicked ? (<>Kontynuuj do kroku 2 <CheckCircle style={{ width: '24px', height: '24px' }} /></>) : (<><MousePointer style={{ width: '24px', height: '24px' }} /> Najpierw otwórz reklamę</>)}
                            </button>
                        </div>
                    </div>
                )}

                {/* KROK 2 */}
                {step === 2 && (
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ 
                            backgroundColor: adClicked ? 'rgba(34, 197, 94, 0.1)' : 'rgba(30, 41, 59, 0.3)',
                            border: adClicked ? '2px solid #22c55e' : '2px solid #eab308',
                            borderRadius: '16px', 
                            padding: '24px', 
                            marginBottom: '16px',
                            cursor: 'pointer'
                        }}>
                            {!adClicked && (
                                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                    <p style={{ fontWeight: 'bold', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <MousePointer style={{ width: '20px', height: '20px' }} />
                                        Kliknij w reklamę aby kontynuować
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
                            <AdBanner step={2} onAdClick={handleAdClick} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <button
                                onClick={handleNextStep}
                                disabled={!adClicked}
                                style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '12px', 
                                    padding: '16px 32px', 
                                    borderRadius: '12px', 
                                    fontWeight: 'bold', 
                                    fontSize: '18px', 
                                    border: 'none',
                                    backgroundColor: adClicked ? '#0ea5e9' : '#334155',
                                    color: adClicked ? '#ffffff' : '#94a3b8',
                                    cursor: adClicked ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {adClicked ? (<>Kontynuuj do kroku 3 <CheckCircle style={{ width: '24px', height: '24px' }} /></>) : (<><MousePointer style={{ width: '24px', height: '24px' }} /> Najpierw kliknij reklamę</>)}
                            </button>
                        </div>
                    </div>
                )}

                {/* KROK 3 */}
                {step === 3 && (
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ 
                            backgroundColor: adClicked ? 'rgba(34, 197, 94, 0.1)' : 'rgba(30, 41, 59, 0.3)',
                            border: adClicked ? '2px solid #22c55e' : '2px solid #eab308',
                            borderRadius: '16px', 
                            padding: '24px', 
                            marginBottom: '24px',
                            cursor: 'pointer'
                        }}>
                            {!adClicked && (
                                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                    <p style={{ fontWeight: 'bold', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <MousePointer style={{ width: '20px', height: '20px' }} />
                                        Kliknij w reklamę aby rozpocząć timer
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
                                        Gotowe! Rozwiąż captcha poniżej.
                                    </p>
                                </div>
                            )}
                            <AdBanner step={3} onAdClick={handleAdClick} />
                        </div>

                        {/* Timer / Captcha / Unlock */}
                        <div style={{ textAlign: 'center' }}>
                            {!adClicked ? (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px 32px' }}>
                                    <MousePointer style={{ width: '24px', height: '24px', color: '#eab308' }} />
                                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#94a3b8' }}>Kliknij reklamę aby rozpocząć</span>
                                </div>
                            ) : !timerDone ? (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px 32px' }}>
                                    <Clock style={{ width: '24px', height: '24px', color: '#0ea5e9' }} />
                                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Poczekaj <span style={{ color: '#0ea5e9', fontSize: '28px' }}>{timer}</span> sekund</span>
                                </div>
                            ) : (
                                <div>
                                    {/* Captcha */}
                                    {showCaptcha && (
                                        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
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
                                        style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '12px', 
                                            backgroundColor: (showCaptcha && !captchaToken) ? '#334155' : '#22c55e', 
                                            color: '#ffffff', 
                                            padding: '16px 32px', 
                                            borderRadius: '12px', 
                                            fontWeight: 'bold', 
                                            fontSize: '18px', 
                                            border: 'none', 
                                            cursor: (unlocking || (showCaptcha && !captchaToken)) ? 'not-allowed' : 'pointer',
                                            opacity: unlocking ? 0.7 : 1
                                        }}
                                    >
                                        {unlocking ? (
                                            <><Loader2 className="animate-spin" style={{ width: '24px', height: '24px' }} /> Odblokowywanie...</>
                                        ) : (showCaptcha && !captchaToken) ? (
                                            <><Shield style={{ width: '24px', height: '24px' }} /> Najpierw rozwiąż captcha</>
                                        ) : (
                                            <><CheckCircle style={{ width: '24px', height: '24px' }} /> Odblokuj link</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '32px' }}>
                    Reklamy pomagają twórcom zarabiać. Dziękujemy za wsparcie!
                </p>
            </main>
        </div>
    );
}

export default Unlock;