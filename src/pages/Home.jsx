// Home.jsx - NAPRAWIONY
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ArrowRight, DollarSign, Link2, Shield, Zap, 
    User, LayoutDashboard, LogOut, Wallet, BarChart3,
    ChevronRight, Globe, Clock, TrendingUp, Users,
    Menu, X
} from 'lucide-react';
import api from '../api/axios';

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
        isMobile: windowSize.width < 768,
        isTablet: windowSize.width >= 768 && windowSize.width < 1024,
        isDesktop: windowSize.width >= 1024
    };
};

function Home() {
    const navigate = useNavigate();
    const { isMobile } = useWindowSize();
    
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [publicStats, setPublicStats] = useState({
        users: 0,
        clicks: 0,
        paidOut: 0,
        uptime: 99.9
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (userData && token) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error('Błąd parsowania danych użytkownika');
            }
        }
        
        fetchPublicStats();
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!isMobile) {
            setMobileMenuOpen(false);
        }
    }, [isMobile]);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    const fetchPublicStats = async () => {
        try {
            const response = await api.get('/stats/public');
            setPublicStats(response.data);
        } catch (error) {
            console.error('Błąd pobierania statystyk:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setMobileMenuOpen(false);
    };

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const mobileMenuStyles = {
        overlay: {
            display: mobileMenuOpen ? 'block' : 'none',
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 100,
            backdropFilter: 'blur(4px)'
        },
        drawer: {
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
            flexDirection: 'column',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.3)'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid #334155'
        },
        menuItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            color: '#f8fafc',
            textDecoration: 'none',
            borderBottom: '1px solid #334155',
            transition: 'background-color 0.2s'
        },
        closeButton: {
            padding: '8px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }
    };

    if (isLoading) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                backgroundColor: '#0f172a', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    border: '2px solid #0ea5e9',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
            {/* Navbar */}
            <nav style={{
                borderBottom: '1px solid #1e293b',
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(8px)',
                position: 'fixed',
                width: '100%',
                zIndex: 50
            }}>
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: isMobile ? '0 12px' : '0 24px'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: isMobile ? '56px' : '64px'
                    }}>
                        <Link to="/" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            textDecoration: 'none'
                        }}>
                            <Link2 style={{ width: '32px', height: '32px', color: '#0ea5e9' }} />
                            <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                                AngoraLinks
                            </span>
                        </Link>
                        
                        {!isMobile && (
                            <>
                                {user ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                            <span style={{ color: '#94a3b8' }}>Saldo:</span>
                                            <span style={{ color: '#22c55e', fontWeight: '600' }}>
                                                ${parseFloat(user.balance || 0).toFixed(2)}
                                            </span>
                                        </div>
                                        <Link 
                                            to="/dashboard" 
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                backgroundColor: '#0ea5e9',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                fontWeight: '500',
                                                color: 'white',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <LayoutDashboard style={{ width: '16px', height: '16px' }} />
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                padding: '8px',
                                                color: '#94a3b8',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                            title="Wyloguj się"
                                        >
                                            <LogOut style={{ width: '20px', height: '20px' }} />
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <Link 
                                            to="/login" 
                                            style={{ color: '#cbd5e1', textDecoration: 'none' }}
                                        >
                                            Zaloguj się
                                        </Link>
                                        <Link 
                                            to="/register" 
                                            style={{
                                                backgroundColor: '#0ea5e9',
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                fontWeight: '500',
                                                color: 'white',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            Zarejestruj się
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}

                        {isMobile && (
                            <button 
                                onClick={() => setMobileMenuOpen(true)}
                                style={{
                                    padding: '8px',
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '44px',
                                    minHeight: '44px'
                                }}
                                aria-label="Otwórz menu"
                            >
                                <Menu style={{ width: '24px', height: '24px' }} />
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div 
                style={mobileMenuStyles.overlay}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu Drawer */}
            <div style={mobileMenuStyles.drawer}>
                <div style={mobileMenuStyles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link2 style={{ width: '24px', height: '24px', color: '#0ea5e9' }} />
                        <span style={{ fontWeight: '600', fontSize: '18px', color: 'white' }}>
                            AngoraLinks
                        </span>
                    </div>
                    <button 
                        onClick={() => setMobileMenuOpen(false)}
                        style={mobileMenuStyles.closeButton}
                        aria-label="Zamknij menu"
                    >
                        <X style={{ width: '24px', height: '24px' }} />
                    </button>
                </div>

                {user ? (
                    <>
                        <div style={{ 
                            padding: '16px', 
                            borderBottom: '1px solid #334155',
                            backgroundColor: 'rgba(14, 165, 233, 0.1)'
                        }}>
                            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px 0' }}>
                                Twoje saldo
                            </p>
                            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e', margin: 0 }}>
                                ${parseFloat(user.balance || 0).toFixed(2)}
                            </p>
                        </div>

                        <div style={{ flex: 1, overflow: 'auto' }}>
                            <Link 
                                to="/dashboard" 
                                style={{ ...mobileMenuStyles.menuItem, color: '#0ea5e9' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <LayoutDashboard style={{ width: '20px', height: '20px' }} />
                                Dashboard
                            </Link>
                            <Link 
                                to="/stats" 
                                style={mobileMenuStyles.menuItem}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <BarChart3 style={{ width: '20px', height: '20px' }} />
                                Statystyki
                            </Link>
                            <Link 
                                to="/payouts" 
                                style={mobileMenuStyles.menuItem}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Wallet style={{ width: '20px', height: '20px' }} />
                                Wypłaty
                            </Link>
                            <Link 
                                to="/cpm-rates" 
                                style={{ ...mobileMenuStyles.menuItem, color: '#22c55e' }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Globe style={{ width: '20px', height: '20px' }} />
                                Stawki CPM
                            </Link>
                            <Link 
                                to="/profile" 
                                style={mobileMenuStyles.menuItem}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <User style={{ width: '20px', height: '20px' }} />
                                Profil
                            </Link>
                        </div>

                        <div style={{ padding: '16px', borderTop: '1px solid #334155' }}>
                            <button
                                onClick={handleLogout}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    border: '1px solid #ef4444',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '14px'
                                }}
                            >
                                <LogOut style={{ width: '20px', height: '20px' }} />
                                Wyloguj się
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ flex: 1, padding: '16px' }}>
                            <Link 
                                to="/cpm-rates" 
                                style={{ 
                                    ...mobileMenuStyles.menuItem, 
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '8px'
                                }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Globe style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                                Stawki CPM
                            </Link>
                            <Link 
                                to="/terms" 
                                style={{ 
                                    ...mobileMenuStyles.menuItem, 
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '8px'
                                }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Shield style={{ width: '20px', height: '20px' }} />
                                Regulamin
                            </Link>
                            <Link 
                                to="/contact" 
                                style={{ 
                                    ...mobileMenuStyles.menuItem, 
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '8px'
                                }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <User style={{ width: '20px', height: '20px' }} />
                                Kontakt
                            </Link>
                        </div>

                        <div style={{ padding: '16px', borderTop: '1px solid #334155' }}>
                            <Link
                                to="/register"
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '14px',
                                    backgroundColor: '#0ea5e9',
                                    color: 'white',
                                    textAlign: 'center',
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    marginBottom: '12px',
                                    textDecoration: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Zarejestruj się
                            </Link>
                            <Link
                                to="/login"
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '14px',
                                    backgroundColor: 'transparent',
                                    color: '#f8fafc',
                                    textAlign: 'center',
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    border: '1px solid #475569',
                                    textDecoration: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Zaloguj się
                            </Link>
                        </div>
                    </>
                )}
            </div>

            {/* Hero Section - dla zalogowanych */}
            {user ? (
                <section style={{ 
                    paddingTop: isMobile ? '72px' : '96px', 
                    paddingBottom: isMobile ? '24px' : '64px',
                    paddingLeft: isMobile ? '12px' : '16px',
                    paddingRight: isMobile ? '12px' : '16px'
                }}>
                    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                            border: '1px solid rgba(14, 165, 233, 0.3)',
                            borderRadius: '16px',
                            padding: isMobile ? '20px' : '32px',
                            marginBottom: isMobile ? '20px' : '32px'
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                alignItems: isMobile ? 'flex-start' : 'center',
                                justifyContent: 'space-between',
                                gap: '24px'
                            }}>
                                <div>
                                    <h1 style={{ 
                                        fontSize: isMobile ? '24px' : '32px', 
                                        fontWeight: 'bold', 
                                        color: 'white',
                                        marginBottom: '8px'
                                    }}>
                                        Witaj, {user.email?.split('@')[0]}! 👋
                                    </h1>
                                    <p style={{ color: '#94a3b8', margin: 0 }}>
                                        Zarządzaj swoimi linkami i zarabiaj więcej.
                                    </p>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '16px',
                                    width: isMobile ? '100%' : 'auto'
                                }}>
                                    <div style={{ 
                                        textAlign: 'center', 
                                        padding: isMobile ? '12px 16px' : '12px 24px',
                                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                                        borderRadius: '12px',
                                        flex: isMobile ? 1 : 'none'
                                    }}>
                                        <p style={{ 
                                            fontSize: isMobile ? '20px' : '24px', 
                                            fontWeight: 'bold', 
                                            color: '#22c55e',
                                            margin: 0
                                        }}>
                                            ${parseFloat(user.balance || 0).toFixed(2)}
                                        </p>
                                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>
                                            Dostępne saldo
                                        </p>
                                    </div>
                                    <div style={{ 
                                        textAlign: 'center', 
                                        padding: isMobile ? '12px 16px' : '12px 24px',
                                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                                        borderRadius: '12px',
                                        flex: isMobile ? 1 : 'none'
                                    }}>
                                        <p style={{ 
                                            fontSize: isMobile ? '20px' : '24px', 
                                            fontWeight: 'bold', 
                                            color: '#0ea5e9',
                                            margin: 0
                                        }}>
                                            ${parseFloat(user.totalEarned || 0).toFixed(2)}
                                        </p>
                                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>
                                            Łącznie zarobione
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                            gap: isMobile ? '12px' : '16px'
                        }}>
                            {[
                                { to: '/dashboard', icon: LayoutDashboard, title: 'Dashboard', subtitle: 'Zarządzaj linkami', color: '#0ea5e9' },
                                { to: '/stats', icon: BarChart3, title: 'Statystyki', subtitle: 'Analizuj ruch', color: '#3b82f6' },
                                { to: '/payouts', icon: Wallet, title: 'Wypłaty', subtitle: 'Wypłać środki', color: '#22c55e' },
                                { to: '/profile', icon: User, title: 'Profil', subtitle: 'Ustawienia', color: '#a855f7' }
                            ].map((item, index) => (
                                <Link 
                                    key={index}
                                    to={item.to} 
                                    style={{
                                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                                        border: '1px solid #334155',
                                        padding: isMobile ? '16px' : '24px',
                                        borderRadius: '12px',
                                        textDecoration: 'none'
                                    }}
                                >
                                    <div style={{
                                        width: isMobile ? '40px' : '48px',
                                        height: isMobile ? '40px' : '48px',
                                        backgroundColor: `${item.color}20`,
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: isMobile ? '12px' : '16px'
                                    }}>
                                        <item.icon style={{ 
                                            width: isMobile ? '20px' : '24px', 
                                            height: isMobile ? '20px' : '24px', 
                                            color: item.color 
                                        }} />
                                    </div>
                                    <h3 style={{ 
                                        fontSize: isMobile ? '14px' : '18px', 
                                        fontWeight: '600', 
                                        color: 'white',
                                        marginBottom: '4px'
                                    }}>
                                        {item.title}
                                    </h3>
                                    {!isMobile && (
                                        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                                            {item.subtitle}
                                        </p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            ) : (
                <section style={{ 
                    paddingTop: isMobile ? '80px' : '128px', 
                    paddingBottom: isMobile ? '40px' : '80px',
                    paddingLeft: '16px',
                    paddingRight: '16px'
                }}>
                    <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: 'rgba(14, 165, 233, 0.2)',
                            border: '1px solid rgba(14, 165, 233, 0.3)',
                            borderRadius: '9999px',
                            padding: '8px 16px',
                            marginBottom: '24px'
                        }}>
                            <Zap style={{ width: '16px', height: '16px', color: '#0ea5e9' }} />
                            <span style={{ fontSize: '14px', color: '#38bdf8' }}>
                                Najlepsza platforma do zarabiania na linkach
                            </span>
                        </div>

                        <h1 style={{ 
                            fontSize: isMobile ? '36px' : '72px', 
                            fontWeight: 'bold', 
                            marginBottom: '24px',
                            color: 'white',
                            lineHeight: 1.1
                        }}>
                            Zarabiaj na{' '}
                            <span style={{ color: '#0ea5e9' }}>linkach</span>
                        </h1>

                        <p style={{ 
                            fontSize: isMobile ? '16px' : '20px', 
                            color: '#94a3b8', 
                            maxWidth: '640px',
                            margin: '0 auto 32px',
                            lineHeight: 1.6
                        }}>
                            Skracaj linki i zarabiaj pieniądze za każde kliknięcie. 
                            Dołącz do tysięcy użytkowników, którzy już zarabiają z AngoraLinks.
                        </p>

                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: '16px',
                            justifyContent: 'center'
                        }}>
                            <Link 
                                to="/register" 
                                style={{
                                    backgroundColor: '#0ea5e9',
                                    padding: isMobile ? '16px 24px' : '16px 32px',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    fontSize: isMobile ? '16px' : '18px',
                                    color: 'white',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                Zacznij zarabiać
                                <ArrowRight style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <Link 
                                to="/login" 
                                style={{
                                    backgroundColor: '#334155',
                                    padding: isMobile ? '16px 24px' : '16px 32px',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    fontSize: isMobile ? '16px' : '18px',
                                    color: 'white',
                                    textDecoration: 'none',
                                    textAlign: 'center'
                                }}
                            >
                                Mam już konto
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Features - tylko dla niezalogowanych */}
            {!user && (
                <section style={{ 
                    padding: isMobile ? '40px 16px' : '80px 16px',
                    backgroundColor: 'rgba(30, 41, 59, 0.3)'
                }}>
                    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                        <h2 style={{ 
                            fontSize: isMobile ? '24px' : '36px', 
                            fontWeight: 'bold', 
                            textAlign: 'center',
                            marginBottom: '16px',
                            color: 'white'
                        }}>
                            Dlaczego AngoraLinks?
                        </h2>
                        <p style={{ 
                            color: '#94a3b8', 
                            textAlign: 'center', 
                            maxWidth: '640px',
                            margin: `0 auto ${isMobile ? '32px' : '48px'}`
                        }}>
                            Oferujemy najlepsze warunki dla twórców treści i marketerów
                        </p>
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                            gap: isMobile ? '16px' : '32px'
                        }}>
                            {[
                                { 
                                    icon: DollarSign, 
                                    color: '#22c55e', 
                                    title: 'Wysokie stawki',
                                    desc: 'Zarabiaj do $3 CPM za ruch z krajów Tier 1. Konkurencyjne stawki dla całego świata.'
                                },
                                { 
                                    icon: Clock, 
                                    color: '#3b82f6', 
                                    title: 'Szybkie wypłaty',
                                    desc: 'Wypłaty już od $10. PayPal, Bitcoin, przelew bankowy. Otrzymaj pieniądze w 24h.'
                                },
                                { 
                                    icon: Shield, 
                                    color: '#a855f7', 
                                    title: 'Bezpieczne linki',
                                    desc: 'Wszystkie linki są sprawdzane. Ochrona przed złośliwym oprogramowaniem.'
                                }
                            ].map((feature, index) => (
                                <div key={index} style={{
                                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                                    padding: isMobile ? '24px' : '32px',
                                    borderRadius: '16px',
                                    border: '1px solid #334155'
                                }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        backgroundColor: `${feature.color}20`,
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '16px'
                                    }}>
                                        <feature.icon style={{ 
                                            width: '28px', 
                                            height: '28px', 
                                            color: feature.color 
                                        }} />
                                    </div>
                                    <h3 style={{ 
                                        fontSize: '20px', 
                                        fontWeight: '600', 
                                        marginBottom: '8px',
                                        color: 'white'
                                    }}>
                                        {feature.title}
                                    </h3>
                                    <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* How it works - dla niezalogowanych */}
            {!user && (
                <section style={{ padding: isMobile ? '40px 16px' : '80px 16px' }}>
                    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                        <h2 style={{ 
                            fontSize: isMobile ? '24px' : '36px', 
                            fontWeight: 'bold', 
                            textAlign: 'center',
                            marginBottom: '16px',
                            color: 'white'
                        }}>
                            Jak to działa?
                        </h2>
                        <p style={{ 
                            color: '#94a3b8', 
                            textAlign: 'center', 
                            marginBottom: isMobile ? '32px' : '48px'
                        }}>
                            Zacznij zarabiać w trzech prostych krokach
                        </p>
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                            gap: isMobile ? '24px' : '32px'
                        }}>
                            {[
                                { num: '1', title: 'Zarejestruj się', desc: 'Stwórz darmowe konto w kilka sekund. Bez ukrytych opłat.' },
                                { num: '2', title: 'Skróć link', desc: 'Wklej dowolny link i otrzymaj skrócony URL gotowy do udostępnienia.' },
                                { num: '3', title: 'Zarabiaj', desc: 'Udostępniaj link i zarabiaj za każde kliknięcie. To takie proste!' }
                            ].map((step, index) => (
                                <div key={index} style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        backgroundColor: '#0ea5e9',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 16px',
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: 'white'
                                    }}>
                                        {step.num}
                                    </div>
                                    <h3 style={{ 
                                        fontSize: '20px', 
                                        fontWeight: '600', 
                                        marginBottom: '8px',
                                        color: 'white'
                                    }}>
                                        {step.title}
                                    </h3>
                                    <p style={{ color: '#94a3b8', margin: 0 }}>{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Stats Section */}
            <section style={{ 
                padding: isMobile ? '40px 16px' : '80px 16px',
                backgroundColor: user ? 'rgba(30, 41, 59, 0.3)' : 'transparent'
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                        gap: isMobile ? '16px' : '32px'
                    }}>
                        {[
                            { icon: Users, value: formatNumber(publicStats.users), label: 'Użytkowników', color: '#0ea5e9' },
                            { icon: Globe, value: formatNumber(publicStats.clicks), label: 'Kliknięć', color: '#3b82f6' },
                            { icon: DollarSign, value: `$${formatNumber(publicStats.paidOut)}`, label: 'Wypłacone', color: '#22c55e' },
                            { icon: TrendingUp, value: `${publicStats.uptime}%`, label: 'Uptime', color: '#a855f7' }
                        ].map((stat, index) => (
                            <div key={index} style={{ 
                                padding: isMobile ? '20px' : '24px',
                                textAlign: 'center'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    marginBottom: '8px'
                                }}>
                                    <stat.icon style={{ 
                                        width: '24px', 
                                        height: '24px', 
                                        color: stat.color 
                                    }} />
                                </div>
                                <div style={{ 
                                    fontSize: isMobile ? '28px' : '40px', 
                                    fontWeight: 'bold',
                                    color: stat.color
                                }}>
                                    {stat.value}
                                </div>
                                <div style={{ color: '#94a3b8', marginTop: '8px' }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA dla niezalogowanych */}
            {!user && (
                <section style={{ padding: isMobile ? '40px 16px' : '80px 16px' }}>
                    <div style={{ maxWidth: '896px', margin: '0 auto' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #0ea5e9 0%, #a855f7 100%)',
                            borderRadius: '16px',
                            padding: isMobile ? '32px 20px' : '48px',
                            textAlign: 'center'
                        }}>
                            <h2 style={{ 
                                fontSize: isMobile ? '24px' : '36px', 
                                fontWeight: 'bold',
                                marginBottom: '16px',
                                color: 'white'
                            }}>
                                Gotowy, żeby zacząć zarabiać?
                            </h2>
                            <p style={{ 
                                fontSize: isMobile ? '16px' : '18px',
                                color: 'rgba(255,255,255,0.8)',
                                marginBottom: '32px'
                            }}>
                                Dołącz do {publicStats.users > 0 ? formatNumber(publicStats.users) : ''} użytkowników, którzy już zarabiają z AngoraLinks
                            </p>
                            <Link 
                                to="/register" 
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: 'white',
                                    color: '#0ea5e9',
                                    padding: isMobile ? '14px 24px' : '16px 32px',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    fontSize: isMobile ? '16px' : '18px',
                                    textDecoration: 'none'
                                }}
                            >
                                Zarejestruj się za darmo
                                <ArrowRight style={{ width: '20px', height: '20px' }} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer style={{ 
                borderTop: '1px solid #1e293b', 
                padding: isMobile ? '24px 16px' : '32px 16px',
                backgroundColor: '#0f172a'
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        textAlign: isMobile ? 'center' : 'left'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link2 style={{ width: '24px', height: '24px', color: '#0ea5e9' }} />
                            <span style={{ fontWeight: 'bold', color: 'white' }}>AngoraLinks</span>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                            © 2025 AngoraLinks. Wszystkie prawa zastrzeżone.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Link to="/terms" style={{ color: '#94a3b8', fontSize: '14px', textDecoration: 'none' }}>
                                Regulamin
                            </Link>
                            <Link to="/contact" style={{ color: '#94a3b8', fontSize: '14px', textDecoration: 'none' }}>
                                Kontakt
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;