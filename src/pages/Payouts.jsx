import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, DollarSign, Wallet, Bitcoin, Mail, Loader2, Plus, X, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

function Payouts() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [payouts, setPayouts] = useState([]);
    const [balance, setBalance] = useState(0);
    const [minimumPayout] = useState(10); // Stała wartość $10
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        method: 'PAYPAL',
        address: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [payoutsRes, profileRes] = await Promise.all([
                api.get('/payouts'),
                api.get('/auth/me')  // Zmienione z /profile na /auth/me
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
                method: formData.method.toLowerCase(), // API oczekuje małych liter
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', backgroundColor: s.bg, color: s.color, fontSize: '14px' }}>
                <Icon style={{ width: '14px', height: '14px' }} />
                {s.text}
            </span>
        );
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
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link to="/dashboard" style={{ padding: '8px', color: '#94a3b8' }}>
                        <ArrowLeft style={{ width: '24px', height: '24px' }} />
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Wallet style={{ width: '24px', height: '24px', color: '#22c55e' }} />
                        <span style={{ fontWeight: 'bold', fontSize: '20px' }}>Wypłaty</span>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 16px' }}>
                {/* Saldo */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                        <DollarSign style={{ width: '40px', height: '40px', color: '#22c55e', margin: '0 auto 8px' }} />
                        <p style={{ color: '#94a3b8', marginBottom: '4px' }}>Dostępne saldo</p>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#22c55e' }}>${(balance || 0).toFixed(4)}</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                        <AlertCircle style={{ width: '40px', height: '40px', color: '#eab308', margin: '0 auto 8px' }} />
                        <p style={{ color: '#94a3b8', marginBottom: '4px' }}>Minimalna wypłata</p>
                        <p style={{ fontSize: '32px', fontWeight: 'bold' }}>${(minimumPayout || 10).toFixed(2)}</p>
                    </div>
                </div>

                {/* Przycisk wypłaty */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={balance < minimumPayout}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: balance >= minimumPayout ? '#22c55e' : '#334155',
                            color: balance >= minimumPayout ? '#ffffff' : '#94a3b8',
                            padding: '16px 32px',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            cursor: balance >= minimumPayout ? 'pointer' : 'not-allowed'
                        }}
                    >
                        <Plus style={{ width: '24px', height: '24px' }} />
                        Wypłać środki
                    </button>
                    {balance < minimumPayout && (
                        <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '14px' }}>
                            Potrzebujesz jeszcze ${(minimumPayout - (balance || 0)).toFixed(4)} do wypłaty
                        </p>
                    )}
                </div>

                {/* Historia wypłat */}
                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Historia wypłat</h2>
                    </div>

                    {payouts.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center' }}>
                            <Wallet style={{ width: '48px', height: '48px', color: '#475569', margin: '0 auto 16px' }} />
                            <p style={{ color: '#94a3b8' }}>Brak wypłat</p>
                        </div>
                    ) : (
                        <div>
                            {payouts.map((payout) => (
                                <div key={payout.id} style={{ padding: '16px 24px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {payout.method === 'PAYPAL' || payout.method === 'paypal' ? (
                                            <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(14, 165, 233, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Mail style={{ width: '20px', height: '20px', color: '#0ea5e9' }} />
                                            </div>
                                        ) : (
                                            <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(247, 147, 26, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Bitcoin style={{ width: '20px', height: '20px', color: '#f7931a' }} />
                                            </div>
                                        )}
                                        <div>
                                            <p style={{ fontWeight: '600' }}>${(payout.amount || 0).toFixed(4)}</p>
                                            <p style={{ fontSize: '14px', color: '#94a3b8' }}>{payout.address}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            {getStatusBadge(payout.status)}
                                            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                                {new Date(payout.createdAt).toLocaleDateString('pl-PL')}
                                            </p>
                                        </div>
                                        {payout.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleCancel(payout.id)}
                                                style={{ padding: '8px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
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
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
                    <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px' }}>
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
                                    style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', color: '#f8fafc', fontSize: '16px' }}
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
                                            gap: '8px'
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
                                            gap: '8px'
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
                                    style={{ width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', color: '#f8fafc', fontSize: '16px' }}
                                    placeholder={formData.method === 'PAYPAL' ? 'twoj@email.com' : 'bc1q...'}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ flex: 1, padding: '14px', backgroundColor: '#334155', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    style={{ flex: 1, padding: '14px', backgroundColor: '#22c55e', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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