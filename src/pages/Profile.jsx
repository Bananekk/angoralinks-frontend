// Profile.jsx - RESPONSYWNY
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Trash2, ArrowLeft, Loader2, CheckCircle, AlertCircle, Calendar, Link2, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

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
    const { isMobile } = useWindowSize();
    
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    
    const [email, setEmail] = useState('');
    const [savingEmail, setSavingEmail] = useState(false);
    
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [savingPassword, setSavingPassword] = useState(false);
    
    const [deletePassword, setDeletePassword] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

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

    const handleDeleteAccount = async () => {
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

    const buttonStyle = (loading) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 24px',
        backgroundColor: '#0ea5e9',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
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
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
                            </div>
                            <button type="submit" disabled={savingEmail} style={buttonStyle(savingEmail)}>
                                {savingEmail ? <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> : <CheckCircle style={{ width: '20px', height: '20px' }} />}
                                Zapisz zmiany
                            </button>
                        </form>
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
                                <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} style={inputStyle} required />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Nowe hasło</label>
                                <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} placeholder="Min. 8 znaków, 1 cyfra, 1 wielka litera" style={inputStyle} required />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Potwierdź nowe hasło</label>
                                <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} style={inputStyle} required />
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
                            <button onClick={() => setShowDeleteConfirm(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px', backgroundColor: '#7f1d1d', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: isMobile ? '100%' : 'auto', justifyContent: 'center', minHeight: '48px' }}>
                                <Trash2 style={{ width: '20px', height: '20px' }} />
                                Chcę usunąć konto
                            </button>
                        ) : (
                            <div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#f87171', fontSize: '14px' }}>Wpisz hasło aby potwierdzić</label>
                                    <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} style={{ ...inputStyle, borderColor: '#7f1d1d' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                                    <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }} style={{ padding: '14px 24px', backgroundColor: '#334155', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', flex: 1, minHeight: '48px' }}>
                                        Anuluj
                                    </button>
                                    <button onClick={handleDeleteAccount} disabled={deleting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 24px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1, flex: 1, minHeight: '48px' }}>
                                        {deleting ? <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> : <Trash2 style={{ width: '20px', height: '20px' }} />}
                                        Usuń konto
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Profile;