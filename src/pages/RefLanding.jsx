// RefLanding.jsx - Strona landingowa dla linków polecających
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    Link2, 
    Gift, 
    ArrowRight, 
    Users, 
    DollarSign, 
    TrendingUp,
    Loader2,
    AlertCircle,
    CheckCircle,
    Zap,
    Globe,
    Shield
} from 'lucide-react';
import api from '../api/axios';

function RefLanding() {
    const { code } = useParams();
    const navigate = useNavigate();
    
    const [validating, setValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        validateCodeAndGetSettings();
    }, [code]);

    const validateCodeAndGetSettings = async () => {
        try {
            // Waliduj kod i pobierz ustawienia równolegle
            const [validationRes, settingsRes] = await Promise.all([
                api.get(`/referrals/validate/${code}`),
                api.get('/referrals/settings').catch(() => ({ data: { commissionRate: 10 } }))
            ]);
            
            setIsValid(validationRes.data.valid);
            setSettings(settingsRes.data);
        } catch (err) {
            setIsValid(false);
        } finally {
            setValidating(false);
        }
    };

    const handleRegisterClick = () => {
        navigate(`/register?ref=${code}`);
    };

    // Loading state
    if (validating) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 
                        className="animate-spin" 
                        style={{ 
                            width: '48px', 
                            height: '48px', 
                            color: '#0ea5e9',
                            marginBottom: '16px'
                        }} 
                    />
                    <p style={{ color: '#94a3b8' }}>Weryfikacja linku...</p>
                </div>
            </div>
        );
    }

    // Invalid code state
    if (!isValid) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0f172a',
                padding: '16px'
            }}>
                <div style={{
                    maxWidth: '400px',
                    width: '100%',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid #334155',
                    borderRadius: '16px',
                    padding: '32px 24px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px'
                    }}>
                        <AlertCircle style={{ width: '32px', height: '32px', color: '#ef4444' }} />
                    </div>
                    
                    <h1 style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold', 
                        color: '#f8fafc',
                        marginBottom: '12px'
                    }}>
                        Nieprawidłowy link
                    </h1>
                    
                    <p style={{ 
                        color: '#94a3b8', 
                        marginBottom: '24px',
                        lineHeight: '1.6'
                    }}>
                        Ten link polecający jest nieprawidłowy lub wygasł. 
                        Możesz nadal utworzyć konto bez kodu polecającego.
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Link 
                            to="/register"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                backgroundColor: '#0ea5e9',
                                color: '#ffffff',
                                padding: '14px 24px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '16px'
                            }}
                        >
                            Zarejestruj się
                            <ArrowRight style={{ width: '18px', height: '18px' }} />
                        </Link>
                        
                        <Link 
                            to="/"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#94a3b8',
                                padding: '14px 24px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontSize: '14px'
                            }}
                        >
                            Wróć na stronę główną
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Valid code - show landing page
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0f172a',
            color: '#f8fafc'
        }}>
            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)',
                padding: '60px 16px 80px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background decoration */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-25%',
                    width: '150%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)',
                    pointerEvents: 'none'
                }} />
                
                {/* Logo */}
                <Link to="/" style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    textDecoration: 'none', 
                    color: '#ffffff',
                    marginBottom: '32px'
                }}>
                    <Link2 style={{ width: '32px', height: '32px' }} />
                    <span style={{ fontSize: '20px', fontWeight: 'bold' }}>AngoraLinks</span>
                </Link>
                
                {/* Invitation badge */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)',
                    padding: '10px 20px',
                    borderRadius: '50px',
                    marginBottom: '24px'
                }}>
                    <Gift style={{ width: '20px', height: '20px' }} />
                    <span style={{ fontWeight: '500' }}>Zostałeś zaproszony!</span>
                </div>
                
                {/* Main heading */}
                <h1 style={{
                    fontSize: 'clamp(28px, 6vw, 48px)',
                    fontWeight: 'bold',
                    marginBottom: '16px',
                    lineHeight: '1.2',
                    maxWidth: '600px',
                    margin: '0 auto 16px'
                }}>
                    Zarabiaj na każdym kliknięciu w Twój link
                </h1>
                
                <p style={{
                    fontSize: '18px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    maxWidth: '500px',
                    margin: '0 auto 32px',
                    lineHeight: '1.6'
                }}>
                    Skracaj linki, udostępniaj je i zarabiaj pieniądze. 
                    To proste i całkowicie darmowe!
                </p>
                
                {/* CTA Button */}
                <button
                    onClick={handleRegisterClick}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        backgroundColor: '#ffffff',
                        color: '#4f46e5',
                        padding: '16px 32px',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.4)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.3)';
                    }}
                >
                    Dołącz teraz - Za darmo
                    <ArrowRight style={{ width: '20px', height: '20px' }} />
                </button>
                
                {/* Commission info */}
                <p style={{
                    marginTop: '16px',
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)'
                }}>
                    <CheckCircle style={{ 
                        width: '16px', 
                        height: '16px', 
                        display: 'inline', 
                        verticalAlign: 'middle',
                        marginRight: '6px'
                    }} />
                    Twój polecający otrzyma {settings?.commissionRate || 10}% prowizji
                </p>
            </div>

            {/* How it works section */}
            <div style={{
                padding: '60px 16px',
                maxWidth: '1000px',
                margin: '0 auto'
            }}>
                <h2 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '48px'
                }}>
                    Jak to działa?
                </h2>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px'
                }}>
                    {/* Step 1 */}
                    <div style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid #334155',
                        borderRadius: '16px',
                        padding: '28px 24px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            backgroundColor: 'rgba(14, 165, 233, 0.2)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <Link2 style={{ width: '28px', height: '28px', color: '#0ea5e9' }} />
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#0ea5e9',
                            fontWeight: '600',
                            marginBottom: '8px'
                        }}>
                            Krok 1
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                            Utwórz skrócony link
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                            Wklej dowolny URL i otrzymaj krótki, łatwy do udostępnienia link
                        </p>
                    </div>
                    
                    {/* Step 2 */}
                    <div style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid #334155',
                        borderRadius: '16px',
                        padding: '28px 24px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <Users style={{ width: '28px', height: '28px', color: '#22c55e' }} />
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#22c55e',
                            fontWeight: '600',
                            marginBottom: '8px'
                        }}>
                            Krok 2
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                            Udostępnij link
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                            Podziel się linkiem na social mediach, forach, stronach czy w wiadomościach
                        </p>
                    </div>
                    
                    {/* Step 3 */}
                    <div style={{
                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid #334155',
                        borderRadius: '16px',
                        padding: '28px 24px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            backgroundColor: 'rgba(234, 179, 8, 0.2)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <DollarSign style={{ width: '28px', height: '28px', color: '#eab308' }} />
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#eab308',
                            fontWeight: '600',
                            marginBottom: '8px'
                        }}>
                            Krok 3
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                            Zarabiaj pieniądze
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                            Otrzymujesz płatność za każdą unikalną wizytę. Wypłata przez PayPal lub Bitcoin
                        </p>
                    </div>
                </div>
            </div>

            {/* Features section */}
            <div style={{
                padding: '40px 16px 60px',
                backgroundColor: 'rgba(30, 41, 59, 0.3)'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginBottom: '48px'
                    }}>
                        Dlaczego AngoraLinks?
                    </h2>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '20px'
                    }}>
                        {/* Feature 1 */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            padding: '16px'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: 'rgba(14, 165, 233, 0.2)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <TrendingUp style={{ width: '20px', height: '20px', color: '#0ea5e9' }} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                                    Wysokie stawki CPM
                                </h4>
                                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>
                                    Konkurencyjne stawki zależne od kraju odwiedzającego
                                </p>
                            </div>
                        </div>
                        
                        {/* Feature 2 */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            padding: '16px'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Zap style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                                    Szybkie wypłaty
                                </h4>
                                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>
                                    Wypłata od $5 przez PayPal, Bitcoin lub przelew
                                </p>
                            </div>
                        </div>
                        
                        {/* Feature 3 */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            padding: '16px'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Globe style={{ width: '20px', height: '20px', color: '#a855f7' }} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                                    Globalny zasięg
                                </h4>
                                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>
                                    Zarabiaj na wizytach z całego świata
                                </p>
                            </div>
                        </div>
                        
                        {/* Feature 4 */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            padding: '16px'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: 'rgba(234, 179, 8, 0.2)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Shield style={{ width: '20px', height: '20px', color: '#eab308' }} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                                    Bezpieczeństwo
                                </h4>
                                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>
                                    Szyfrowane dane i ochrona przed fraudem
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Referral bonus section */}
            <div style={{
                padding: '60px 16px',
                maxWidth: '600px',
                margin: '0 auto',
                textAlign: 'center'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%)',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    borderRadius: '20px',
                    padding: '32px 24px'
                }}>
                    <Gift style={{ 
                        width: '48px', 
                        height: '48px', 
                        color: '#a855f7',
                        marginBottom: '16px'
                    }} />
                    
                    <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px' }}>
                        Program Poleceń
                    </h3>
                    
                    <p style={{ 
                        color: '#94a3b8', 
                        marginBottom: '20px',
                        lineHeight: '1.6'
                    }}>
                        Po rejestracji otrzymasz własny link polecający. 
                        Zapraszaj znajomych i zarabiaj <strong style={{ color: '#a855f7' }}>
                        {settings?.commissionRate || 10}% prowizji</strong> od ich zarobków - na zawsze!
                    </p>
                    
                    <button
                        onClick={handleRegisterClick}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#7c3aed',
                            color: '#ffffff',
                            padding: '14px 28px',
                            borderRadius: '10px',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Zacznij zarabiać
                        <ArrowRight style={{ width: '18px', height: '18px' }} />
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                borderTop: '1px solid #334155',
                padding: '24px 16px',
                textAlign: 'center'
            }}>
                <Link to="/" style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    textDecoration: 'none', 
                    color: '#64748b',
                    fontSize: '14px'
                }}>
                    <Link2 style={{ width: '16px', height: '16px' }} />
                    AngoraLinks
                </Link>
                <p style={{ color: '#475569', fontSize: '12px', marginTop: '8px' }}>
                    © 2024 AngoraLinks. Wszystkie prawa zastrzeżone.
                </p>
            </div>
        </div>
    );
}

export default RefLanding;