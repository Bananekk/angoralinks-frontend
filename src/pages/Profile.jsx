// Profile.jsx - Z PEŁNĄ OBSŁUGĄ 2FA i WebAuthn
import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
    User, Mail, Lock, Trash2, ArrowLeft, Loader2, CheckCircle, 
    AlertCircle, Calendar, Link2, DollarSign, Shield, Smartphone,
    Key, Plus, RefreshCw, Copy, X, Fingerprint, Edit3, 
    Monitor, Usb, Bluetooth, Wifi, MoreVertical
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
    getWebAuthnRegisterOptions,
    verifyWebAuthnRegistration,
    getWebAuthnCredentials,
    deleteWebAuthnCredential,
    updateWebAuthnCredentialName,
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

// ============================================
// HOOK: Window Size
// ============================================

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

// ============================================
// KOMPONENT GŁÓWNY
// ============================================

function Profile() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isMobile } = useWindowSize();
    const { t } = useTranslation();
    
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

    // 2FA State
    const [twoFactorStatus, setTwoFactorStatus] = useState(null);
    const [loading2FA, setLoading2FA] = useState(false);
    
    // TOTP Setup
    const [showTotpSetup, setShowTotpSetup] = useState(false);
    const [totpData, setTotpData] = useState(null);
    const [totpCode, setTotpCode] = useState('');
    const [enablingTotp, setEnablingTotp] = useState(false);
    
    // WebAuthn
    const [webAuthnCredentials, setWebAuthnCredentials] = useState([]);
    const [loadingCredentials, setLoadingCredentials] = useState(false);
    const [showWebAuthnSetup, setShowWebAuthnSetup] = useState(false);
    const [webAuthnDeviceName, setWebAuthnDeviceName] = useState('');
    const [registeringWebAuthn, setRegisteringWebAuthn] = useState(false);
    const [webAuthnSupported, setWebAuthnSupported] = useState(false);
    
    // WebAuthn - edycja/usuwanie
    const [editingCredential, setEditingCredential] = useState(null);
    const [editCredentialName, setEditCredentialName] = useState('');
    const [deletingCredential, setDeletingCredential] = useState(null);
    const [deleteCredentialPassword, setDeleteCredentialPassword] = useState('');
    const [deleteCredentialCode, setDeleteCredentialCode] = useState('');
    
    // Backup Codes
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [backupCodes, setBackupCodes] = useState([]);
    const [showRegenerateModal, setShowRegenerateModal] = useState(false);
    const [regeneratingCodes, setRegeneratingCodes] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationPassword, setVerificationPassword] = useState('');
    
    // Disable 2FA
    const [showDisable2FA, setShowDisable2FA] = useState(false);
    const [disabling2FA, setDisabling2FA] = useState(false);
    const [disableCode, setDisableCode] = useState('');
    const [disablePassword, setDisablePassword] = useState('');

    // ============================================
    // EFFECTS
    // ============================================

    useEffect(() => {
        const supported = !!(window.PublicKeyCredential && typeof window.PublicKeyCredential === 'function');
        setWebAuthnSupported(supported);
    }, []);

    useEffect(() => {
        if (searchParams.get('setup2fa') === 'true') {
            setActiveTab('security');
            setTimeout(() => handleInitTotpSetup(), 500);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (activeTab === 'security') {
            fetchTwoFactorStatus();
            fetchWebAuthnCredentials();
        }
    }, [activeTab]);

    // ============================================
    // API CALLS
    // ============================================

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setProfile(response.data.user);
            setEmail(response.data.user.email);
        } catch (error) {
            toast.error(t('profile.errors.fetchProfile'));
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

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

    const fetchWebAuthnCredentials = async () => {
        setLoadingCredentials(true);
        try {
            const response = await getWebAuthnCredentials();
            setWebAuthnCredentials(response.data || []);
        } catch (error) {
            console.error('Error fetching WebAuthn credentials:', error);
        } finally {
            setLoadingCredentials(false);
        }
    };

    // ============================================
    // TOTP HANDLERS
    // ============================================

    const handleInitTotpSetup = async () => {
        try {
            const response = await initTotpSetup();
            setTotpData(response.data);
            setShowTotpSetup(true);
        } catch (error) {
            toast.error(error.response?.data?.error || t('profile.errors.totpInit'));
        }
    };

    const handleEnableTotp = async (e) => {
        e.preventDefault();
        
        if (!totpCode || totpCode.length !== 6) {
            toast.error(t('profile.errors.enter6DigitCode'));
            return;
        }
        
        setEnablingTotp(true);
        try {
            const response = await verifyAndEnableTotp(totpData.secret, totpCode);
            toast.success(t('profile.messages.totpEnabled'));
            
            if (response.data?.backupCodes) {
                setBackupCodes(response.data.backupCodes);
                setShowBackupCodes(true);
            }
            
            setShowTotpSetup(false);
            setTotpData(null);
            setTotpCode('');
            fetchTwoFactorStatus();
        } catch (error) {
            toast.error(error.response?.data?.error || t('profile.errors.invalidCode'));
        } finally {
            setEnablingTotp(false);
        }
    };

    const handleDisableTotp = async () => {
        if (!disableCode && !disablePassword) {
            toast.error(t('profile.errors.enter2FAOrPassword'));
            return;
        }
        
        setDisabling2FA(true);
        try {
            await disableTotp(disableCode || null, disablePassword || null);
            toast.success(t('profile.messages.totpDisabled'));
            setShowDisable2FA(false);
            setDisableCode('');
            setDisablePassword('');
            fetchTwoFactorStatus();
        } catch (error) {
            toast.error(error.response?.data?.error || t('profile.errors.disableTotp'));
        } finally {
            setDisabling2FA(false);
        }
    };

    // ============================================
    // WEBAUTHN HANDLERS
    // ============================================

    const handleRegisterWebAuthn = async () => {
        if (!webAuthnSupported) {
            toast.error(t('profile.errors.webAuthnNotSupported'));
            return;
        }

        setRegisteringWebAuthn(true);
        
        try {
            const optionsResponse = await getWebAuthnRegisterOptions();
            const options = optionsResponse.data;

            const publicKeyOptions = {
                ...options,
                challenge: base64URLToBuffer(options.challenge),
                user: {
                    ...options.user,
                    id: base64URLToBuffer(options.user.id)
                },
                excludeCredentials: options.excludeCredentials?.map(cred => ({
                    ...cred,
                    id: base64URLToBuffer(cred.id)
                })) || []
            };

            let credential;
            try {
                credential = await navigator.credentials.create({
                    publicKey: publicKeyOptions
                });
            } catch (credError) {
                if (credError.name === 'NotAllowedError') {
                    toast.error(t('profile.errors.registrationCancelled'));
                    return;
                }
                throw credError;
            }

            const credentialResponse = {
                id: credential.id,
                rawId: bufferToBase64URL(credential.rawId),
                type: credential.type,
                response: {
                    clientDataJSON: bufferToBase64URL(credential.response.clientDataJSON),
                    attestationObject: bufferToBase64URL(credential.response.attestationObject),
                    transports: credential.response.getTransports?.() || []
                }
            };

            const verifyResponse = await verifyWebAuthnRegistration(
                credentialResponse, 
                webAuthnDeviceName || undefined
            );
            
            toast.success(t('profile.messages.keyRegistered'));
            
            if (verifyResponse.data?.backupCodes) {
                setBackupCodes(verifyResponse.data.backupCodes);
                setShowBackupCodes(true);
            }
            
            setShowWebAuthnSetup(false);
            setWebAuthnDeviceName('');
            fetchTwoFactorStatus();
            fetchWebAuthnCredentials();

        } catch (error) {
            console.error('WebAuthn registration error:', error);
            
            if (error.name === 'NotAllowedError') {
                toast.error(t('profile.errors.registrationCancelled'));
            } else if (error.name === 'SecurityError') {
                toast.error(t('profile.errors.securityError'));
            } else if (error.name === 'InvalidStateError') {
                toast.error(t('profile.errors.keyAlreadyRegistered'));
            } else {
                toast.error(error.response?.data?.error || t('profile.errors.keyRegistration'));
            }
        } finally {
            setRegisteringWebAuthn(false);
        }
    };

    const handleEditCredentialName = async () => {
        if (!editCredentialName.trim()) {
            toast.error(t('profile.errors.nameEmpty'));
            return;
        }

        try {
            await updateWebAuthnCredentialName(editingCredential.id, editCredentialName.trim());
            toast.success(t('profile.messages.keyNameChanged'));
            setEditingCredential(null);
            setEditCredentialName('');
            fetchWebAuthnCredentials();
        } catch (error) {
            toast.error(error.response?.data?.error || t('profile.errors.nameChange'));
        }
    };

    const handleDeleteCredential = async () => {
        if (!deleteCredentialCode && !deleteCredentialPassword) {
            toast.error(t('profile.errors.enter2FAOrPassword'));
            return;
        }

        try {
            await deleteWebAuthnCredential(
                deletingCredential.id,
                deleteCredentialCode || null,
                deleteCredentialPassword || null
            );
            toast.success(t('profile.messages.keyDeleted'));
            setDeletingCredential(null);
            setDeleteCredentialCode('');
            setDeleteCredentialPassword('');
            fetchTwoFactorStatus();
            fetchWebAuthnCredentials();
        } catch (error) {
            toast.error(error.response?.data?.error || t('profile.errors.keyDelete'));
        }
    };

    // ============================================
    // BACKUP CODES HANDLERS
    // ============================================

    const handleRegenerateBackupCodes = async () => {
        if (!verificationCode && !verificationPassword) {
            toast.error(t('profile.errors.enter2FAOrPassword'));
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
            setShowRegenerateModal(false);
            setVerificationCode('');
            setVerificationPassword('');
            toast.success(t('profile.messages.backupCodesGenerated'));
            fetchTwoFactorStatus();
        } catch (error) {
            toast.error(error.response?.data?.error || t('profile.errors.generateCodes'));
        } finally {
            setRegeneratingCodes(false);
        }
    };

    const handleCopyBackupCodes = () => {
        const codesText = backupCodes.join('\n');
        navigator.clipboard.writeText(codesText);
        toast.success(t('profile.messages.codesCopied'));
    };

    const handleDownloadBackupCodes = () => {
        const codesText = backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n');
        const content = `AngoraLinks - ${t('profile.backupCodes.title')}\n${'='.repeat(40)}\n\n${codesText}\n\n${'='.repeat(40)}\n${t('profile.backupCodes.eachCodeOnce')}\n${t('profile.backupCodes.storeSecurely')}`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'angoralinks-backup-codes.txt';
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t('profile.messages.fileDownloaded'));
    };

    // ============================================
    // PROFILE HANDLERS
    // ============================================

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setSavingEmail(true);
        
        try {
            await api.put('/profile', { email });
            toast.success(t('profile.messages.emailUpdated'));
            const user = JSON.parse(localStorage.getItem('user'));
            user.email = email;
            localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            toast.error(error.response?.data?.error || t('profile.errors.updateEmail'));
        } finally {
            setSavingEmail(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error(t('profile.errors.passwordsNotMatch'));
            return;
        }
        
        setSavingPassword(true);
        
        try {
            await api.put('/profile/password', passwords);
            toast.success(t('profile.messages.passwordChanged'));
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || t('profile.errors.changePassword'));
        } finally {
            setSavingPassword(false);
        }
    };

    const handleDeleteAccount = async (e) => {
        if (e) e.preventDefault();
        
        if (!deletePassword) {
            toast.error(t('profile.errors.enterPasswordToConfirm'));
            return;
        }
        
        setDeleting(true);
        
        try {
            await api.delete('/profile', { data: { password: deletePassword } });
            toast.success(t('profile.messages.accountDeleted'));
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.error || t('profile.errors.deleteAccount'));
        } finally {
            setDeleting(false);
        }
    };

    // ============================================
    // HELPERS
    // ============================================

    const getCredentialIcon = (type) => {
        switch (type) {
            case 'singleDevice':
                return <Usb style={{ width: '20px', height: '20px', color: '#f59e0b' }} />;
            case 'multiDevice':
                return <Fingerprint style={{ width: '20px', height: '20px', color: '#22c55e' }} />;
            default:
                return <Key style={{ width: '20px', height: '20px', color: '#0ea5e9' }} />;
        }
    };

    const getCredentialTypeName = (type) => {
        switch (type) {
            case 'singleDevice':
                return t('profile.webauthn.hardwareKey');
            case 'multiDevice':
                return t('profile.webauthn.passkey');
            default:
                return t('profile.webauthn.securityKey');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return t('profile.never');
        return new Date(dateString).toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ============================================
    // STYLES
    // ============================================

    const tabs = [
        { id: 'profile', label: t('profile.tabs.profile'), icon: User },
        { id: 'security', label: t('profile.tabs.security'), icon: Shield },
        { id: 'password', label: t('profile.tabs.password'), icon: Lock },
        { id: 'delete', label: t('profile.tabs.delete'), icon: Trash2 }
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
        backgroundColor: variant === 'primary' ? '#0ea5e9' : variant === 'danger' ? '#dc2626' : variant === 'success' ? '#22c55e' : '#334155',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.7 : 1,
        width: isMobile ? '100%' : 'auto',
        minHeight: '48px',
        fontSize: '14px'
    });

    const cardStyle = {
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: isMobile ? '20px' : '24px'
    };

    const modalOverlay = {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px'
    };

    const modalContent = {
        backgroundColor: '#1e293b',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '450px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
    };

    // ============================================
    // LOADING STATE
    // ============================================

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
                <Loader2 className="animate-spin" style={{ width: '32px', height: '32px', color: '#0ea5e9' }} />
            </div>
        );
    }

    // ============================================
    // RENDER
    // ============================================

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
                        <span style={{ fontWeight: 'bold', fontSize: isMobile ? '18px' : '20px' }}>{t('profile.title')}</span>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '800px', margin: '0 auto', padding: isMobile ? '16px 12px' : '32px 16px' }}>
                {/* Statystyki konta */}
                <div style={{ ...cardStyle, marginBottom: isMobile ? '20px' : '32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '16px' : '24px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: isMobile ? 'center' : 'flex-start', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '12px' : '8px', justifyContent: isMobile ? 'flex-start' : 'center' }}>
                            <DollarSign style={{ width: '32px', height: '32px', color: '#22c55e', flexShrink: 0 }} />
                            <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                                <p style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#22c55e', margin: 0 }}>
                                    ${profile?.balance?.toFixed(4)}
                                </p>
                                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>{t('profile.stats.balance')}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: isMobile ? 'center' : 'flex-start', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '12px' : '8px', justifyContent: isMobile ? 'flex-start' : 'center' }}>
                            <Link2 style={{ width: '32px', height: '32px', color: '#0ea5e9', flexShrink: 0 }} />
                            <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                                <p style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', margin: 0 }}>{profile?.linksCount}</p>
                                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>{t('profile.stats.links')}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: isMobile ? 'center' : 'flex-start', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '12px' : '8px', justifyContent: isMobile ? 'flex-start' : 'center' }}>
                            <Calendar style={{ width: '32px', height: '32px', color: '#a855f7', flexShrink: 0 }} />
                            <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
                                <p style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', margin: 0 }}>
                                    {new Date(profile?.createdAt).toLocaleDateString('pl-PL')}
                                </p>
                                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>{t('profile.stats.joined')}</p>
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
                                minHeight: '44px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <tab.icon style={{ width: '18px', height: '18px' }} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab: Profil */}
                {activeTab === 'profile' && (
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Mail style={{ width: '20px', height: '20px', color: '#0ea5e9' }} />
                            {t('profile.changeEmail')}
                        </h2>
                        <form onSubmit={handleUpdateEmail}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>{t('profile.emailAddress')}</label>
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
                                {t('common.save')}
                            </button>
                        </form>
                    </div>
                )}

                {/* Tab: Bezpieczeństwo (2FA) */}
                {activeTab === 'security' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Status 2FA */}
                        <div style={cardStyle}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Shield style={{ width: '20px', height: '20px', color: '#0ea5e9' }} />
                                {t('profile.twoFactor.title')}
                            </h2>
                            
                            {loading2FA ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                                    <Loader2 className="animate-spin" style={{ width: '32px', height: '32px', color: '#0ea5e9' }} />
                                </div>
                            ) : (
                                <>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px', 
                                        padding: '16px', 
                                        backgroundColor: twoFactorStatus?.enabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        border: `1px solid ${twoFactorStatus?.enabled ? '#22c55e' : '#ef4444'}`,
                                        borderRadius: '12px',
                                        marginBottom: '16px'
                                    }}>
                                        {twoFactorStatus?.enabled ? (
                                            <>
                                                <CheckCircle style={{ width: '24px', height: '24px', color: '#22c55e' }} />
                                                <div>
                                                    <p style={{ fontWeight: 'bold', color: '#22c55e', margin: 0 }}>{t('profile.twoFactor.enabled')}</p>
                                                    <p style={{ color: '#86efac', fontSize: '14px', margin: 0 }}>
                                                        {t('profile.twoFactor.methods')}: {twoFactorStatus?.methods?.map(m => {
                                                            if (m === 'TOTP') return t('profile.twoFactor.app');
                                                            if (m === 'WEBAUTHN') return t('profile.twoFactor.key');
                                                            return m;
                                                        }).join(', ') || t('profile.twoFactor.none')}
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle style={{ width: '24px', height: '24px', color: '#ef4444' }} />
                                                <div>
                                                    <p style={{ fontWeight: 'bold', color: '#ef4444', margin: 0 }}>{t('profile.twoFactor.disabled')}</p>
                                                    <p style={{ color: '#fca5a5', fontSize: '14px', margin: 0 }}>
                                                        {t('profile.twoFactor.notSecured')}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {twoFactorStatus?.required && (
                                        <div style={{ 
                                            backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                                            border: '1px solid #f59e0b',
                                            borderRadius: '8px',
                                            padding: '12px 16px',
                                            marginBottom: '16px'
                                        }}>
                                            <p style={{ color: '#fbbf24', fontSize: '14px', margin: 0 }}>
                                                ⚠️ {t('profile.twoFactor.requiredByAdmin')}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* TOTP Setup/Manage */}
                        <div style={cardStyle}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Smartphone style={{ width: '18px', height: '18px', color: '#a855f7' }} />
                                {t('profile.totp.title')}
                            </h3>
                            
                            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
                                {t('profile.totp.description')}
                            </p>

                            {!twoFactorStatus?.totpEnabled ? (
                                <button 
                                    onClick={handleInitTotpSetup}
                                    style={buttonStyle(false)}
                                >
                                    <Plus style={{ width: '20px', height: '20px' }} />
                                    {t('profile.totp.configure')}
                                </button>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <CheckCircle style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                                        <span style={{ color: '#22c55e', fontWeight: '500' }}>{t('profile.totp.configured')}</span>
                                    </div>
                                    {!twoFactorStatus?.required && (
                                        <button 
                                            onClick={() => setShowDisable2FA(true)}
                                            style={{ 
                                                padding: '8px 16px',
                                                backgroundColor: 'transparent',
                                                border: '1px solid #ef4444',
                                                borderRadius: '6px',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                        >
                                            {t('profile.totp.disable')}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* WebAuthn / Passkeys */}
                        <div style={cardStyle}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Fingerprint style={{ width: '18px', height: '18px', color: '#22c55e' }} />
                                {t('profile.webauthn.title')}
                            </h3>
                            
                            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
                                {webAuthnSupported 
                                    ? t('profile.webauthn.description')
                                    : t('profile.webauthn.notSupported')
                                }
                            </p>

                            {loadingCredentials ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
                                    <Loader2 className="animate-spin" style={{ width: '24px', height: '24px', color: '#0ea5e9' }} />
                                </div>
                            ) : webAuthnCredentials.length > 0 ? (
                                <div style={{ marginBottom: '16px' }}>
                                    {webAuthnCredentials.map((cred) => (
                                        <div 
                                            key={cred.id}
                                            style={{ 
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '16px',
                                                backgroundColor: '#0f172a',
                                                borderRadius: '12px',
                                                marginBottom: '8px',
                                                border: '1px solid #334155'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                                                {getCredentialIcon(cred.type)}
                                                <div style={{ minWidth: 0 }}>
                                                    <p style={{ 
                                                        fontWeight: '500', 
                                                        margin: 0,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {cred.deviceName || t('profile.webauthn.securityKey')}
                                                    </p>
                                                    <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
                                                        {getCredentialTypeName(cred.type)}
                                                        {cred.backedUp && ` • ${t('profile.webauthn.synced')}`}
                                                    </p>
                                                    <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
                                                        {t('profile.webauthn.lastUsed')}: {formatDate(cred.lastUsedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => {
                                                        setEditingCredential(cred);
                                                        setEditCredentialName(cred.deviceName || '');
                                                    }}
                                                    style={{
                                                        padding: '8px',
                                                        backgroundColor: 'transparent',
                                                        border: '1px solid #334155',
                                                        borderRadius: '6px',
                                                        color: '#94a3b8',
                                                        cursor: 'pointer'
                                                    }}
                                                    title={t('profile.webauthn.rename')}
                                                >
                                                    <Edit3 style={{ width: '16px', height: '16px' }} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingCredential(cred)}
                                                    style={{
                                                        padding: '8px',
                                                        backgroundColor: 'transparent',
                                                        border: '1px solid #ef4444',
                                                        borderRadius: '6px',
                                                        color: '#ef4444',
                                                        cursor: 'pointer'
                                                    }}
                                                    title={t('profile.webauthn.deleteKey')}
                                                >
                                                    <Trash2 style={{ width: '16px', height: '16px' }} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ 
                                    padding: '24px', 
                                    textAlign: 'center', 
                                    backgroundColor: '#0f172a',
                                    borderRadius: '12px',
                                    marginBottom: '16px'
                                }}>
                                    <Key style={{ width: '32px', height: '32px', color: '#64748b', margin: '0 auto 8px' }} />
                                    <p style={{ color: '#64748b', margin: 0 }}>{t('profile.webauthn.noKeys')}</p>
                                </div>
                            )}

                            {webAuthnSupported && (
                                <button 
                                    onClick={() => setShowWebAuthnSetup(true)}
                                    style={buttonStyle(false, 'success')}
                                >
                                    <Plus style={{ width: '20px', height: '20px' }} />
                                    {t('profile.webauthn.addKey')}
                                </button>
                            )}
                        </div>

                        {/* Backup Codes */}
                        {twoFactorStatus?.enabled && (
                            <div style={cardStyle}>
                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Key style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
                                    {t('profile.backupCodes.title')}
                                </h3>
                                
                                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>
                                    {t('profile.backupCodes.description')}
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
                                    <span style={{ color: '#94a3b8' }}>{t('profile.backupCodes.remaining')}:</span>
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
                                            ⚠️ {t('profile.backupCodes.lowCodes')}
                                        </p>
                                    </div>
                                )}

                                <button 
                                    onClick={() => setShowRegenerateModal(true)}
                                    style={buttonStyle(false, 'secondary')}
                                >
                                    <RefreshCw style={{ width: '20px', height: '20px' }} />
                                    {t('profile.backupCodes.generate')}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Hasło */}
                {activeTab === 'password' && (
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Lock style={{ width: '20px', height: '20px', color: '#0ea5e9' }} />
                            {t('profile.changePassword')}
                        </h2>
                        <form onSubmit={handleChangePassword}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>{t('profile.currentPassword')}</label>
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
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>{t('profile.newPassword')}</label>
                                <input 
                                    type="password" 
                                    value={passwords.newPassword} 
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} 
                                    placeholder={t('profile.passwordRequirements')}
                                    style={inputStyle} 
                                    autoComplete="new-password"
                                    required 
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>{t('profile.confirmNewPassword')}</label>
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
                                {t('profile.changePassword')}
                            </button>
                        </form>
                    </div>
                )}

                {/* Tab: Usuń konto */}
                {activeTab === 'delete' && (
                    <div style={{ backgroundColor: 'rgba(127, 29, 29, 0.2)', border: '1px solid #7f1d1d', borderRadius: '16px', padding: isMobile ? '20px' : '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                            <AlertCircle style={{ width: '20px', height: '20px' }} />
                            {t('profile.deleteAccount.title')}
                        </h2>
                        <p style={{ color: '#f87171', marginBottom: '24px', fontSize: isMobile ? '14px' : '16px' }}>
                            {t('profile.deleteAccount.warning')}
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
                                {t('profile.deleteAccount.wantToDelete')}
                            </button>
                        ) : (
                            <form onSubmit={handleDeleteAccount}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#f87171', fontSize: '14px' }}>
                                        {t('profile.deleteAccount.enterPassword')}
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
                                        {t('common.cancel')}
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
                                        {t('profile.deleteAccount.title')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </main>

            {/* MODALS */}

            {/* Modal: TOTP Setup */}
            {showTotpSetup && totpData && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{t('profile.totp.setupTitle')}</h2>
                            <button 
                                onClick={() => { setShowTotpSetup(false); setTotpData(null); setTotpCode(''); }}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}
                            >
                                <X style={{ width: '24px', height: '24px' }} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>
                                {t('profile.totp.step1')}
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
                                {t('profile.totp.orEnterManually')}
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
                                        toast.success(t('profile.messages.copied'));
                                    }}
                                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                                >
                                    <Copy style={{ width: '16px', height: '16px' }} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleEnableTotp}>
                            <p style={{ color: '#94a3b8', marginBottom: '12px', fontSize: '14px' }}>
                                {t('profile.totp.step2')}
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
                                    style={buttonStyle(false, 'secondary')}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={enablingTotp || totpCode.length !== 6}
                                    style={{
                                        ...buttonStyle(enablingTotp),
                                        opacity: enablingTotp || totpCode.length !== 6 ? 0.7 : 1
                                    }}
                                >
                                    {enablingTotp ? (
                                        <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} />
                                    ) : (
                                        <CheckCircle style={{ width: '20px', height: '20px' }} />
                                    )}
                                    {t('profile.twoFactor.enable')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: WebAuthn Setup */}
            {showWebAuthnSetup && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{t('profile.webauthn.addKeyTitle')}</h2>
                            <button 
                                onClick={() => { setShowWebAuthnSetup(false); setWebAuthnDeviceName(''); }}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px' }}
                            >
                                <X style={{ width: '24px', height: '24px' }} />
                            </button>
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
                                {t('profile.webauthn.prepareKey')}
                            </p>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                {t('profile.webauthn.deviceName')}
                            </label>
                            <input
                                type="text"
                                value={webAuthnDeviceName}
                                onChange={(e) => setWebAuthnDeviceName(e.target.value)}
                                style={inputStyle}
                                placeholder={t('profile.webauthn.deviceNamePlaceholder')}
                                maxLength={100}
                            />
                        </div>

                        <div style={{ 
                            backgroundColor: '#0f172a', 
                            borderRadius: '12px', 
                            padding: '16px',
                            marginBottom: '24px'
                        }}>
                            <p style={{ color: '#f8fafc', fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>
                                {t('profile.webauthn.afterClick')}
                            </p>
                            <ul style={{ color: '#94a3b8', fontSize: '13px', margin: 0, paddingLeft: '20px' }}>
                                <li style={{ marginBottom: '8px' }}>{t('profile.webauthn.instruction1')}</li>
                                <li style={{ marginBottom: '8px' }}>{t('profile.webauthn.instruction2')}</li>
                                <li>{t('profile.webauthn.instruction3')}</li>
                            </ul>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => { setShowWebAuthnSetup(false); setWebAuthnDeviceName(''); }}
                                style={buttonStyle(false, 'secondary')}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleRegisterWebAuthn}
                                disabled={registeringWebAuthn}
                                style={buttonStyle(registeringWebAuthn, 'success')}
                            >
                                {registeringWebAuthn ? (
                                    <><Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> {t('profile.webauthn.waiting')}</>
                                ) : (
                                    <><Key style={{ width: '20px', height: '20px' }} /> {t('profile.webauthn.registerKey')}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Edit Credential Name */}
            {editingCredential && (
                <div style={modalOverlay}>
                    <div style={{ ...modalContent, maxWidth: '400px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                            {t('profile.webauthn.renameKey')}
                        </h2>
                        
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                {t('profile.webauthn.newName')}
                            </label>
                            <input
                                type="text"
                                value={editCredentialName}
                                onChange={(e) => setEditCredentialName(e.target.value)}
                                style={inputStyle}
                                placeholder={t('profile.webauthn.namePlaceholder')}
                                maxLength={100}
                                autoFocus
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => { setEditingCredential(null); setEditCredentialName(''); }}
                                style={buttonStyle(false, 'secondary')}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleEditCredentialName}
                                disabled={!editCredentialName.trim()}
                                style={buttonStyle(false)}
                            >
                                <CheckCircle style={{ width: '18px', height: '18px' }} />
                                {t('common.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Delete Credential */}
            {deletingCredential && (
                <div style={modalOverlay}>
                    <div style={{ ...modalContent, maxWidth: '400px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>
                            {t('profile.webauthn.deleteKeyTitle')}
                        </h2>
                        
                        <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>
                            {t('profile.webauthn.deleteConfirm')} <strong>"{deletingCredential.deviceName || t('profile.webauthn.securityKey')}"</strong>?
                        </p>

                        <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>
                            {t('profile.enter2FAOrPasswordToConfirm')}
                        </p>

                        {twoFactorStatus?.totpEnabled && (
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                    {t('profile.codeFromApp')}
                                </label>
                                <input
                                    type="text"
                                    value={deleteCredentialCode}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 6) setDeleteCredentialCode(val);
                                    }}
                                    style={inputStyle}
                                    placeholder="000000"
                                    maxLength={6}
                                />
                            </div>
                        )}

                        {twoFactorStatus?.totpEnabled && (
                            <div style={{ textAlign: 'center', color: '#64748b', marginBottom: '16px' }}>{t('profile.or')}</div>
                        )}

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                {t('profile.accountPassword')}
                            </label>
                            <input
                                type="password"
                                value={deleteCredentialPassword}
                                onChange={(e) => setDeleteCredentialPassword(e.target.value)}
                                style={inputStyle}
                                placeholder="••••••••"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => { 
                                    setDeletingCredential(null); 
                                    setDeleteCredentialCode(''); 
                                    setDeleteCredentialPassword(''); 
                                }}
                                style={buttonStyle(false, 'secondary')}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleDeleteCredential}
                                disabled={!deleteCredentialCode && !deleteCredentialPassword}
                                style={buttonStyle(false, 'danger')}
                            >
                                <Trash2 style={{ width: '18px', height: '18px' }} />
                                {t('profile.webauthn.deleteKey')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Regenerate Backup Codes */}
            {showRegenerateModal && (
                <div style={modalOverlay}>
                    <div style={{ ...modalContent, maxWidth: '400px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                            {t('profile.backupCodes.generateNew')}
                        </h2>
                        
                        <div style={{ 
                            backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                            border: '1px solid #f59e0b',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '16px'
                        }}>
                            <p style={{ color: '#fbbf24', fontSize: '13px', margin: 0 }}>
                                ⚠️ {t('profile.backupCodes.oldCodesInvalidated')}
                            </p>
                        </div>

                        <p style={{ color: '#94a3b8', marginBottom: '16px', fontSize: '14px' }}>
                            {t('profile.enter2FAOrPasswordToConfirm')}
                        </p>

                        {twoFactorStatus?.totpEnabled && (
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                    {t('profile.codeFromApp')}
                                </label>
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 6) setVerificationCode(val);
                                    }}
                                    style={inputStyle}
                                    placeholder="000000"
                                    maxLength={6}
                                />
                            </div>
                        )}

                        {twoFactorStatus?.totpEnabled && (
                            <div style={{ textAlign: 'center', color: '#64748b', marginBottom: '16px' }}>{t('profile.or')}</div>
                        )}

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                {t('profile.accountPassword')}
                            </label>
                            <input
                                type="password"
                                value={verificationPassword}
                                onChange={(e) => setVerificationPassword(e.target.value)}
                                style={inputStyle}
                                placeholder="••••••••"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => { 
                                    setShowRegenerateModal(false); 
                                    setVerificationCode(''); 
                                    setVerificationPassword(''); 
                                }}
                                style={buttonStyle(false, 'secondary')}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleRegenerateBackupCodes}
                                disabled={regeneratingCodes || (!verificationCode && !verificationPassword)}
                                style={buttonStyle(regeneratingCodes)}
                            >
                                {regeneratingCodes ? (
                                    <Loader2 className="animate-spin" style={{ width: '18px', height: '18px' }} />
                                ) : (
                                    <RefreshCw style={{ width: '18px', height: '18px' }} />
                                )}
                                {t('profile.backupCodes.generateCodes')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Backup Codes Display */}
            {showBackupCodes && backupCodes.length > 0 && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <Key style={{ width: '48px', height: '48px', color: '#f59e0b', margin: '0 auto 16px' }} />
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{t('profile.backupCodes.title')}</h2>
                            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                                {t('profile.backupCodes.saveSecurely')}
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
                                ⚠️ <strong>{t('profile.backupCodes.important')}</strong> {t('profile.backupCodes.notShownAgain')}
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
                                    color: '#0ea5e9',
                                    border: '1px solid #334155'
                                }}>
                                    <span style={{ color: '#64748b', fontSize: '11px' }}>{index + 1}.</span> {code}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <button
                                onClick={handleCopyBackupCodes}
                                style={buttonStyle(false, 'secondary')}
                            >
                                <Copy style={{ width: '18px', height: '18px' }} />
                                {t('profile.backupCodes.copy')}
                            </button>
                            <button
                                onClick={handleDownloadBackupCodes}
                                style={buttonStyle(false, 'secondary')}
                            >
                                <RefreshCw style={{ width: '18px', height: '18px' }} />
                                {t('profile.backupCodes.download')}
                            </button>
                        </div>

                        <button
                            onClick={() => { setShowBackupCodes(false); setBackupCodes([]); }}
                            style={buttonStyle(false)}
                        >
                            {t('profile.backupCodes.savedClose')}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal: Disable TOTP */}
            {showDisable2FA && (
                <div style={modalOverlay}>
                    <div style={{ ...modalContent, maxWidth: '400px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#ef4444' }}>
                            {t('profile.totp.disableTitle')}
                        </h2>
                        
                        <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '14px' }}>
                            {t('profile.totp.disableDescription')}
                        </p>

                                                <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                {t('profile.codeFromApp')}
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

                        <div style={{ textAlign: 'center', color: '#64748b', marginBottom: '16px' }}>{t('profile.or')}</div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                {t('profile.accountPassword')}
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
                                style={buttonStyle(false, 'secondary')}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleDisableTotp}
                                disabled={disabling2FA || (!disableCode && !disablePassword)}
                                style={buttonStyle(disabling2FA, 'danger')}
                            >
                                {disabling2FA ? (
                                    <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} />
                                ) : (
                                    t('profile.totp.disable')
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