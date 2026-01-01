// src/components/TwoFactorSetup.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    Shield, Smartphone, Key, Fingerprint, Loader2, CheckCircle, 
    AlertCircle, Copy, ArrowLeft, ArrowRight, X, RefreshCw,
    QrCode, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
    getTwoFactorStatus,
    initTotpSetup, 
    verifyAndEnableTotp,
    getWebAuthnRegisterOptions,
    verifyWebAuthnRegistration,
    regenerateBackupCodes
} from '../api/twoFactor';

// Sprawdź czy WebAuthn jest dostępne
const isWebAuthnSupported = () => {
    return window.PublicKeyCredential !== undefined;
};

function TwoFactorSetup({ 
    isModal = false, 
    onClose = null, 
    onComplete = null,
    forceSetup = false,  // Wymuszone przez admina
    setupToken = null    // Token z logowania
}) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Stan
    const [step, setStep] = useState('choose'); // choose, totp, webauthn, backup, complete
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    
    // TOTP
    const [totpData, setTotpData] = useState(null);
    const [totpCode, setTotpCode] = useState('');
    const [showSecret, setShowSecret] = useState(false);
    
    // WebAuthn
    const [deviceName, setDeviceName] = useState('');
    const [webAuthnSupported, setWebAuthnSupported] = useState(false);
    
    // Backup codes
    const [backupCodes, setBackupCodes] = useState([]);
    const [codesCopied, setCodesCopied] = useState(false);
    
    // Sprawdź wsparcie WebAuthn
    useEffect(() => {
        setWebAuthnSupported(isWebAuthnSupported());
    }, []);

    // Pobierz status 2FA
    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await getTwoFactorStatus();
            setStatus(response.data);
        } catch (error) {
            console.error('Error fetching 2FA status:', error);
        }
    };

    // ========================================
    // TOTP Setup
    // ========================================
    
    const handleStartTotp = async () => {
        setLoading(true);
        try {
            const response = await initTotpSetup();
            setTotpData(response.data);
            setStep('totp');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd inicjalizacji TOTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyTotp = async (e) => {
        e.preventDefault();
        
        if (!totpCode || totpCode.length !== 6) {
            toast.error('Wprowadź 6-cyfrowy kod');
            return;
        }
        
        setLoading(true);
        try {
            const response = await verifyAndEnableTotp(totpData.secret, totpCode);
            toast.success('TOTP zostało włączone!');
            
            // Zapisz kody zapasowe jeśli zostały wygenerowane
            if (response.data?.backupCodes) {
                setBackupCodes(response.data.backupCodes);
                setStep('backup');
            } else {
                handleComplete();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Nieprawidłowy kod');
            setTotpCode('');
        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // WebAuthn Setup
    // ========================================
    
    const handleStartWebAuthn = async () => {
        if (!webAuthnSupported) {
            toast.error('Twoja przeglądarka nie obsługuje kluczy bezpieczeństwa');
            return;
        }
        
        setStep('webauthn');
    };

    const handleRegisterWebAuthn = async () => {
        setLoading(true);
        try {
            // Pobierz opcje rejestracji
            const optionsResponse = await getWebAuthnRegisterOptions();
            const options = optionsResponse.data;

            // Konwertuj dane z base64
            options.challenge = base64URLToBuffer(options.challenge);
            options.user.id = base64URLToBuffer(options.user.id);
            
            if (options.excludeCredentials) {
                options.excludeCredentials = options.excludeCredentials.map(cred => ({
                    ...cred,
                    id: base64URLToBuffer(cred.id)
                }));
            }

            // Wywołaj WebAuthn API
            const credential = await navigator.credentials.create({
                publicKey: options
            });

            // Przygotuj odpowiedź
            const response = {
                id: credential.id,
                rawId: bufferToBase64URL(credential.rawId),
                type: credential.type,
                response: {
                    clientDataJSON: bufferToBase64URL(credential.response.clientDataJSON),
                    attestationObject: bufferToBase64URL(credential.response.attestationObject),
                    transports: credential.response.getTransports?.() || []
                }
            };

            // Zweryfikuj na serwerze
            const verifyResponse = await verifyWebAuthnRegistration(response, deviceName || undefined);
            toast.success('Klucz bezpieczeństwa został zarejestrowany!');
            
            // Zapisz kody zapasowe jeśli zostały wygenerowane
            if (verifyResponse.data?.backupCodes) {
                setBackupCodes(verifyResponse.data.backupCodes);
                setStep('backup');
            } else {
                handleComplete();
            }
            
        } catch (error) {
            console.error('WebAuthn registration error:', error);
            
            if (error.name === 'NotAllowedError') {
                toast.error('Rejestracja została anulowana');
            } else if (error.name === 'SecurityError') {
                toast.error('Błąd bezpieczeństwa - sprawdź czy strona używa HTTPS');
            } else {
                toast.error(error.response?.data?.error || 'Błąd rejestracji klucza');
            }
        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // Completion
    // ========================================
    
    const handleComplete = () => {
        setStep('complete');
        
        if (onComplete) {
            setTimeout(() => {
                onComplete();
            }, 2000);
        }
    };

    const handleFinish = () => {
        if (onClose) {
            onClose();
        } else {
            navigate('/dashboard');
        }
    };

    const handleCopyBackupCodes = () => {
        const codesText = backupCodes.join('\n');
        navigator.clipboard.writeText(codesText);
        setCodesCopied(true);
        toast.success('Kody skopiowane do schowka');
    };

    // ========================================
    // Helpers
    // ========================================
    
    const base64URLToBuffer = (base64URL) => {
        const padding = '='.repeat((4 - base64URL.length % 4) % 4);
        const base64 = (base64URL + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray.buffer;
    };

    const bufferToBase64URL = (buffer) => {
        const bytes = new Uint8Array(buffer);
        let str = '';
        for (const byte of bytes) {
            str += String.fromCharCode(byte);
        }
        const base64 = window.btoa(str);
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    };

    // ========================================
    // Styles
    // ========================================
    
    const containerStyle = {
        minHeight: isModal ? 'auto' : '100vh',
        backgroundColor: isModal ? 'transparent' : '#0f172a',
        color: '#f8fafc',
        padding: isModal ? '0' : '24px'
    };

    const cardStyle = {
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        margin: isModal ? '0' : '0 auto'
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#f8fafc',
        fontSize: '16px',
        boxSizing: 'border-box'
    };

    const buttonPrimary = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: '14px 24px',
        backgroundColor: '#0ea5e9',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '16px',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        minHeight: '48px'
    };

    const buttonSecondary = {
        ...buttonPrimary,
        backgroundColor: '#334155'
    };

    const methodCard = (selected = false) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        backgroundColor: selected ? 'rgba(14, 165, 233, 0.1)' : '#0f172a',
        border: `2px solid ${selected ? '#0ea5e9' : '#334155'}`,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        width: '100%',
        textAlign: 'left'
    });

    // ========================================
    // Render Steps
    // ========================================

    // Step: Choose method
    if (step === 'choose') {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ 
                            width: '64px', 
                            height: '64px', 
                            borderRadius: '50%', 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <Shield style={{ width: '32px', height: '32px', color: '#ffffff' }} />
                        </div>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                            {forceSetup ? 'Skonfiguruj 2FA' : 'Włącz 2FA'}
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                            Wybierz metodę uwierzytelniania dwuskładnikowego
                        </p>
                    </div>

                    {/* Forced setup warning */}
                    {forceSetup && (
                        <div style={{ 
                            backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                            border: '1px solid #f59e0b',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '24px'
                        }}>
                            <p style={{ color: '#fbbf24', fontSize: '14px', margin: 0, textAlign: 'center' }}>
                                ⚠️ Administrator wymaga włączenia 2FA na Twoim koncie
                            </p>
                        </div>
                    )}

                    {/* Methods */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                        {/* TOTP */}
                        <button 
                            onClick={handleStartTotp}
                            disabled={loading}
                            style={methodCard()}
                        >
                            <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                borderRadius: '12px', 
                                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Smartphone style={{ width: '24px', height: '24px', color: '#a855f7' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px', color: '#f8fafc' }}>
                                    Aplikacja Authenticator
                                </h3>
                                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                                    Google Authenticator, Authy, Microsoft Authenticator
                                </p>
                            </div>
                            <ArrowRight style={{ width: '20px', height: '20px', color: '#64748b', flexShrink: 0 }} />
                        </button>

                        {/* WebAuthn */}
                        <button 
                            onClick={handleStartWebAuthn}
                            disabled={loading || !webAuthnSupported}
                            style={{
                                ...methodCard(),
                                opacity: webAuthnSupported ? 1 : 0.5,
                                cursor: webAuthnSupported ? 'pointer' : 'not-allowed'
                            }}
                        >
                            <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                borderRadius: '12px', 
                                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Fingerprint style={{ width: '24px', height: '24px', color: '#22c55e' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px', color: '#f8fafc' }}>
                                    Klucz bezpieczeństwa / Biometria
                                </h3>
                                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                                    {webAuthnSupported 
                                        ? 'YubiKey, Face ID, Touch ID, Windows Hello'
                                        : 'Nieobsługiwane w tej przeglądarce'
                                    }
                                </p>
                            </div>
                            <ArrowRight style={{ width: '20px', height: '20px', color: '#64748b', flexShrink: 0 }} />
                        </button>
                    </div>

                    {/* Cancel button */}
                    {!forceSetup && (
                        <button 
                            onClick={onClose || (() => navigate(-1))}
                            style={buttonSecondary}
                        >
                            Anuluj
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Step: TOTP Setup
    if (step === 'totp' && totpData) {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                        <button 
                            onClick={() => { setStep('choose'); setTotpData(null); setTotpCode(''); }}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px', marginRight: '8px' }}
                        >
                            <ArrowLeft style={{ width: '24px', height: '24px' }} />
                        </button>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Konfiguracja Authenticator</h2>
                    </div>

                    {/* Steps */}
                    <div style={{ marginBottom: '24px' }}>
                        {/* Step 1: QR Code */}
                        <div style={{ marginBottom: '24px' }}>
                            <p style={{ color: '#94a3b8', marginBottom: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ 
                                    width: '24px', 
                                    height: '24px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#0ea5e9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>1</span>
                                Zeskanuj kod QR w aplikacji:
                            </p>
                            
                            <div style={{ 
                                backgroundColor: 'white', 
                                padding: '20px', 
                                borderRadius: '12px', 
                                display: 'flex', 
                                justifyContent: 'center',
                                marginBottom: '16px'
                            }}>
                                <img src={totpData.qrCode} alt="QR Code" style={{ maxWidth: '180px' }} />
                            </div>
                            
                            {/* Manual entry */}
                            <div style={{ textAlign: 'center' }}>
                                <button
                                    onClick={() => setShowSecret(!showSecret)}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: '#0ea5e9', 
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    {showSecret ? 'Ukryj klucz' : 'Nie możesz zeskanować? Wprowadź ręcznie'}
                                </button>
                                
                                {showSecret && (
                                    <div style={{ 
                                        backgroundColor: '#0f172a', 
                                        padding: '12px', 
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '8px',
                                        marginTop: '12px'
                                    }}>
                                        <code style={{ color: '#0ea5e9', fontSize: '11px', wordBreak: 'break-all', flex: 1 }}>
                                            {totpData.secret}
                                        </code>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(totpData.secret);
                                                toast.success('Skopiowano!');
                                            }}
                                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                                        >
                                            <Copy style={{ width: '16px', height: '16px' }} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 2: Enter code */}
                        <form onSubmit={handleVerifyTotp}>
                            <p style={{ color: '#94a3b8', marginBottom: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ 
                                    width: '24px', 
                                    height: '24px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#0ea5e9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>2</span>
                                Wprowadź kod z aplikacji:
                            </p>
                            
                            <input
                                type="text"
                                value={totpCode}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 6) setTotpCode(val);
                                }}
                                style={{
                                    ...inputStyle,
                                    textAlign: 'center',
                                    fontSize: '28px',
                                    letterSpacing: '12px',
                                    fontFamily: 'monospace',
                                    padding: '16px'
                                }}
                                placeholder="000000"
                                maxLength={6}
                                autoFocus
                                autoComplete="one-time-code"
                            />

                            <button
                                type="submit"
                                disabled={loading || totpCode.length !== 6}
                                style={{
                                    ...buttonPrimary,
                                    marginTop: '24px',
                                    opacity: loading || totpCode.length !== 6 ? 0.7 : 1
                                }}
                            >
                                {loading ? (
                                    <><Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> Weryfikacja...</>
                                ) : (
                                    <><CheckCircle style={{ width: '20px', height: '20px' }} /> Zweryfikuj i włącz</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Step: WebAuthn Setup
    if (step === 'webauthn') {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                        <button 
                            onClick={() => { setStep('choose'); setDeviceName(''); }}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px', marginRight: '8px' }}
                        >
                            <ArrowLeft style={{ width: '24px', height: '24px' }} />
                        </button>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Rejestracja klucza</h2>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%', 
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <Fingerprint style={{ width: '40px', height: '40px', color: '#22c55e' }} />
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                            Przygotuj klucz bezpieczeństwa lub użyj biometrii urządzenia
                        </p>
                    </div>

                    {/* Device name (optional) */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                            Nazwa urządzenia (opcjonalne)
                        </label>
                        <input
                            type="text"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            style={inputStyle}
                            placeholder="np. YubiKey 5, MacBook Pro, iPhone"
                            maxLength={100}
                        />
                    </div>

                    {/* Instructions */}
                    <div style={{ 
                        backgroundColor: '#0f172a', 
                        borderRadius: '12px', 
                        padding: '16px',
                        marginBottom: '24px'
                    }}>
                        <p style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>
                            Po kliknięciu "Zarejestruj":
                        </p>
                        <ul style={{ color: '#94a3b8', fontSize: '13px', margin: 0, paddingLeft: '20px' }}>
                            <li style={{ marginBottom: '8px' }}>Włóż klucz USB lub dotknij czytnika NFC</li>
                            <li style={{ marginBottom: '8px' }}>Lub użyj Face ID / Touch ID / Windows Hello</li>
                            <li>Postępuj zgodnie z instrukcjami przeglądarki</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleRegisterWebAuthn}
                        disabled={loading}
                        style={buttonPrimary}
                    >
                        {loading ? (
                            <><Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> Oczekiwanie na klucz...</>
                        ) : (
                            <><Key style={{ width: '20px', height: '20px' }} /> Zarejestruj klucz</>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // Step: Backup Codes
    if (step === 'backup' && backupCodes.length > 0) {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{ 
                            width: '64px', 
                            height: '64px', 
                            borderRadius: '50%', 
                            backgroundColor: 'rgba(245, 158, 11, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <Key style={{ width: '32px', height: '32px', color: '#f59e0b' }} />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Kody zapasowe</h2>
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                            Zapisz te kody w bezpiecznym miejscu
                        </p>
                    </div>

                    {/* Warning */}
                    <div style={{ 
                        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                        border: '1px solid #ef4444',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px'
                    }}>
                        <p style={{ color: '#fca5a5', fontSize: '14px', margin: 0, textAlign: 'center' }}>
                            ⚠️ <strong>Ważne!</strong> Te kody nie będą pokazane ponownie.
                            <br />Każdy kod może być użyty tylko raz.
                        </p>
                    </div>

                    {/* Codes grid */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: '8px',
                        marginBottom: '24px'
                    }}>
                        {backupCodes.map((code, index) => (
                            <div key={index} style={{
                                backgroundColor: '#0f172a',
                                padding: '12px',
                                borderRadius: '8px',
                                textAlign: 'center',
                                fontFamily: 'monospace',
                                fontSize: '14px',
                                color: '#0ea5e9',
                                border: '1px solid #334155'
                            }}>
                                <span style={{ color: '#64748b', fontSize: '12px' }}>{index + 1}.</span> {code}
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <button
                            onClick={handleCopyBackupCodes}
                            style={{
                                ...buttonSecondary,
                                flex: 1
                            }}
                        >
                            {codesCopied ? (
                                <><CheckCircle style={{ width: '18px', height: '18px' }} /> Skopiowano!</>
                            ) : (
                                <><Copy style={{ width: '18px', height: '18px' }} /> Kopiuj kody</>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                const codesText = backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n');
                                const blob = new Blob([`AngoraLinks - Kody zapasowe 2FA\n\n${codesText}\n\nKażdy kod może być użyty tylko raz.`], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'angoralinks-backup-codes.txt';
                                a.click();
                                URL.revokeObjectURL(url);
                                toast.success('Plik pobrany');
                            }}
                            style={{
                                ...buttonSecondary,
                                flex: 1
                            }}
                        >
                            <RefreshCw style={{ width: '18px', height: '18px' }} /> Pobierz plik
                        </button>
                    </div>

                    <button
                        onClick={handleComplete}
                        disabled={!codesCopied}
                        style={{
                            ...buttonPrimary,
                            opacity: codesCopied ? 1 : 0.5,
                            cursor: codesCopied ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {codesCopied ? 'Zapisałem kody - kontynuuj' : 'Najpierw skopiuj kody'}
                    </button>
                </div>
            </div>
        );
    }

    // Step: Complete
    if (step === 'complete') {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%', 
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px'
                        }}>
                            <CheckCircle style={{ width: '40px', height: '40px', color: '#22c55e' }} />
                        </div>
                        
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#22c55e' }}>
                            2FA włączone!
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>
                            Twoje konto jest teraz lepiej chronione
                        </p>

                        <button
                            onClick={handleFinish}
                            style={buttonPrimary}
                        >
                            Przejdź do panelu
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <Loader2 className="animate-spin" style={{ width: '32px', height: '32px', color: '#0ea5e9' }} />
            </div>
        </div>
    );
}

export default TwoFactorSetup;