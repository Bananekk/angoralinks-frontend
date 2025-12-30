// Register.jsx - Z OBSŁUGĄ KODU POLECAJĄCEGO
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Link2, Mail, Lock, Loader2, Gift, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ 
        email: '', 
        password: '', 
        confirmPassword: '',
        referralCode: searchParams.get('ref') || ''
    });
    
    // Stan walidacji kodu polecającego
    const [referralValid, setReferralValid] = useState(null);
    const [checkingReferral, setCheckingReferral] = useState(false);

    // Waliduj kod polecający przy starcie (jeśli jest w URL)
    useEffect(() => {
        const code = searchParams.get('ref');
        if (code) {
            validateReferralCode(code);
        }
    }, [searchParams]);

    const validateReferralCode = async (code) => {
        if (!code || code.length < 6) {
            setReferralValid(null);
            return;
        }

        setCheckingReferral(true);
        try {
            const response = await api.get(`/referrals/validate/${code}`);
            setReferralValid(response.data.valid);
        } catch (err) {
            setReferralValid(false);
        } finally {
            setCheckingReferral(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Waliduj kod polecający gdy użytkownik wpisuje
        if (name === 'referralCode') {
            if (value.length >= 6) {
                validateReferralCode(value);
            } else {
                setReferralValid(null);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Hasła nie są identyczne');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            };
            
            // Dodaj kod polecający tylko jeśli jest prawidłowy
            if (formData.referralCode && referralValid) {
                payload.referralCode = formData.referralCode.toUpperCase();
            }
            
            await api.post('/auth/register', payload);
            toast.success('Sprawdź email i wpisz kod weryfikacyjny!');
            navigate('/verify', { state: { email: formData.email } });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Błąd rejestracji');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '14px 14px 14px 44px',
        color: '#f8fafc',
        fontSize: '16px',
        boxSizing: 'border-box'
    };
    
    const inputWithRightIconStyle = {
        ...inputStyle,
        paddingRight: '44px'
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', padding: '16px' }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#f8fafc' }}>
                        <Link2 style={{ width: '40px', height: '40px', color: '#0ea5e9' }} />
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>AngoraLinks</span>
                    </Link>
                </div>

                {/* Banner informujący o poleceniu */}
                {formData.referralCode && referralValid && (
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <Gift style={{ width: '32px', height: '32px', color: '#ffffff', flexShrink: 0 }} />
                        <div>
                            <p style={{ margin: 0, fontWeight: '600', fontSize: '15px' }}>Zostałeś polecony!</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                                Twój polecający otrzyma 10% prowizji od Twoich zarobków
                            </p>
                        </div>
                    </div>
                )}

                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: '32px 24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>Utwórz konto</h1>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#64748b' }} />
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    style={inputStyle} 
                                    placeholder="twoj@email.pl" 
                                    required 
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Hasło</label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#64748b' }} />
                                <input 
                                    type="password" 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    style={inputStyle} 
                                    placeholder="Min. 8 znaków, 1 cyfra, 1 wielka litera" 
                                    required 
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Potwierdź hasło</label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#64748b' }} />
                                <input 
                                    type="password" 
                                    name="confirmPassword" 
                                    value={formData.confirmPassword} 
                                    onChange={handleChange} 
                                    style={inputStyle} 
                                    placeholder="Powtórz hasło" 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Pole kodu polecającego */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                Kod polecający <span style={{ color: '#64748b' }}>(opcjonalnie)</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Gift style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#64748b' }} />
                                <input 
                                    type="text" 
                                    name="referralCode" 
                                    value={formData.referralCode} 
                                    onChange={handleChange} 
                                    maxLength={10}
                                    style={{
                                        ...inputWithRightIconStyle,
                                        textTransform: 'uppercase',
                                        borderColor: referralValid === true ? '#22c55e' : 
                                                    referralValid === false ? '#ef4444' : '#334155',
                                        backgroundColor: referralValid === true ? 'rgba(34, 197, 94, 0.1)' : 
                                                        referralValid === false ? 'rgba(239, 68, 68, 0.1)' : '#0f172a'
                                    }} 
                                    placeholder="np. A1B2C3D4" 
                                />
                                {/* Ikona statusu */}
                                {checkingReferral && (
                                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                                        <Loader2 
                                            className="animate-spin" 
                                            style={{ width: '20px', height: '20px', color: '#0ea5e9' }} 
                                        />
                                    </div>
                                )}
                                {!checkingReferral && referralValid === true && (
                                    <CheckCircle style={{ 
                                        position: 'absolute', 
                                        right: '12px', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)', 
                                        width: '20px', 
                                        height: '20px', 
                                        color: '#22c55e' 
                                    }} />
                                )}
                                {!checkingReferral && referralValid === false && (
                                    <AlertCircle style={{ 
                                        position: 'absolute', 
                                        right: '12px', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)', 
                                        width: '20px', 
                                        height: '20px', 
                                        color: '#ef4444' 
                                    }} />
                                )}
                            </div>
                            {/* Komunikat o statusie kodu */}
                            {referralValid === false && formData.referralCode.length >= 6 && (
                                <p style={{ marginTop: '6px', fontSize: '13px', color: '#ef4444' }}>
                                    Nieprawidłowy kod polecający
                                </p>
                            )}
                            {referralValid === true && (
                                <p style={{ marginTop: '6px', fontSize: '13px', color: '#22c55e' }}>
                                    ✓ Kod prawidłowy
                                </p>
                            )}
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
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> 
                                    Tworzenie konta...
                                </>
                            ) : 'Zarejestruj się'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '24px' }}>
                        Masz już konto? <Link to="/login" style={{ color: '#0ea5e9', textDecoration: 'none' }}>Zaloguj się</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;