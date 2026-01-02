// Login.jsx - Z OBSŁUGĄ 2FA i WebAuthn
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, Mail, Lock, Loader2, Shield, Key, Smartphone, Fingerprint } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { 
    verifyTwoFactorLogin, 
    getWebAuthnLoginOptions, 
    isWebAuthnSupported 
} from '../api/twoFactor';
import { useTranslation } from '../i18n';

// ============================================
// HELPERY WebAuthn
// ============================================

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

function Login() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    
    // Stan 2FA
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [twoFactorSetupRequired, setTwoFactorSetupRequired] = useState(false);
    const [challengeToken, setChallengeToken] = useState(null);
    const [twoFactorMethods, setTwoFactorMethods] = useState([]);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('TOTP');
    const [verifying2FA, setVerifying2FA] = useState(false);
    
    // WebAuthn state
    const [webAuthnLoading, setWebAuthnLoading] = useState(false);
    const webAuthnInProgress = useRef(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/login', formData);
            
            if (response.data.requiresTwoFactor) {
                setTwoFactorRequired(true);
                setChallengeToken(response.data.challengeToken);
                setTwoFactorMethods(response.data.twoFactorMethods || ['TOTP']);
                
                const methods = response.data.twoFactorMethods || ['TOTP'];
                if (methods.includes('WEBAUTHN') && isWebAuthnSupported()) {
                    setSelectedMethod('WEBAUTHN');
                } else if (methods.includes('TOTP')) {
                    setSelectedMethod('TOTP');
                } else {
                    setSelectedMethod(methods[0]);
                }
                
                toast.success(t('login.twoFactor.enterCodeOrKey'));
                return;
            }
            
            if (response.data.requiresTwoFactorSetup) {
                setTwoFactorSetupRequired(true);
                setChallengeToken(response.data.setupToken);
                toast(t('login.twoFactor.adminRequires2FA'), { icon: '🔐' });
                return;
            }
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            toast.success(t('login.messages.success'));
            navigate('/dashboard');
            
        } catch (error) {
            toast.error(error.response?.data?.error || t('login.errors.loginFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        
        if (!twoFactorCode || twoFactorCode.length < 6) {
            toast.error(t('login.errors.enterValidCode'));
            return;
        }
        
        setVerifying2FA(true);
        
        try {
            const response = await verifyTwoFactorLogin(
                challengeToken, 
                twoFactorCode, 
                selectedMethod
            );
            
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            toast.success(t('login.messages.success'));
            navigate('/dashboard');
            
        } catch (error) {
            toast.error(error.response?.data?.error || t('login.errors.invalidCode'));
            setTwoFactorCode('');
        } finally {
            setVerifying2FA(false);
        }
    };

    const handleWebAuthnLogin = async () => {
        if (webAuthnInProgress.current || webAuthnLoading) {
            return;
        }

        if (!isWebAuthnSupported()) {
            toast.error(t('login.errors.webAuthnNotSupported'));
            return;
        }

        webAuthnInProgress.current = true;
        setWebAuthnLoading(true);

        try {
            const optionsResponse = await getWebAuthnLoginOptions(challengeToken);
            const options = optionsResponse.data;

            const publicKeyOptions = {
                ...options,
                challenge: base64URLToBuffer(options.challenge),
                allowCredentials: options.allowCredentials?.map(cred => ({
                    ...cred,
                    id: base64URLToBuffer(cred.id)
                })) || []
            };

            const credential = await navigator.credentials.get({
                publicKey: publicKeyOptions
            });

            const webauthnResponse = {
                id: credential.id,
                rawId: bufferToBase64URL(credential.rawId),
                type: credential.type,
                response: {
                    clientDataJSON: bufferToBase64URL(credential.response.clientDataJSON),
                    authenticatorData: bufferToBase64URL(credential.response.authenticatorData),
                    signature: bufferToBase64URL(credential.response.signature),
                    userHandle: credential.response.userHandle 
                        ? bufferToBase64URL(credential.response.userHandle) 
                        : null
                }
            };

            const verifyResponse = await api.post('/auth/2fa/verify', {
                challengeToken,
                response: webauthnResponse,
                method: 'WEBAUTHN'
            });

            if (verifyResponse.data.success) {
                localStorage.setItem('token', verifyResponse.data.token);
                localStorage.setItem('user', JSON.stringify(verifyResponse.data.user));
                toast.success(t('login.messages.success'));
                navigate('/dashboard');
            } else {
                throw new Error(verifyResponse.data.error || t('login.errors.verificationFailed'));
            }

        } catch (error) {
            if (error.name === 'NotAllowedError') {
                toast.error(t('login.errors.verificationCancelled'));
            } else if (error.name === 'SecurityError') {
                toast.error(t('login.errors.securityError'));
            } else if (error.name === 'InvalidStateError') {
                toast.error(t('login.errors.keyNotRegistered'));
            } else if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error(t('login.errors.keyVerificationFailed'));
            }
        } finally {
            setWebAuthnLoading(false);
            webAuthnInProgress.current = false;
        }
    };

    const handleBack = () => {
        setTwoFactorRequired(false);
        setTwoFactorSetupRequired(false);
        setChallengeToken(null);
        setTwoFactorCode('');
        setSelectedMethod('TOTP');
        setFormData({ email: '', password: '' });
        webAuthnInProgress.current = false;
    };

    const inputStyle = {
        width: '100%',
        backgroundColor: '#0f172a',
        border: '1px solid #475569',
        borderRadius: '8px',
        padding: '14px 14px 14px 44px',
        color: '#f8fafc',
        fontSize: '16px',
        boxSizing: 'border-box'
    };

    const codeInputStyle = {
        width: '100%',
        backgroundColor: '#0f172a',
        border: '1px solid #475569',
        borderRadius: '8px',
        padding: '16px',
        color: '#f8fafc',
        fontSize: '24px',
        textAlign: 'center',
        letterSpacing: '8px',
        fontFamily: 'monospace',
        boxSizing: 'border-box'
    };

    // ============================================
    // EKRAN WERYFIKACJI 2FA
    // ============================================
    if (twoFactorRequired) {
        const hasWebAuthn = twoFactorMethods.includes('WEBAUTHN') && isWebAuthnSupported();
        const hasTotp = twoFactorMethods.includes('TOTP');
        const hasBackupCode = true;

        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', padding: '16px' }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#f8fafc' }}>
                            <Link2 style={{ width: '40px', height: '40px', color: '#0ea5e9' }} />
                            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>AngoraLinks</span>
                        </Link>
                    </div>

                    {/* 2FA Card */}
                    <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: '32px 24px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <Shield style={{ width: '48px', height: '48px', color: '#0ea5e9', margin: '0 auto 16px' }} />
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{t('login.twoFactor.title')}</h1>
                            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                                {t('login.twoFactor.confirmIdentity')}
                            </p>
                        </div>

                        {/* PRZYCISK WEBAUTHN */}
                        {hasWebAuthn && selectedMethod === 'WEBAUTHN' && (
                            <div style={{ marginBottom: '24px' }}>
                                <button
                                    onClick={handleWebAuthnLogin}
                                    disabled={webAuthnLoading}
                                    style={{
                                        width: '100%',
                                        padding: '20px',
                                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                        border: '2px solid #22c55e',
                                        borderRadius: '12px',
                                        color: '#22c55e',
                                        cursor: webAuthnLoading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '12px',
                                        transition: 'all 0.2s ease',
                                        opacity: webAuthnLoading ? 0.7 : 1
                                    }}
                                >
                                    {webAuthnLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" style={{ width: '32px', height: '32px' }} />
                                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{t('login.twoFactor.waitingForKey')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Fingerprint style={{ width: '32px', height: '32px' }} />
                                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{t('login.twoFactor.useSecurityKey')}</span>
                                            <span style={{ fontSize: '13px', color: '#86efac' }}>
                                                {t('login.twoFactor.keyOptions')}
                                            </span>
                                        </>
                                    )}
                                </button>

                                {/* Separator */}
                                {(hasTotp || hasBackupCode) && (
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '16px', 
                                        margin: '24px 0',
                                        color: '#64748b'
                                    }}>
                                        <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }} />
                                        <span style={{ fontSize: '13px' }}>{t('login.twoFactor.orUseCode')}</span>
                                        <div style={{ flex: 1, height: '1px', backgroundColor: '#334155' }} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Wybór metody (tabs) */}
                        {(selectedMethod !== 'WEBAUTHN' || !hasWebAuthn) && (
                            <>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    {hasTotp && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedMethod('TOTP')}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '10px 16px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                backgroundColor: selectedMethod === 'TOTP' ? '#0ea5e9' : '#1e293b',
                                                color: selectedMethod === 'TOTP' ? '#ffffff' : '#94a3b8',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <Smartphone style={{ width: '16px', height: '16px' }} />
                                            {t('login.twoFactor.app')}
                                        </button>
                                    )}
                                    {hasWebAuthn && isWebAuthnSupported() && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedMethod('WEBAUTHN')}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '10px 16px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                cursor: 'pointer',
                                                backgroundColor: selectedMethod === 'WEBAUTHN' ? '#22c55e' : '#1e293b',
                                                color: selectedMethod === 'WEBAUTHN' ? '#ffffff' : '#94a3b8',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <Fingerprint style={{ width: '16px', height: '16px' }} />
                                            {t('login.twoFactor.key')}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedMethod('BACKUP_CODE')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            backgroundColor: selectedMethod === 'BACKUP_CODE' ? '#f59e0b' : '#1e293b',
                                            color: selectedMethod === 'BACKUP_CODE' ? '#ffffff' : '#94a3b8',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <Key style={{ width: '16px', height: '16px' }} />
                                        {t('login.twoFactor.backup')}
                                    </button>
                                </div>

                                {/* Formularz kodu */}
                                {(selectedMethod === 'TOTP' || selectedMethod === 'BACKUP_CODE') && (
                                    <form onSubmit={handleVerify2FA}>
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#cbd5e1', marginBottom: '8px', textAlign: 'center' }}>
                                                {selectedMethod === 'BACKUP_CODE' 
                                                    ? t('login.twoFactor.backupCode8Chars')
                                                    : t('login.twoFactor.appCode6Digits')
                                                }
                                            </label>
                                            <input 
                                                type="text" 
                                                value={twoFactorCode}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\s/g, '').toUpperCase();
                                                    const maxLen = selectedMethod === 'BACKUP_CODE' ? 8 : 6;
                                                    if (val.length <= maxLen) {
                                                        setTwoFactorCode(val);
                                                    }
                                                }}
                                                style={codeInputStyle}
                                                placeholder={selectedMethod === 'BACKUP_CODE' ? 'XXXXXXXX' : '000000'}
                                                maxLength={selectedMethod === 'BACKUP_CODE' ? 8 : 6}
                                                autoFocus
                                                autoComplete="one-time-code"
                                            />
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={verifying2FA}
                                            style={{
                                                width: '100%',
                                                backgroundColor: '#0ea5e9',
                                                color: '#ffffff',
                                                padding: '14px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                fontWeight: 'bold',
                                                fontSize: '16px',
                                                cursor: verifying2FA ? 'not-allowed' : 'pointer',
                                                opacity: verifying2FA ? 0.7 : 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                minHeight: '48px',
                                                marginBottom: '16px'
                                            }}
                                        >
                                            {verifying2FA ? (
                                                <><Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> {t('login.twoFactor.verifying')}</>
                                            ) : (
                                                <><Shield style={{ width: '20px', height: '20px' }} /> {t('login.twoFactor.verify')}</>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </>
                        )}

                        {/* Przycisk powrotu */}
                        <button 
                            type="button"
                            onClick={handleBack}
                            style={{
                                width: '100%',
                                backgroundColor: 'transparent',
                                color: '#94a3b8',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #334155',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {t('login.twoFactor.backToLogin')}
                        </button>

                        {/* Linki pomocnicze */}
                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            {selectedMethod === 'WEBAUTHN' && hasTotp && (
                                <p style={{ color: '#64748b', fontSize: '13px' }}>
                                    {t('login.twoFactor.keyProblem')}{' '}
                                    <button 
                                        type="button"
                                        onClick={() => setSelectedMethod('TOTP')}
                                        style={{ color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        {t('login.twoFactor.useAppCode')}
                                    </button>
                                </p>
                            )}
                            {selectedMethod !== 'BACKUP_CODE' && (
                                <p style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>
                                    {t('login.twoFactor.noDeviceAccess')}{' '}
                                    <button 
                                        type="button"
                                        onClick={() => setSelectedMethod('BACKUP_CODE')}
                                        style={{ color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        {t('login.twoFactor.useBackupCode')}
                                    </button>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================
    // EKRAN WYMUSZONEJ KONFIGURACJI 2FA
    // ============================================
    if (twoFactorSetupRequired) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', padding: '16px' }}>
                <div style={{ width: '100%', maxWidth: '500px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#f8fafc' }}>
                            <Link2 style={{ width: '40px', height: '40px', color: '#0ea5e9' }} />
                            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>AngoraLinks</span>
                        </Link>
                    </div>

                    <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: '32px 24px' }}>
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
                                <Shield style={{ width: '32px', height: '32px', color: '#f59e0b' }} />
                            </div>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{t('login.setup2FA.title')}</h1>
                            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                                {t('login.setup2FA.description')}
                            </p>
                        </div>

                        <div style={{ 
                            backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '24px'
                        }}>
                            <p style={{ color: '#fbbf24', fontSize: '14px', margin: 0, textAlign: 'center' }}>
                                ⚠️ {t('login.setup2FA.warning')}
                            </p>
                        </div>

                        <button 
                            onClick={() => navigate('/profile?setup2fa=true&token=' + challengeToken)}
                            style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#ffffff',
                                padding: '14px',
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                minHeight: '48px',
                                marginBottom: '16px'
                            }}
                        >
                            <Shield style={{ width: '20px', height: '20px' }} />
                            {t('login.setup2FA.configureNow')}
                        </button>

                        <button 
                            type="button"
                            onClick={handleBack}
                            style={{
                                width: '100%',
                                backgroundColor: 'transparent',
                                color: '#94a3b8',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #334155',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {t('login.setup2FA.cancelAndLogout')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================
    // NORMALNY FORMULARZ LOGOWANIA
    // ============================================
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', padding: '16px' }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#f8fafc' }}>
                        <Link2 style={{ width: '40px', height: '40px', color: '#0ea5e9' }} />
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>AngoraLinks</span>
                    </Link>
                </div>

                {/* Form Card */}
                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: '32px 24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>{t('login.title')}</h1>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#cbd5e1', marginBottom: '8px' }}>{t('login.email')}</label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#64748b' }} />
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    style={inputStyle} 
                                    placeholder={t('login.emailPlaceholder')}
                                    autoComplete="email"
                                    required 
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#cbd5e1', marginBottom: '8px' }}>{t('login.password')}</label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#64748b' }} />
                                <input 
                                    type="password" 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    style={inputStyle} 
                                    placeholder="••••••••" 
                                    autoComplete="current-password"
                                    required 
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} style={{
                            width: '100%',
                            backgroundColor: '#0ea5e9',
                            color: '#ffffff',
                            padding: '14px',
                            borderRadius: '8px',
                            border: 'none',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            minHeight: '48px'
                        }}>
                            {loading ? (<><Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> {t('login.loggingIn')}</>) : t('login.submit')}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '24px' }}>
                        {t('login.noAccount')} <Link to="/register" style={{ color: '#0ea5e9', textDecoration: 'none' }}>{t('login.register')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;