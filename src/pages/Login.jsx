// Login.jsx - RESPONSYWNY
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/auth/login', formData);
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
                                <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} placeholder="twoj@email.pl" required />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#cbd5e1', marginBottom: '8px' }}>Hasło</label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#64748b' }} />
                                <input type="password" name="password" value={formData.password} onChange={handleChange} style={inputStyle} placeholder="••••••••" required />
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