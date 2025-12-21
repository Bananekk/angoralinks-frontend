import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Link2, Mail, KeyRound, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

function Verify() {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        const emailFromState = location.state?.email;
        if (emailFromState) {
            setEmail(emailFromState);
        }
    }, [location]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/verify', { email, code });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            toast.success('Konto zweryfikowane!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd weryfikacji');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            toast.error('Wpisz adres email');
            return;
        }

        setResending(true);

        try {
            await api.post('/auth/resend-code', { email });
            toast.success('Nowy kod został wysłany!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd wysyłania kodu');
        } finally {
            setResending(false);
        }
    };

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

                {/* Card */}
                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: '32px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Mail style={{ width: '48px', height: '48px', color: '#0ea5e9', margin: '0 auto 16px' }} />
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Weryfikacja email</h1>
                        <p style={{ color: '#94a3b8' }}>Wpisz 6-cyfrowy kod który wysłaliśmy na Twój email</p>
                    </div>

                    <form onSubmit={handleVerify}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#64748b' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        padding: '12px 12px 12px 44px',
                                        color: '#f8fafc',
                                        fontSize: '16px'
                                    }}
                                    placeholder="twoj@email.pl"
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Kod weryfikacyjny</label>
                            <div style={{ position: 'relative' }}>
                                <KeyRound style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#64748b' }} />
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        padding: '12px 12px 12px 44px',
                                        color: '#f8fafc',
                                        fontSize: '24px',
                                        letterSpacing: '8px',
                                        textAlign: 'center'
                                    }}
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || code.length !== 6}
                            style={{
                                width: '100%',
                                backgroundColor: code.length === 6 ? '#0ea5e9' : '#334155',
                                color: '#ffffff',
                                padding: '14px',
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                cursor: loading || code.length !== 6 ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {loading ? (
                                <><Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> Weryfikuję...</>
                            ) : (
                                <><CheckCircle style={{ width: '20px', height: '20px' }} /> Zweryfikuj konto</>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#0ea5e9',
                                cursor: resending ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px'
                            }}
                        >
                            {resending ? (
                                <><Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} /> Wysyłam...</>
                            ) : (
                                <><RefreshCw style={{ width: '16px', height: '16px' }} /> Wyślij kod ponownie</>
                            )}
                        </button>
                    </div>

                    <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '24px', fontSize: '14px' }}>
                        <Link to="/login" style={{ color: '#0ea5e9' }}>Wróć do logowania</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Verify;