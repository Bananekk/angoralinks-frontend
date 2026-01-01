// Login.jsx - Z OBSŁUGĄ 2FA
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, Mail, Lock, Loader2, Shield, Key, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { verifyTwoFactorLogin } from '../api/twoFactor';

function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    
    // 🆕 Stan 2FA
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [twoFactorSetupRequired, setTwoFactorSetupRequired] = useState(false);
    const [challengeToken, setChallengeToken] = useState(null);
    const [twoFactorMethods, setTwoFactorMethods] = useState([]);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('TOTP');
    const [verifying2FA, setVerifying2FA] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/login', formData);
            
            // 🆕 Sprawdź czy wymagane 2FA
            if (response.data.requiresTwoFactor) {
                setTwoFactorRequired(true);
                setChallengeToken(response.data.challengeToken);
                setTwoFactorMethods(response.data.twoFactorMethods || ['TOTP']);
                setSelectedMethod(response.data.twoFactorMethods?.[0] || 'TOTP');
                toast.success('Wprowadź kod 2FA');
                return;
            }
            
            // 🆕 Sprawdź czy wymagana konfiguracja 2FA
            if (response.data.requiresTwoFactorSetup) {
                setTwoFactorSetupRequired(true);
                setChallengeToken(response.data.setupToken);
                toast('Administrator wymaga włączenia 2FA', { icon: '🔐' });
                return;
            }
            
            // Normalne logowanie
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            toast.success('Zalogowano pomyślnie!');
            navigate('/dashboard');
            
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd logowania');
        } finally {
            setLoading(false);
        }
    };

    // 🆕 Weryfikacja kodu 2FA
    const handleVerify2FA = async (e) => {
        e.preventDefault();
        
        if (!twoFactorCode || twoFactorCode.length < 6) {
            toast.error('Wprowadź poprawny kod');
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
            toast.success('Zalogowano pomyślnie!');
            navigate('/dashboard');
            
        } catch (error) {
            toast.error(error.response?.data?.error || 'Nieprawidłowy kod');
            setTwoFactorCode('');
        } finally {
            setVerifying2FA(false);
        }
    };

    // 🆕 Powrót do logowania
    const handleBack = () => {
        setTwoFactorRequired(false);
        setTwoFactorSetupRequired(false);
        setChallengeToken(null);
        setTwoFactorCode('');
        setFormData({ email: '', password: '' });
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

    // 🆕 Ekran weryfikacji 2FA
    if (twoFactorRequired) {
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

                    {/* 2FA Card */}
                    <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: '32px 24px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <Shield style={{ width: '48px', height: '48px', color: '#0ea5e9', margin: '0 auto 16px' }} />
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Weryfikacja 2FA</h1>
                            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                                Wprowadź kod z aplikacji authenticator
                            </p>
                        </div>

                        {/* Wybór metody jeśli wiele dostępnych */}
                        {twoFactorMethods.length > 1 && (
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
                                {twoFactorMethods.includes('TOTP') && (
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
                                            color: selectedMethod === 'TOTP' ? '#ffffff' : '#94a3b8'
                                        }}
                                    >
                                        <Smartphone style={{ width: '16px', height: '16px' }} />
                                        Aplikacja
                                    </button>
                                )}
                                {twoFactorMethods.includes('BACKUP_CODE') && (
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
                                            backgroundColor: selectedMethod === 'BACKUP_CODE' ? '#0ea5e9' : '#1e293b',
                                            color: selectedMethod === 'BACKUP_CODE' ? '#ffffff' : '#94a3b8'
                                        }}
                                    >
                                        <Key style={{ width: '16px', height: '16px' }} />
                                        Kod zapasowy
                                    </button>
                                )}
                            </div>
                        )}
                        
                        <form onSubmit={handleVerify2FA}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#cbd5e1', marginBottom: '8px', textAlign: 'center' }}>
                                    {selectedMethod === 'BACKUP_CODE' ? 'Kod zapasowy (8 znaków)' : 'Kod weryfikacyjny (6 cyfr)'}
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
                                    <><Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> Weryfikacja...</>
                                ) : (
                                    <><Shield style={{ width: '20px', height: '20px' }} /> Zweryfikuj</>
                                )}
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
                                Wróć do logowania
                            </button>
                        </form>

                        {/* Link do kodu zapasowego */}
                        {selectedMethod !== 'BACKUP_CODE' && (
                            <p style={{ textAlign: 'center', color: '#64748b', marginTop: '24px', fontSize: '13px' }}>
                                Nie masz dostępu do aplikacji?{' '}
                                <button 
                                    type="button"
                                    onClick={() => setSelectedMethod('BACKUP_CODE')}
                                    style={{ color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Użyj kodu zapasowego
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // 🆕 Ekran wymuszonej konfiguracji 2FA
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
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Wymagana konfiguracja 2FA</h1>
                            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                                Administrator wymaga włączenia dwuskładnikowego uwierzytelniania na Twoim koncie.
                                Skonfiguruj je teraz aby kontynuować.
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
                                ⚠️ Nie możesz korzystać z serwisu bez włączenia 2FA
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
                            Skonfiguruj 2FA teraz
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
                            Anuluj i wyloguj
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Normalny formularz logowania
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
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>Zaloguj się</h1>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#cbd5e1', marginBottom: '8px' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#64748b' }} />
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    style={inputStyle} 
                                    placeholder="twoj@email.pl" 
                                    autoComplete="email"
                                    required 
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#cbd5e1', marginBottom: '8px' }}>Hasło</label>
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
                            {loading ? (<><Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> Logowanie...</>) : 'Zaloguj się'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '24px' }}>
                        Nie masz konta? <Link to="/register" style={{ color: '#0ea5e9', textDecoration: 'none' }}>Zarejestruj się</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;