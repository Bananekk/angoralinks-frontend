import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Trash2, ArrowLeft, Loader2, CheckCircle, AlertCircle, Calendar, Link2, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

function Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    
    // Formularz email
    const [email, setEmail] = useState('');
    const [savingEmail, setSavingEmail] = useState(false);
    
    // Formularz hasła
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [savingPassword, setSavingPassword] = useState(false);
    
    // Usuwanie konta
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
            
            // Zaktualizuj localStorage
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
            <header style={{ borderBottom: '1px solid #1e293b', padding: '16px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link to="/dashboard" style={{ padding: '8px', color: '#94a3b8', textDecoration: 'none' }}>
                        <ArrowLeft style={{ width: '24px', height: '24px' }} />
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User style={{ width: '24px', height: '24px', color: '#0ea5e9' }} />
                        <span style={{ fontWeight: 'bold', fontSize: '20px' }}>Profil</span>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
                {/* Statystyki konta */}
                <div style={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.5)', 
                    border: '1px solid #334155', 
                    borderRadius: '16px', 
                    padding: '24px', 
                    marginBottom: '32px' 
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'center' }}>
                        <div>
                            <DollarSign style={{ width: '32px', height: '32px', color: '#22c55e', margin: '0 auto 8px' }} />
                            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>
                                ${profile?.balance?.toFixed(4)}
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Saldo</p>
                        </div>
                        <div>
                            <Link2 style={{ width: '32px', height: '32px', color: '#0ea5e9', margin: '0 auto 8px' }} />
                            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{profile?.linksCount}</p>
                            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Linki</p>
                        </div>
                        <div>
                            <Calendar style={{ width: '32px', height: '32px', color: '#a855f7', margin: '0 auto 8px' }} />
                            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                {new Date(profile?.createdAt).toLocaleDateString('pl-PL')}
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Dołączył</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
                    {[
                        { id: 'profile', label: 'Profil', icon: User },
                        { id: 'password', label: 'Hasło', icon: Lock },
                        { id: 'delete', label: 'Usuń konto', icon: Trash2 }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: activeTab === tab.id ? '#0ea5e9' : '#1e293b',
                                color: activeTab === tab.id ? '#ffffff' : '#94a3b8'
                            }}
                        >
                            <tab.icon style={{ width: '18px', height: '18px' }} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab: Profil */}
                {activeTab === 'profile' && (
                    <div style={{ 
                        backgroundColor: 'rgba(30, 41, 59, 0.5)', 
                        border: '1px solid #334155', 
                        borderRadius: '16px', 
                        padding: '24px' 
                    }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Mail style={{ width: '20px', height: '20px', color: '#0ea5e9' }} />
                            Zmień email
                        </h2>
                        <form onSubmit={handleUpdateEmail}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                    Adres email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f8fafc',
                                        fontSize: '16px'
                                    }}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={savingEmail}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    backgroundColor: '#0ea5e9',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: savingEmail ? 'not-allowed' : 'pointer',
                                    opacity: savingEmail ? 0.7 : 1
                                }}
                            >
                                {savingEmail ? <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> : <CheckCircle style={{ width: '20px', height: '20px' }} />}
                                Zapisz zmiany
                            </button>
                        </form>
                    </div>
                )}

                {/* Tab: Hasło */}
                {activeTab === 'password' && (
                    <div style={{ 
                        backgroundColor: 'rgba(30, 41, 59, 0.5)', 
                        border: '1px solid #334155', 
                        borderRadius: '16px', 
                        padding: '24px' 
                    }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Lock style={{ width: '20px', height: '20px', color: '#0ea5e9' }} />
                            Zmień hasło
                        </h2>
                        <form onSubmit={handleChangePassword}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                    Aktualne hasło
                                </label>
                                <input
                                    type="password"
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f8fafc',
                                        fontSize: '16px'
                                    }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                    Nowe hasło
                                </label>
                                <input
                                    type="password"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    placeholder="Min. 8 znaków, 1 cyfra, 1 wielka litera"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f8fafc',
                                        fontSize: '16px'
                                    }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                    Potwierdź nowe hasło
                                </label>
                                <input
                                    type="password"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#f8fafc',
                                        fontSize: '16px'
                                    }}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={savingPassword}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    backgroundColor: '#0ea5e9',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: savingPassword ? 'not-allowed' : 'pointer',
                                    opacity: savingPassword ? 0.7 : 1
                                }}
                            >
                                {savingPassword ? <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> : <Lock style={{ width: '20px', height: '20px' }} />}
                                Zmień hasło
                            </button>
                        </form>
                    </div>
                )}

                {/* Tab: Usuń konto */}
                {activeTab === 'delete' && (
                    <div style={{ 
                        backgroundColor: 'rgba(127, 29, 29, 0.2)', 
                        border: '1px solid #7f1d1d', 
                        borderRadius: '16px', 
                        padding: '24px' 
                    }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                            <AlertCircle style={{ width: '20px', height: '20px' }} />
                            Usuń konto
                        </h2>
                        <p style={{ color: '#f87171', marginBottom: '24px' }}>
                            Ta akcja jest nieodwracalna. Wszystkie Twoje linki, statystyki i zarobki zostaną trwale usunięte.
                        </p>
                        
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    backgroundColor: '#7f1d1d',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                <Trash2 style={{ width: '20px', height: '20px' }} />
                                Chcę usunąć konto
                            </button>
                        ) : (
                            <div>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#f87171', fontSize: '14px' }}>
                                        Wpisz hasło aby potwierdzić
                                    </label>
                                    <input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            backgroundColor: '#0f172a',
                                            border: '1px solid #7f1d1d',
                                            borderRadius: '8px',
                                            color: '#f8fafc',
                                            fontSize: '16px'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                                        style={{
                                            padding: '12px 24px',
                                            backgroundColor: '#334155',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Anuluj
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={deleting}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '12px 24px',
                                            backgroundColor: '#dc2626',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            cursor: deleting ? 'not-allowed' : 'pointer',
                                            opacity: deleting ? 0.7 : 1
                                        }}
                                    >
                                        {deleting ? <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> : <Trash2 style={{ width: '20px', height: '20px' }} />}
                                        Usuń konto na zawsze
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