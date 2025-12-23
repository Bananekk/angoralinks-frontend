// Payouts.jsx - RESPONSYWNY
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, DollarSign, Wallet, Bitcoin, Mail, Loader2, Plus, X, CheckCircle, Clock, XCircle, AlertCircle, Menu, LogOut, BarChart3, Globe, User, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

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

function Payouts() {
    const navigate = useNavigate();
    const { isMobile } = useWindowSize();
    
    const [loading, setLoading] = useState(true);
    const [payouts, setPayouts] = useState([]);
    const [balance, setBalance] = useState(0);
    const [minimumPayout] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        amount: '',
        method: 'PAYPAL',
        address: ''
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {}
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (!isMobile) setMobileMenuOpen(false);
    }, [isMobile]);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen || showModal ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [mobileMenuOpen, showModal]);

    const fetchData = async () => {
        try {
            const [payoutsRes, profileRes] = await Promise.all([
                api.get('/payouts'),
                api.get('/auth/me')
            ]);
            setPayouts(payoutsRes.data.payouts || []);
            setBalance(parseFloat(profileRes.data.user?.balance) || 0);
        } catch (error) {
            console.error('Błąd:', error);
            toast.error('Błąd pobierania danych');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            const response = await api.post('/payouts', {
                amount: parseFloat(formData.amount),
                method: formData.method.toLowerCase(),
                address: formData.address
            });
            setPayouts([response.data.payout, ...payouts]);
            setBalance(prev => prev - parseFloat(formData.amount));
            setShowModal(false);
            setFormData({ amount: '', method: 'PAYPAL', address: '' });
            toast.success('Wypłata zlecona!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd tworzenia wypłaty');
        } finally {
            setCreating(false);
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Czy na pewno chcesz anulować tę wypłatę?')) return;

        try {
            await api.delete(`/payouts/${id}`);
            const payout = payouts.find(p => p.id === id);
            setPayouts(payouts.filter(p => p.id !== id));
            setBalance(prev => prev + (payout?.amount || 0));
            toast.success('Wypłata anulowana');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd anulowania');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        toast.success('Wylogowano');
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: { bg: 'rgba(234, 179, 8, 0.2)', color: '#eab308', icon: Clock, text: 'Oczekuje' },
            PROCESSING: { bg: 'rgba(14, 165, 233, 0.2)', color: '#0ea5e9', icon: Loader2, text: 'Przetwarzanie' },
            COMPLETED: { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', icon: CheckCircle, text: 'Zrealizowana' },
            REJECTED: { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', icon: XCircle, text: 'Odrzucona' }
        };
        const s = styles[status] || styles.PENDING;
        const Icon = s.icon;
        return (
            <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: isMobile ? '4px 10px' : '4px 12px', 
                borderRadius: '20px', 
                backgroundColor: s.bg, 
                color: s.color, 
                fontSize: isMobile ? '12px' : '14px' 
            }}>
                <Icon style={{ width: '14px', height: '14px' }} />
                {s.text}
            </span>
        );
    };

    const menuItemStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        color: '#f8fafc',
        textDecoration: 'none',
        borderBottom: '1px solid #334155'
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
            <header style={{ 
                borderBottom: '1px solid #1e293b', 
                padding: isMobile ? '12px' : '16px',
                position: 'sticky',
                top: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(8px)',
                zIndex: 50
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px' }}>
                        <Link to="/dashboard" style={{ padding: '8px', color: '#94a3b8', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowLeft style={{ width: '24px', height: '24px' }} />
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Wallet style={{ width: '24px', height: '24px', color: '#22c55e' }} />
                            <span style={{ fontWeight: 'bold', fontSize: isMobile ? '18px' : '20px' }}>Wypłaty</span>
                        </div>
                    </div>

                    {isMobile ? (
                        <button 
                            onClick={() => setMobileMenuOpen(true)}
                            style={{ padding: '8px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Menu style={{ width: '24px', height: '24px' }} />
                        </button>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Link to="/dashboard" style={{ padding: '8px', color: '#94a3b8' }} title="Dashboard">
                                <Link2 style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <Link to="/stats" style={{ padding: '8px', color: '#94a3b8' }} title="Statystyki">
                                <BarChart3 style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <Link to="/cpm-rates" style={{ padding: '8px', color: '#22c55e' }} title="CPM">
                                <Globe style={{ width: '20px', height: '20px' }} />
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100 }} onClick={() => setMobileMenuOpen(false)} />
            )}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '280px',
                maxWidth: '85vw',
                backgroundColor: '#1e293b',
                zIndex: 101,
                transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s ease-in-out',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #334155' }}>
                    <span style={{ fontWeight: '600', fontSize: '18px' }}>Menu</span>
                    <button onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        <X style={{ width: '24px', height: '24px' }} />
                    </button>
                </div>
                <div style={{ flex: 1, overflow: 'auto' }}>
                    <Link to="/dashboard" style={menuItemStyle} onClick={() => setMobileMenuOpen(false)}>
                        <Link2 style={{ width: '20px', height: '20px' }} /> Dashboard
                    </Link>
                    <Link to="/stats" style={menuItemStyle} onClick={() => setMobileMenuOpen(false)}>
                        <BarChart3 style={{ width: '20px', height: '20px' }} /> Statystyki
                    </Link>
                    <Link to="/cpm-rates" style={{ ...menuItemStyle, color: '#22c55e' }} onClick={() => setMobileMenuOpen(false)}>
                        <Globe style={{ width: '20px', height: '20px' }} /> Stawki CPM
                    </Link>
                    <Link to="/payouts" style={{ ...menuItemStyle, backgroundColor: 'rgba(34, 197, 94, 0.1)' }} onClick={() => setMobileMenuOpen(false)}>
                        <Wallet style={{ width: '20px', height: '20px' }} /> Wypłaty
                    </Link>
                    <Link to="/profile" style={menuItemStyle} onClick={() => setMobileMenuOpen(false)}>
                        <User style={{ width: '20px', height: '20px' }} /> Profil
                    </Link>
                </div>
                <div style={{ padding: '16px', borderTop: '1px solid #334155' }}>
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        width: '100%', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
                    }}>
                        <LogOut style={{ width: '20px', height: '20px' }} /> Wyloguj się
                    </button>
                </div>
            </div>

            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '16px 12px' : '32px 16px' }}>
                {/* Saldo */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
                    gap: isMobile ? '12px' : '16px', 
                    marginBottom: isMobile ? '24px' : '32px' 
                }}>
                    <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '16px', padding: isMobile ? '20px' : '24px', textAlign: 'center' }}>
                        <DollarSign style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', color: '#22c55e', margin: '0 auto 8px' }} />
                        <p style={{ color: '#94a3b8', marginBottom: '4px', fontSize: isMobile ? '14px' : '16px' }}>Dostępne saldo</p>
                        <p style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: 'bold', color: '#22c55e' }}>${(balance || 0).toFixed(4)}</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: isMobile ? '20px' : '24px', textAlign: 'center' }}>
                        <AlertCircle style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', color: '#eab308', margin: '0 auto 8px' }} />
                        <p style={{ color: '#94a3b8', marginBottom: '4px', fontSize: isMobile ? '14px' : '16px' }}>Minimalna wypłata</p>
                        <p style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: 'bold' }}>${(minimumPayout || 10).toFixed(2)}</p>
                    </div>
                </div>

                {/* Przycisk wypłaty */}
                <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '32px' }}>
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={balance < minimumPayout}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            backgroundColor: balance >= minimumPayout ? '#22c55e' : '#334155',
                            color: balance >= minimumPayout ? '#ffffff' : '#94a3b8',
                            padding: isMobile ? '14px 24px' : '16px 32px',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '16px' : '18px',
                            cursor: balance >= minimumPayout ? 'pointer' : 'not-allowed',
                            width: isMobile ? '100%' : 'auto',
                            minHeight: '48px'
                        }}
                    >
                        <Plus style={{ width: '24px', height: '24px' }} />
                        Wypłać środki
                    </button>
                    {balance < minimumPayout && (
                        <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: isMobile ? '13px' : '14px' }}>
                            Potrzebujesz jeszcze ${(minimumPayout - (balance || 0)).toFixed(4)} do wypłaty
                        </p>
                    )}
                </div>

                {/* Historia wypłat */}
                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px' }}>
                    <div style={{ padding: isMobile ? '16px' : '20px 24px', borderBottom: '1px solid #334155' }}>
                        <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold' }}>Historia wypłat</h2>
                    </div>

                    {payouts.length === 0 ? (
                        <div style={{ padding: isMobile ? '32px 16px' : '48px', textAlign: 'center' }}>
                            <Wallet style={{ width: '48px', height: '48px', color: '#475569', margin: '0 auto 16px' }} />
                            <p style={{ color: '#94a3b8' }}>Brak wypłat</p>
                        </div>
                    ) : (
                        <div>
                            {payouts.map((payout) => (
                                <div key={payout.id} style={{ 
                                    padding: isMobile ? '12px 16px' : '16px 24px', 
                                    borderBottom: '1px solid #1e293b', 
                                    display: 'flex', 
                                    flexDirection: isMobile ? 'column' : 'row',
                                    alignItems: isMobile ? 'stretch' : 'center', 
                                    justifyContent: 'space-between', 
                                    gap: isMobile ? '12px' : '16px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {payout.method === 'PAYPAL' || payout.method === 'paypal' ? (
                                            <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(14, 165, 233, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Mail style={{ width: '20px', height: '20px', color: '#0ea5e9' }} />
                                            </div>
                                        ) : (
                                            <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(247, 147, 26, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Bitcoin style={{ width: '20px', height: '20px', color: '#f7931a' }} />
                                            </div>
                                        )}
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontWeight: '600', fontSize: isMobile ? '16px' : '18px' }}>${(payout.amount || 0).toFixed(4)}</p>
                                            <p style={{ fontSize: isMobile ? '12px' : '14px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{payout.address}</p>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: isMobile ? 'space-between' : 'flex-end',
                                        gap: '16px' 
                                    }}>
                                        <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                                            {getStatusBadge(payout.status)}
                                            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                                {new Date(payout.createdAt).toLocaleDateString('pl-PL')}
                                            </p>
                                        </div>
                                        {payout.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleCancel(payout.id)}
                                                style={{ padding: '8px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Anuluj"
                                            >
                                                <X style={{ width: '20px', height: '20px' }} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div style={{ 
                    position: 'fixed', 
                    inset: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    display: 'flex', 
                    alignItems: isMobile ? 'flex-end' : 'center', 
                    justifyContent: 'center', 
                    zIndex: 50, 
                    padding: isMobile ? '0' : '16px' 
                }}>
                    <div style={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155', 
                        borderRadius: isMobile ? '16px 16px 0 0' : '16px', 
                        padding: isMobile ? '20px 16px 32px' : '24px', 
                        width: '100%', 
                        maxWidth: isMobile ? '100%' : '400px',
                        maxHeight: isMobile ? '90vh' : 'auto',
                        overflow: 'auto'
                    }}>
                        {isMobile && (
                            <div style={{ width: '40px', height: '4px', backgroundColor: '#475569', borderRadius: '2px', margin: '0 auto 16px' }} />
                        )}
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Nowa wypłata</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                    Kwota (dostępne: ${(balance || 0).toFixed(4)})
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={minimumPayout}
                                    max={balance}
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '14px', color: '#f8fafc', fontSize: '16px', boxSizing: 'border-box' }}
                                    placeholder={`Min. $${minimumPayout}`}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Metoda wypłaty</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, method: 'PAYPAL', address: '' })}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: formData.method === 'PAYPAL' ? '2px solid #0ea5e9' : '1px solid #334155',
                                            backgroundColor: formData.method === 'PAYPAL' ? 'rgba(14, 165, 233, 0.1)' : '#0f172a',
                                            color: '#f8fafc',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            minHeight: '80px'
                                        }}
                                    >
                                        <Mail style={{ width: '24px', height: '24px', color: '#0ea5e9' }} />
                                        PayPal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, method: 'BITCOIN', address: '' })}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: formData.method === 'BITCOIN' ? '2px solid #f7931a' : '1px solid #334155',
                                            backgroundColor: formData.method === 'BITCOIN' ? 'rgba(247, 147, 26, 0.1)' : '#0f172a',
                                            color: '#f8fafc',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            minHeight: '80px'
                                        }}
                                    >
                                        <Bitcoin style={{ width: '24px', height: '24px', color: '#f7931a' }} />
                                        Bitcoin
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                    {formData.method === 'PAYPAL' ? 'Email PayPal' : 'Adres Bitcoin'}
                                </label>
                                <input
                                    type={formData.method === 'PAYPAL' ? 'email' : 'text'}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '14px', color: '#f8fafc', fontSize: '16px', boxSizing: 'border-box' }}
                                    placeholder={formData.method === 'PAYPAL' ? 'twoj@email.com' : 'bc1q...'}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ flex: 1, padding: '14px', backgroundColor: '#334155', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', minHeight: '48px' }}
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    style={{ flex: 1, padding: '14px', backgroundColor: '#22c55e', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '48px' }}
                                >
                                    {creating ? <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> : 'Wypłać'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Payouts;