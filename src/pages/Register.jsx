// Register.jsx - RESPONSYWNY (już używa inline styles, małe poprawki)
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Hasła nie są identyczne');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/register', formData);
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

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', padding: '16px' }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#f8fafc' }}>
                        <Link2 style={{ width: '40px', height: '40px', color: '#0ea5e9' }} />
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>AngoraLinks</span>
                    </Link>
                </div>

                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: '32px 24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>Utwórz konto</h1>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#64748b' }} />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} placeholder="twoj@email.pl" required />
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Hasło</label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#64748b' }} />
                                <input type="password" name="password" value={formData.password} onChange={handleChange} style={inputStyle} placeholder="Min. 8 znaków, 1 cyfra, 1 wielka litera" required />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>Potwierdź hasło</label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#64748b' }} />
                                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} style={inputStyle} placeholder="Powtórz hasło" required />
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
                            {loading ? (<><Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} /> Tworzenie konta...</>) : 'Zarejestruj się'}
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