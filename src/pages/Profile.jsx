// Profile.jsx - Z OBSŁUGĄ 2FA
import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
    User, Mail, Lock, Trash2, ArrowLeft, Loader2, CheckCircle, 
    AlertCircle, Calendar, Link2, DollarSign, Shield, Smartphone,
    Key, Plus, RefreshCw, Eye, EyeOff, Copy, Check, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { 
    getTwoFactorStatus, 
    initTotpSetup, 
    verifyAndEnableTotp,
    disableTotp,
    regenerateBackupCodes,
    disableTwoFactor,
    getBackupCodesCount
} from '../api/twoFactor';

const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    });

    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return { ...windowSize, isMobile: windowSize.width < 768 };
};

function Profile() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isMobile } = useWindowSize();
    
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    
    // Profil
    const [email, setEmail] = useState('');
    const [savingEmail, setSavingEmail] = useState(false);
    
    // Hasło
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [savingPassword, setSavingPassword] = useState(false);
    
    // Usuwanie konta
    const [deletePassword, setDeletePassword] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // 🆕 2FA State
    const [twoFactorStatus, setTwoFactorStatus] = useState(null);
    const [loading2FA, setLoading2FA] = useState(false);
    
    // 🆕 TOTP Setup
    const [showTotpSetup, setShowTotpSetup] = useState(false);
    const [totpData, setTotpData] = useState(null);
    const [totpCode, setTotpCode] = useState('');
    const [enablingTotp, setEnablingTotp] = useState(false);
    
    // 🆕 Backup Codes
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [backupCodes, setBackupCodes] = useState([]);
    const [regeneratingCodes, setRegeneratingCodes] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationPassword, setVerificationPassword] = useState('');
    
    // 🆕 Disable 2FA
    const [showDisable2FA, setShowDisable2FA] = useState(false);
    const [disabling2FA, setDisabling2FA] = useState(false);
    const [disableCode, setDisableCode] = useState('');
    const [disablePassword, setDisablePassword] = useState('');

    // 🆕 Sprawdź czy przekierowano z wymuszonego setupu
    useEffect(() => {
        if (searchParams.get('setup2fa') === 'true') {
            setActiveTab('security');
            // Automatycznie otwórz setup TOTP
            setTimeout(() => handleInitTotpSetup(), 500);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (activeTab === 'security') {
            fetchTwoFactorStatus();
        }
    }, [activeTab]);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setProfile(response.data.user);
            setEmail(response.data.user.email);
        } catch (error) {
            toast.error('Błąd pobierania profilu');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    // 🆕 Pobierz status 2FA
    const fetchTwoFactorStatus = async () => {
        setLoading2FA(true);
        try {
            const response = await getTwoFactorStatus();
            setTwoFactorStatus(response.data);
        } catch (error) {
            console.error('Error fetching 2FA status:', error);
        } finally {
            setLoading2FA(false);
        }
    };

    // 🆕 Rozpocznij konfigurację TOTP
    const handleInitTotpSetup = async () => {
        try {
            const response = await initTotpSetup();
            setTotpData(response.data);
            setShowTotpSetup(true);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd inicjalizacji TOTP');
        }
    };

    // 🆕 Włącz TOTP
    const handleEnableTotp = async (e) => {
        e.preventDefault();
        
        if (!totpCode || totpCode.length !== 6) {
            toast.error('Wprowadź 6-cyfrowy kod');
            return;
        }
        
        setEnablingTotp(true);
        try {
            const response = await verifyAndEnableTotp(totpData.secret, totpCode);
            toast.success('2FA zostało włączone!');
            
            // Pokaż kody zapasowe jeśli zostały wygenerowane
            if (response.data?.backupCodes) {
                setBackupCodes(response.data.backupCodes);
                setShowBackupCodes(true);
            }
            
            setShowTotpSetup(false);
            setTotpData(null);
            setTotpCode('');
            fetchTwoFactorStatus();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Nieprawidłowy kod');
        } finally {
            setEnablingTotp(false);
        }
    };

    // 🆕 Wyłącz TOTP
    const handleDisableTotp = async () => {
        if (!disableCode && !disablePassword) {
            toast.error('Wprowadź kod 2FA lub hasło');
            return;
        }
        
        setDisabling2FA(true);
        try {
            await disableTotp(disableCode || null, disablePassword || null);
            toast.success('TOTP zostało wyłączone');
            setShowDisable2FA(false);
            setDisableCode('');
            setDisablePassword('');
            fetchTwoFactorStatus();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd wyłączania TOTP');
        } finally {
            setDisabling2FA(false);
        }
    };

    // 🆕 Regeneruj kody zapasowe
    const handleRegenerateBackupCodes = async () => {
        if (!verificationCode && !verificationPassword) {
            toast.error('Wprowadź kod 2FA lub hasło');
            return;
        }
        
        setRegeneratingCodes(true);
        try {
            const response = await regenerateBackupCodes(
                verificationCode || null, 
                verificationPassword || null
            );
            setBackupCodes(response.data.backupCodes);
            setShowBackupCodes(true);
            setVerificationCode('');
            setVerificationPassword('');
            toast.success('Wygenerowano nowe kody zapasowe');
            fetchTwoFactorStatus();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd generowania kodów');
        } finally {
            setRegeneratingCodes(false);
        }
    };

    // 🆕 Kopiuj kody zapasowe
    const handleCopyBackupCodes = () => {
        const codesText = backupCodes.join('\n');
        navigator.clipboard.writeText(codesText);
        toast.success('Kody skopiowane do schowka');
    };

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setSavingEmail(true);
        
        try {
            await api.put('/profile', { email });
            toast.success('Email zaktualizowany');
            const user = JSON.parse(localStorage.getItem('user'));
            user.email = email;
            localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd aktualizacji');
        } finally {
            setSavingEmail(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('Nowe hasła nie są identyczne');
            return;
        }
        
        setSavingPassword(true);
        
        try {
            await api.put('/profile/password', passwords);
            toast.success('Hasło zmienione');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd zmiany hasła');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleDeleteAccount = async (e) => {
        if (e) e.preventDefault();
        
        if (!deletePassword) {
            toast.error('Wpisz hasło aby potwierdzić');
            return;
        }
        
        setDeleting(true);
        
        try {
            await api.delete('/profile', { data: { password: deletePassword } });
            toast.success('Konto usunięte');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd usuwania konta');
        } finally {
            setDeleting(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profil', icon: User },
        { id: 'security', label: 'Bezpieczeństwo', icon: Shield }, // 🆕
        { id: 'password', label: 'Hasło', icon: Lock },
        { id: 'delete', label: 'Usuń', icon: Trash2 }
    ];

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

    const buttonStyle = (isLoading, variant = 'primary') => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 24px',
        backgroundColor: variant === 'primary' ? '#0ea5e9' : variant === 'danger' ? '#dc2626' : '#334155',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.7 : 1,
        width: isMobile ? '100%' : 'auto',
        minHeight: '48px'
    });

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
                <Loader2 className="animate-spin" style={{ width: '32px', height: '32px', color: '#0ea5e9' }} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc' }}>
            {/* Header */}
            <header style={{ borderBottom: '1px solid #1e293b', padding: isMobile ? '12px' : '16px', position: 'sticky', top: 0, backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(8px)', zIndex: 50 }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link to="/dashboard" style={{ padding: '8px', color: '#94a3b8', display: 'flex', minWidth: '44px', minHeight: '44px', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                        <ArrowLeft style={{ width: '24px', height: '24px' }} />
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User style={{ width: '24px', height: '24px', color: '#0ea5e9' }} />
                        <span style={{ fontWeight: 'bold', fontSize: isMobile ? '18px' : '20px' }}>Profil</span>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '800px', margin: '0 auto', padding: isMobile ? '16px 12px' : '32px 16px' }}>
                {/* Statystyki konta */}
                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: isMobile ? '20px' : '24px', marginBottom: isMobile ? '20px' : '32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '16px' : '24px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: isMobile ? 'center' : 'flex-start', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '12px' : '8px', justifyContent: isMobile ? 'flex-start' : 'center' }}>
                            <DollarSign style={{ width: '32px', height: '32px', color: '#22c55e', flexShrink: 0 }} />
                            <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                                <p style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#22c55e', margin: 0 }}>
                                    ${profile?.balance?.toFixed(4)}
                                </p>
                                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Saldo</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: isMobile ? 'center' : 'flex-start', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '12px' : '8px', justifyContent: isMobile ? 'flex-start' : 'center' }}>
                            <Link2 style={{ width: '32px', height: '32px', color: '#0ea5e9', flexShrink: 0 }} />
                            <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                                <p style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', margin: 0 }}>{profile?.linksCount}</p>
                                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Linki</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: isMobile ? 'center' : 'flex-start', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '12px' : '8px', justifyContent: isMobile ? 'flex-start' : 'center' }}>
                            <Calendar style={{ width: '32px', height: '32px', color: '#a855f7', flexShrink: 0 }} />
                            <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                                <p style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', margin: 0 }}>
                                    {new Date(profile?.createdAt).toLocaleDateString('pl-PL')}
                                </p>
                                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Dołączył</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: isMobile ? '10px 16px' : '12px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: activeTab === tab.id ? '#0ea5e9' : '#1e293b',
                                color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                                whiteSpace: 'nowrap',
                                minHeight: '44px'
                            }}
                        >
                            <tab.icon style={{ width: '18px', height: '18px' }} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab: Profil */}
                {activeTab === 'profile' && (
                    <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: isMobile ? '20px' : '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Mail style={{ width: '20px', height: '20px', color: '#0ea5e9' }} />
                            Zmień email
                        </h2>
                        <form onSubmit={handleUpdateEmail}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Adres email</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    style={inputStyle} 
                                    autoComplete="email"
                                    required 
                                />
                            </div>
                            <button type="submit" disabled={savingEmail} style={buttonStyle(savingEmail)}>
                                {savingEmail ? <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> : <CheckCircle style={{ width: '20px', height: '20px' }} />}
                                Zapisz zmiany
                            </button>
                        </form>
                    </div>
                )}

                {/* 🆕 Tab: Bezpieczeństwo (2FA) */}
                {activeTab === 'security' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Status 2FA */}
                        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: isMobile ? '20px' : '24px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Shield style={{ width: '20px', height: '20px', color: '#0ea5e9' }} />
                                Dwuskładnikowe uwierzytelnianie (2FA)
                            </h2>
                            
                            {loading2FA ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                                    <Loader2 className="animate-spin" style={{ width: '32px', height: '32px', color: '#0ea5e9' }} />
                                </div>
                            ) : (
                                <>
                                    {/* Status badge */}
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px', 
                                        padding: '16px', 
                                        backgroundColor: twoFactorStatus?.enabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        border: `1px solid ${twoFactorStatus?.enabled ? '#22c55e' : '#ef4444'}`,
                                        borderRadius: '12px',
                                        marginBottom: '24px'
                                    }}>
                                        {twoFactorStatus?.enabled ? (
                                            <>
                                                <CheckCircle style={{ width: '24px', height: '24px', color: '#22c55e' }} />
                                                <div>
                                                    <p style={{ fontWeight: 'bold', color: '#22c55e', margin: 0 }}>2FA jest włączone</p>
                                                    <p style={{ color: '#86efac', fontSize: '14px', margin: 0 }}>
                                                        Metody: {twoFactorStatus?.methods?.join(', ') || 'TOTP'}
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle style={{ width: '24px', height: '24px', color: '#ef4444' }} />
                                                <div>
                                                    <p style={{ fontWeight: 'bold', color: '#ef4444', margin: 0 }}>2FA jest wyłączone</p>
                                                    <p style={{ color: '#fca5a5', fontSize: '14px', margin: 0 }}>
                                                        Twoje konto nie jest w pełni zabezpieczone
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Wymuszone 2FA info */}
                                    {twoFactorStatus?.required && (
                                        <div style={{ 
                                            backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                                            border: '1px solid #f59e0b',
                                            borderRadius: '8px',
                                            padding: '12px 16px',
                                            marginBottom: '24px'
                                        }}>
                                            <p style={{ color: '#fbbf24', fontSize: '14px', margin: 0 }}>
                                                ⚠️ 2FA jest wymagane przez administratora i nie może być wyłączone
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* TOTP Setup/Manage */}
                        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: isMobile ? '20px' : '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Smartphone style={{ width: '18px', height: '18px', color: '#a855f7' }} />
                                Aplikacja Authenticator
                            </h3>
                            
                            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
                                Użyj aplikacji Google Authenticator, Authy lub Microsoft Authenticator
                            </p>

                            {!twoFactorStatus?.totpEnabled ? (
                                <button 
                                    onClick={handleInitTotpSetup}
                                    style={buttonStyle(false)}
                                >
                                    <Plus style={{ width: '20px', height: '20px' }} />
                                    Skonfiguruj TOTP
                                </button>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <CheckCircle style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                                    <span style={{ color: '#22c55e' }}>Skonfigurowano</span>
                                    {!twoFactorStatus?.required && (
                                        <button 
                                            onClick={() => setShowDisable2FA(true)}
                                            style={{ 
                                                marginLeft: 'auto',
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                border: '1px solid #ef4444',
                                                borderRadius: '6px',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Wyłącz
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Backup Codes */}
                        {twoFactorStatus?.enabled && (
                            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: isMobile ? '20px' : '24px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Key style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
                                    Kody zapasowe
                                </h3>
                                
                                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
                                    Kody jednorazowe na wypadek utraty dostępu do urządzenia
                                </p>

                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    padding: '12px 16px',
                                    backgroundColor: '#0f172a',
                                    borderRadius: '8px',
                                    marginBottom: '16px'
                                }}>
                                    <span style={{ color: '#94a3b8' }}>Pozostałe kody:</span>
                                    <span style={{ 
                                        fontWeight: 'bold',
                                        color: twoFactorStatus?.backupCodesRemaining <= 2 ? '#ef4444' : '#22c55e'
                                    }}>
                                        {twoFactorStatus?.backupCodesRemaining || 0} / {twoFactorStatus?.backupCodesTotal || 10}
                                    </span>
                                </div>

                                {twoFactorStatus?.backupCodesRemaining <= 2 && (
                                    <div style={{ 
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                                        border: '1px solid #ef4444',
                                        borderRadius: '8px',
                                        padding: '12px 16px',
                                        marginBottom: '16px'
                                    }}>
                                        <p style={{ color: '#fca5a5', fontSize: '14px', margin: 0 }}>
                                            ⚠️ Mało kodów zapasowych! Wygeneruj nowe.
                                        </p>
                                    </div>
                                )}

                                <button 
                                    onClick={() => {
                                        setVerificationCode('');
                                        setVerificationPassword('');
                                        setShowBackupCodes(false);
                                        // Pokaż modal regeneracji
                                        const modal = document.getElementById('regenerate-modal');
                                        if (modal) modal.style.display = 'flex';
                                    }}
                                    style={{
                                        ...buttonStyle(false),
                                        backgroundColor: '#334155'
                                    }}
                                >
                                    <RefreshCw style={{ width: '20px', height: '20px' }} />
                                    Wygeneruj nowe kody
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Hasło */}
                {activeTab === 'password' && (
                    <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: isMobile ? '20px' : '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Lock style={{ width: '20px', height: '20px', color: '#0ea5e9' }} />
                            Zmień hasło
                        </h2>
                        <form onSubmit={handleChangePassword}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Aktualne hasło</label>
                                <input 
                                    type="password" 
                                    value={passwords.currentPassword} 
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} 
                                    style={inputStyle} 
                                    autoComplete="current-password"
                                    required 
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Nowe hasło</label>
                                <input 
                                    type="password" 
                                    value={passwords.newPassword} 
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} 
                                    placeholder="Min. 8 znaków, 1 cyfra, 1 wielka litera" 
                                    style={inputStyle} 
                                    autoComplete="new-password"
                                    required 
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Potwierdź nowe hasło</label>
                                <input 
                                    type="password" 
                                    value={passwords.confirmPassword} 
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} 
                                    style={inputStyle} 
                                    autoComplete="new-password"
                                    required 
                                />
                            </div>
                            <button type="submit" disabled={savingPassword} style={buttonStyle(savingPassword)}>
                                {savingPassword ? <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> : <Lock style={{ width: '20px', height: '20px' }} />}
                                Zmień hasło
                            </button>
                        </form>
                    </div>
                )}

                {/* Tab: Usuń konto */}
                {activeTab === 'delete' && (
                    <div style={{ backgroundColor: 'rgba(127, 29, 29, 0.2)', border: '1px solid #7f1d1d', borderRadius: '16px', padding: isMobile ? '20px' : '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                            <AlertCircle style={{ width: '20px', height: '20px' }} />
                            Usuń konto
                        </h2>
                        <p style={{ color: '#f87171', marginBottom: '24px', fontSize: isMobile ? '14px' : '16px' }}>
                            Ta akcja jest nieodwracalna. Wszystkie Twoje dane zostaną trwale usunięte.
                        </p>
                        
                        {!showDeleteConfirm ? (
                            <button 
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)} 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    padding: '14px 24px', 
                                    backgroundColor: '#7f1d1d', 
                                    color: '#ffffff', 
                                    border: 'none', 
                                    borderRadius: '8px', 
                                    fontWeight: 'bold', 
                                    cursor: 'pointer', 
                                    width: isMobile ? '100%' : 'auto', 
                                    justifyContent: 'center', 
                                    minHeight: '48px' 
                                }}
                            >
                                <Trash2 style={{ width: '20px', height: '20px' }} />
                                Chcę usunąć konto
                            </button>
                        ) : (
                            <form onSubmit={handleDeleteAccount}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#f87171', fontSize: '14px' }}>
                                        Wpisz hasło aby potwierdzić
                                    </label>
                                    <input 
                                        type="password" 
                                        value={deletePassword} 
                                        onChange={(e) => setDeletePassword(e.target.value)} 
                                        style={{ ...inputStyle, borderColor: '#7f1d1d' }}
                                        autoComplete="current-password"
                                        autoFocus
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                                    <button 
                                        type="button"
                                        onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }} 
                                        style={{ 
                                            padding: '14px 24px', 
                                            backgroundColor: '#334155', 
                                            color: '#ffffff', 
                                            border: 'none', 
                                            borderRadius: '8px', 
                                            fontWeight: 'bold', 
                                            cursor: 'pointer', 
                                            flex: 1, 
                                            minHeight: '48px' 
                                        }}
                                    >
                                        Anuluj
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={deleting} 
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            gap: '8px', 
                                            padding: '14px 24px', 
                                            backgroundColor: '#dc2626', 
                                            color: '#ffffff', 
                                            border: 'none', 
                                            borderRadius: '8px', 
                                            fontWeight: 'bold', 
                                            cursor: deleting ? 'not-allowed' : 'pointer', 
                                            opacity: deleting ? 0.7 : 1, 
                                            flex: 1, 
                                            minHeight: '48px' 
                                        }}
                                    >
                                        {deleting ? (
                                            <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} />
                                        ) : (
                                            <Trash2 style={{ width: '20px', height: '20px' }} />
                                        )}
                                        Usuń konto
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </main>

            {/* 🆕 Modal: TOTP Setup */}
            {showTotpSetup && totpData && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: '#1e293b',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '450px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Konfiguracja 2FA</h2>
                            <button 
                                onClick={() => { setShowTotpSetup(false); setTotpData(null); setTotpCode(''); }}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}
                            >
                                <X style={{ width: '24px', height: '24px' }} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>
                                1. Zeskanuj kod QR w aplikacji authenticator:
                            </p>
                            <div style={{ 
                                backgroundColor: 'white', 
                                padding: '16px', 
                                borderRadius: '12px', 
                                display: 'flex', 
                                justifyContent: 'center',
                                marginBottom: '16px'
                            }}>
                                <img src={totpData.qrCode} alt="QR Code" style={{ maxWidth: '200px' }} />
                            </div>
                            
                            <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', marginBottom: '8px' }}>
                                Lub wprowadź ręcznie:
                            </p>
                            <div style={{ 
                                backgroundColor: '#0f172a', 
                                padding: '12px', 
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px'
                            }}>
                                <code style={{ color: '#0ea5e9', fontSize: '12px', wordBreak: 'break-all' }}>
                                    {totpData.secret}
                                </code>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(totpData.secret);
                                        toast.success('Skopiowano!');
                                    }}
                                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                >
                                    <Copy style={{ width: '16px', height: '16px' }} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleEnableTotp}>
                            <p style={{ color: '#94a3b8', marginBottom: '12px', fontSize: '14px' }}>
                                2. Wprowadź kod z aplikacji:
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
                                    fontSize: '24px',
                                    letterSpacing: '8px',
                                    fontFamily: 'monospace'
                                }}
                                placeholder="000000"
                                maxLength={6}
                                autoFocus
                            />

                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowTotpSetup(false); setTotpData(null); setTotpCode(''); }}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        backgroundColor: '#334155',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    disabled={enablingTotp || totpCode.length !== 6}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        backgroundColor: '#0ea5e9',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: enablingTotp ? 'not-allowed' : 'pointer',
                                        opacity: enablingTotp || totpCode.length !== 6 ? 0.7 : 1,
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {enablingTotp ? (
                                        <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} />
                                    ) : (
                                        <CheckCircle style={{ width: '20px', height: '20px' }} />
                                    )}
                                    Włącz 2FA
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🆕 Modal: Backup Codes Display */}
            {showBackupCodes && backupCodes.length > 0 && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: '#1e293b',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '450px',
                        width: '100%'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <Key style={{ width: '48px', height: '48px', color: '#f59e0b', margin: '0 auto 16px' }} />
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Kody zapasowe</h2>
                            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                                Zapisz te kody w bezpiecznym miejscu. Każdy kod może być użyty tylko raz.
                            </p>
                        </div>

                        <div style={{ 
                            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                            border: '1px solid #ef4444',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '24px'
                        }}>
                            <p style={{ color: '#fca5a5', fontSize: '13px', margin: 0, textAlign: 'center' }}>
                                ⚠️ Te kody nie będą pokazane ponownie!
                            </p>
                        </div>

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
                                    color: '#0ea5e9'
                                }}>
                                    {code}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handleCopyBackupCodes}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    backgroundColor: '#334155',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Copy style={{ width: '18px', height: '18px' }} />
                                Kopiuj
                            </button>
                            <button
                                onClick={() => { setShowBackupCodes(false); setBackupCodes([]); }}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    backgroundColor: '#0ea5e9',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Zapisałem kody
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🆕 Modal: Disable 2FA */}
            {showDisable2FA && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: '#1e293b',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '400px',
                        width: '100%'
                    }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>
                            Wyłącz 2FA
                        </h2>
                        
                        <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '14px' }}>
                            Aby wyłączyć 2FA, wprowadź kod z aplikacji authenticator lub hasło do konta.
                        </p>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                Kod 2FA (6 cyfr)
                            </label>
                            <input
                                type="text"
                                value={disableCode}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 6) setDisableCode(val);
                                }}
                                style={inputStyle}
                                placeholder="000000"
                                maxLength={6}
                            />
                        </div>

                        <div style={{ textAlign: 'center', color: '#64748b', marginBottom: '16px' }}>lub</div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                Hasło do konta
                            </label>
                            <input
                                type="password"
                                value={disablePassword}
                                onChange={(e) => setDisablePassword(e.target.value)}
                                style={inputStyle}
                                placeholder="••••••••"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => { setShowDisable2FA(false); setDisableCode(''); setDisablePassword(''); }}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    backgroundColor: '#334155',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handleDisableTotp}
                                disabled={disabling2FA || (!disableCode && !disablePassword)}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    backgroundColor: '#dc2626',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: disabling2FA ? 'not-allowed' : 'pointer',
                                    opacity: disabling2FA || (!disableCode && !disablePassword) ? 0.7 : 1,
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {disabling2FA ? (
                                    <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} />
                                ) : (
                                    'Wyłącz 2FA'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;