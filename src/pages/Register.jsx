// Register.jsx - POPRAWIONY
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Link2, Mail, Lock, Loader2, Gift, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useTranslation } from '../i18n';

function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ 
        email: '', 
        password: '', 
        confirmPassword: '',
        referralCode: searchParams.get('ref') || ''
    });
    
    const [referralValid, setReferralValid] = useState(null);
    const [checkingReferral, setCheckingReferral] = useState(false);

    useEffect(() => {
        const code = searchParams.get('ref');
        if (code) {
            setFormData(prev => ({ ...prev, referralCode: code }));
            validateReferralCode(code);
        }
    }, [searchParams]);

    const validateReferralCode = async (code) => {
        if (!code || code.length < 8) {
            setReferralValid(null);
            return;
        }

        setCheckingReferral(true);
        try {
            const response = await api.get(`/referrals/validate/${code.toUpperCase()}`);
            setReferralValid(response.data.valid);
        } catch (err) {
            console.error('Referral validation error:', err);
            setReferralValid(null);
        } finally {
            setCheckingReferral(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        if (name === 'referralCode') {
            if (value.length >= 8) {
                validateReferralCode(value);
            } else {
                setReferralValid(null);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error(t('register.errors.passwordsNotMatch'));
            return;
        }

        setLoading(true);

        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            };
            
            if (formData.referralCode && formData.referralCode.length >= 8) {
                payload.referralCode = formData.referralCode.toUpperCase();
            }
            
            const response = await api.post('/auth/register', payload);
            
            toast.success(t('register.messages.checkEmail'));
            navigate('/verify', { state: { email: formData.email } });
        } catch (error) {
            toast.error(error.response?.data?.error || t('register.errors.registrationFailed'));
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

    const showReferralBanner = formData.referralCode && formData.referralCode.length >= 8 && referralValid !== false;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', padding: '16px' }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#f8fafc' }}>
                        <Link2 style={{ width: '40px', height: '40px', color: '#0ea5e9' }} />
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>AngoraLinks</span>
                    </Link>
                </div>

                {showReferralBanner && (
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        background: referralValid === true 
                            ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
                            : 'linear-gradient(135deg, #475569 0%, #334155 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <Gift style={{ width: '32px', height: '32px', color: '#ffffff', flexShrink: 0 }} />
                        <div>
                            <p style={{ margin: 0, fontWeight: '600', fontSize: '15px' }}>
                                {referralValid === true ? t('register.referral.referred') : t('register.referral.verifying')}
                            </p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                                {referralValid === true 
                                    ? t('register.referral.commission')
                                    : t('register.referral.willBeVerified')
                                }
                            </p>
                        </div>
                    </div>
                )}

                <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '16px', padding: '32px 24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>{t('register.title')}</h1>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>{t('register.email')}</label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#64748b' }} />
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    style={inputStyle} 
                                    placeholder={t('register.emailPlaceholder')}
                                    required 
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>{t('register.password')}</label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#64748b' }} />
                                <input 
                                    type="password" 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    style={inputStyle} 
                                    placeholder={t('register.passwordPlaceholder')}
                                    required 
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>{t('register.confirmPassword')}</label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#64748b' }} />
                                <input 
                                    type="password" 
                                    name="confirmPassword" 
                                    value={formData.confirmPassword} 
                                    onChange={handleChange} 
                                    style={inputStyle} 
                                    placeholder={t('register.repeatPassword')}
                                    required 
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '14px' }}>
                                {t('register.referralCode')} <span style={{ color: '#64748b' }}>({t('register.optional')})</span>
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
                                    placeholder={t('register.referralCodePlaceholder')}
                                />
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
                            {referralValid === false && formData.referralCode.length >= 8 && (
                                <p style={{ marginTop: '6px', fontSize: '13px', color: '#ef4444' }}>
                                    {t('register.errors.invalidReferralCode')}
                                </p>
                            )}
                            {referralValid === true && (
                                <p style={{ marginTop: '6px', fontSize: '13px', color: '#22c55e' }}>
                                    ✓ {t('register.referral.codeValid')}
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
                                    {t('register.creatingAccount')}
                                </>
                            ) : t('register.submit')}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '24px' }}>
                        {t('register.hasAccount')} <Link to="/login" style={{ color: '#0ea5e9', textDecoration: 'none' }}>{t('register.login')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;