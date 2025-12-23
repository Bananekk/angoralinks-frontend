// CpmRates.jsx - RESPONSYWNY
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Link2, DollarSign, Globe, ChevronDown, ChevronUp, 
    TrendingUp, Info, Loader2, ArrowLeft, Shield,
    BarChart3, Wallet, User, LogOut, Menu, X
} from 'lucide-react';
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
        isMobile: windowSize.width < 768,
        isTablet: windowSize.width >= 768 && windowSize.width < 1024
    };
};

function CpmRates() {
    const navigate = useNavigate();
    const { isMobile, isTablet } = useWindowSize();
    
    const [user, setUser] = useState(null);
    const [cpmRates, setCpmRates] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedTier, setExpandedTier] = useState('tier1');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(userData));
        fetchCpmRates();
    }, [navigate]);

    useEffect(() => {
        if (!isMobile) setMobileMenuOpen(false);
    }, [isMobile]);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [mobileMenuOpen]);

    const fetchCpmRates = async () => {
        try {
            const response = await api.get('/cpm/rates');
            setCpmRates(response.data.data);
        } catch (error) {
            toast.error('Błąd pobierania stawek CPM');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        toast.success('Wylogowano');
    };

    const getFlagEmoji = (countryCode) => {
        if (!countryCode || countryCode === 'XX') return '🌍';
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    };

    const getMaxRate = (tierRates) => {
        if (!tierRates || !tierRates.length) return '0.00';
        return Math.max(...tierRates.map(r => r.netCpm)).toFixed(2);
    };

    const getMinRate = (tierRates) => {
        if (!tierRates || !tierRates.length) return '0.00';
        return Math.min(...tierRates.map(r => r.netCpm)).toFixed(2);
    };

    const tierConfig = {
        tier1: {
            name: 'Tier 1',
            label: 'Premium Countries',
            description: 'Highest paying countries with premium ad rates',
            emoji: '🥇',
            textColor: '#eab308',
            bgColor: 'rgba(234, 179, 8, 0.1)',
            borderColor: 'rgba(234, 179, 8, 0.3)'
        },
        tier2: {
            name: 'Tier 2',
            label: 'Good Countries',
            description: 'Good earning potential with decent ad rates',
            emoji: '🥈',
            textColor: '#94a3b8',
            bgColor: 'rgba(148, 163, 184, 0.1)',
            borderColor: 'rgba(148, 163, 184, 0.3)'
        },
        tier3: {
            name: 'Tier 3',
            label: 'Other Countries',
            description: 'Standard rates for other regions',
            emoji: '🥉',
            textColor: '#f97316',
            bgColor: 'rgba(249, 115, 22, 0.1)',
            borderColor: 'rgba(249, 115, 22, 0.3)'
        }
    };

    // Styles
    const styles = {
        mobileMenuOverlay: {
            display: mobileMenuOpen ? 'block' : 'none',
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 100
        },
        mobileMenuDrawer: {
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
        },
        mobileMenuItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            color: '#f8fafc',
            textDecoration: 'none',
            borderBottom: '1px solid #334155'
        }
    };

    if (loading) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: '#0f172a' 
            }}>
                <Loader2 className="animate-spin" style={{ width: '32px', height: '32px', color: '#0ea5e9' }} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc' }}>
            {/* Navbar */}
            <nav style={{ 
                borderBottom: '1px solid #1e293b', 
                backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                position: 'sticky', 
                top: 0, 
                zIndex: 50,
                backdropFilter: 'blur(8px)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '0 12px' : '0 16px' }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        height: isMobile ? '56px' : '64px' 
                    }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                            <Link2 style={{ width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px', color: '#0ea5e9' }} />
                            <span style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 'bold' }}>AngoraLinks</span>
                        </Link>

                        {/* Desktop Nav */}
                        {!isMobile && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Saldo</p>
                                    <p style={{ fontWeight: '600', color: '#0ea5e9', margin: 0 }}>
                                        ${user?.balance?.toFixed(4) || '0.0000'}
                                    </p>
                                </div>
                                {user?.isAdmin && (
                                    <Link to="/admin" style={{ padding: '8px', color: '#ef4444', display: 'flex' }} title="Admin">
                                        <Shield style={{ width: '20px', height: '20px' }} />
                                    </Link>
                                )}
                                <Link to="/dashboard" style={{ padding: '8px', color: '#94a3b8', display: 'flex' }} title="Dashboard">
                                    <Link2 style={{ width: '20px', height: '20px' }} />
                                </Link>
                                <Link to="/stats" style={{ padding: '8px', color: '#94a3b8', display: 'flex' }} title="Statystyki">
                                    <BarChart3 style={{ width: '20px', height: '20px' }} />
                                </Link>
                                <Link to="/cpm-rates" style={{ padding: '8px', color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', display: 'flex' }} title="CPM">
                                    <Globe style={{ width: '20px', height: '20px' }} />
                                </Link>
                                <Link to="/payouts" style={{ padding: '8px', color: '#94a3b8', display: 'flex' }} title="Wypłaty">
                                    <Wallet style={{ width: '20px', height: '20px' }} />
                                </Link>
                                <Link to="/profile" style={{ padding: '8px', color: '#94a3b8', display: 'flex' }} title="Profil">
                                    <User style={{ width: '20px', height: '20px' }} />
                                </Link>
                                <button onClick={handleLogout} style={{ padding: '8px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }} title="Wyloguj">
                                    <LogOut style={{ width: '20px', height: '20px' }} />
                                </button>
                            </div>
                        )}

                        {/* Mobile: Balance + Hamburger */}
                        {isMobile && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ textAlign: 'right', marginRight: '4px' }}>
                                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Saldo</p>
                                    <p style={{ fontWeight: '600', color: '#0ea5e9', margin: 0, fontSize: '14px' }}>
                                        ${user?.balance?.toFixed(4) || '0.0000'}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setMobileMenuOpen(true)}
                                    style={{ padding: '8px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Menu style={{ width: '24px', height: '24px' }} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div style={styles.mobileMenuOverlay} onClick={() => setMobileMenuOpen(false)} />

            {/* Mobile Menu Drawer */}
            <div style={styles.mobileMenuDrawer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #334155' }}>
                    <span style={{ fontWeight: '600', fontSize: '18px' }}>Menu</span>
                    <button onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        <X style={{ width: '24px', height: '24px' }} />
                    </button>
                </div>
                <div style={{ padding: '16px', borderBottom: '1px solid #334155', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px 0' }}>Twoje saldo</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9', margin: 0 }}>
                        ${user?.balance?.toFixed(4) || '0.0000'}
                    </p>
                </div>
                <div style={{ flex: 1, overflow: 'auto' }}>
                    {user?.isAdmin && (
                        <Link to="/admin" style={{ ...styles.mobileMenuItem, color: '#ef4444' }} onClick={() => setMobileMenuOpen(false)}>
                            <Shield style={{ width: '20px', height: '20px' }} /> Panel Admina
                        </Link>
                    )}
                    <Link to="/dashboard" style={styles.mobileMenuItem} onClick={() => setMobileMenuOpen(false)}>
                        <Link2 style={{ width: '20px', height: '20px' }} /> Dashboard
                    </Link>
                    <Link to="/stats" style={styles.mobileMenuItem} onClick={() => setMobileMenuOpen(false)}>
                        <BarChart3 style={{ width: '20px', height: '20px' }} /> Statystyki
                    </Link>
                    <Link to="/cpm-rates" style={{ ...styles.mobileMenuItem, color: '#22c55e' }} onClick={() => setMobileMenuOpen(false)}>
                        <Globe style={{ width: '20px', height: '20px' }} /> Stawki CPM
                    </Link>
                    <Link to="/payouts" style={styles.mobileMenuItem} onClick={() => setMobileMenuOpen(false)}>
                        <Wallet style={{ width: '20px', height: '20px' }} /> Wypłaty
                    </Link>
                    <Link to="/profile" style={styles.mobileMenuItem} onClick={() => setMobileMenuOpen(false)}>
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

            {/* Main Content */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '16px 12px' : '32px 16px' }}>
                {/* Header */}
                <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
                    <Link 
                        to="/dashboard" 
                        style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            color: '#94a3b8', 
                            textDecoration: 'none',
                            marginBottom: '16px',
                            fontSize: '14px'
                        }}
                    >
                        <ArrowLeft style={{ width: '16px', height: '16px' }} />
                        Powrót do Dashboard
                    </Link>
                    
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'flex-start' : 'center', 
                        justifyContent: 'space-between', 
                        gap: '16px' 
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ 
                                width: isMobile ? '48px' : '56px', 
                                height: isMobile ? '48px' : '56px', 
                                background: 'linear-gradient(135deg, #22c55e, #10b981)', 
                                borderRadius: '16px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Globe style={{ width: isMobile ? '24px' : '28px', height: isMobile ? '24px' : '28px', color: '#ffffff' }} />
                            </div>
                            <div>
                                <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold', margin: 0 }}>CPM Rates</h1>
                                <p style={{ fontSize: isMobile ? '14px' : '16px', color: '#94a3b8', margin: 0 }}>
                                    Your earnings per 1000 views
                                </p>
                            </div>
                        </div>
                        
                        {cpmRates && (
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                padding: '10px 16px', 
                                backgroundColor: 'rgba(71, 85, 105, 0.5)', 
                                borderRadius: '12px',
                                border: '1px solid #334155',
                                width: isMobile ? '100%' : 'auto',
                                justifyContent: isMobile ? 'center' : 'flex-start'
                            }}>
                                <Info style={{ width: '18px', height: '18px', color: '#94a3b8' }} />
                                <span style={{ fontSize: '14px', color: '#cbd5e1' }}>
                                    Platform fee: <strong style={{ color: '#f8fafc' }}>{cpmRates.commissionPercent}</strong>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Cards */}
                {cpmRates && (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', 
                        gap: isMobile ? '12px' : '16px', 
                        marginBottom: isMobile ? '20px' : '32px' 
                    }}>
                        {Object.entries(cpmRates.tiers).map(([tierKey, tierRates]) => {
                            const config = tierConfig[tierKey];
                            return (
                                <div 
                                    key={tierKey}
                                    onClick={() => setExpandedTier(tierKey)}
                                    style={{ 
                                        backgroundColor: config.bgColor,
                                        border: `1px solid ${config.borderColor}`,
                                        borderRadius: '16px',
                                        padding: isMobile ? '16px' : '20px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s'
                                    }}
                                >
                                    <span style={{ fontSize: isMobile ? '28px' : '32px' }}>{config.emoji}</span>
                                    <h3 style={{ 
                                        fontSize: isMobile ? '16px' : '18px', 
                                        fontWeight: '600', 
                                        color: config.textColor,
                                        margin: '8px 0 4px'
                                    }}>
                                        {config.name}
                                    </h3>
                                    <p style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#ffffff', margin: '8px 0' }}>
                                        ${getMinRate(tierRates)} - ${getMaxRate(tierRates)}
                                    </p>
                                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                                        {tierRates.length} countries
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Tier Sections */}
                {cpmRates ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {Object.entries(cpmRates.tiers).map(([tierKey, tierRates]) => {
                            const config = tierConfig[tierKey];
                            const isExpanded = expandedTier === tierKey;

                            return (
                                <div 
                                    key={tierKey}
                                    style={{ 
                                        border: `1px solid ${config.borderColor}`,
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        backgroundColor: 'rgba(30, 41, 59, 0.5)'
                                    }}
                                >
                                    {/* Tier Header */}
                                    <button
                                        onClick={() => setExpandedTier(isExpanded ? null : tierKey)}
                                        style={{
                                            width: '100%',
                                            padding: isMobile ? '16px' : '20px 24px',
                                            display: 'flex',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            alignItems: isMobile ? 'flex-start' : 'center',
                                            justifyContent: 'space-between',
                                            gap: isMobile ? '12px' : '16px',
                                            background: config.bgColor,
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'inherit',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: isMobile ? '28px' : '36px' }}>{config.emoji}</span>
                                            <div>
                                                <h4 style={{ 
                                                    fontSize: isMobile ? '16px' : '20px', 
                                                    fontWeight: '600', 
                                                    color: config.textColor,
                                                    margin: 0
                                                }}>
                                                    {config.name} - {config.label}
                                                </h4>
                                                <p style={{ fontSize: isMobile ? '12px' : '14px', color: '#94a3b8', margin: '4px 0 0', display: isMobile ? 'none' : 'block' }}>
                                                    {config.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: isMobile ? '12px' : '24px',
                                            width: isMobile ? '100%' : 'auto',
                                            justifyContent: isMobile ? 'space-between' : 'flex-end'
                                        }}>
                                            <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                                                <p style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>
                                                    ${getMinRate(tierRates)} - ${getMaxRate(tierRates)}
                                                </p>
                                                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                                                    CPM • {tierRates.length} countries
                                                </p>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp style={{ width: '24px', height: '24px', color: '#94a3b8', flexShrink: 0 }} />
                                            ) : (
                                                <ChevronDown style={{ width: '24px', height: '24px', color: '#94a3b8', flexShrink: 0 }} />
                                            )}
                                        </div>
                                    </button>

                                    {/* Expanded Countries Grid */}
                                    {isExpanded && (
                                        <div style={{ 
                                            borderTop: '1px solid rgba(71, 85, 105, 0.3)',
                                            padding: isMobile ? '16px' : '24px',
                                            backgroundColor: 'rgba(15, 23, 42, 0.3)'
                                        }}>
                                            <div style={{ 
                                                display: 'grid', 
                                                gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))',
                                                gap: isMobile ? '12px' : '16px'
                                            }}>
                                                {tierRates
                                                    .sort((a, b) => b.netCpm - a.netCpm)
                                                    .map((rate) => (
                                                    <div 
                                                        key={rate.countryCode}
                                                        style={{
                                                            backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                                            borderRadius: '12px',
                                                            padding: isMobile ? '14px' : '16px',
                                                            border: '1px solid #334155'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                            <span style={{ fontSize: isMobile ? '24px' : '28px' }}>
                                                                {getFlagEmoji(rate.countryCode)}
                                                            </span>
                                                            <div>
                                                                <span style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>
                                                                    {rate.countryCode}
                                                                </span>
                                                                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                                                                    {rate.countryName}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '8px' }}>
                                                            <div style={{ 
                                                                display: 'flex', 
                                                                justifyContent: 'space-between', 
                                                                alignItems: 'center',
                                                                padding: '8px 12px',
                                                                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                                                                borderRadius: '8px',
                                                                flex: isMobile ? 1 : 'none'
                                                            }}>
                                                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>CPM</span>
                                                                <span style={{ fontSize: '14px', fontWeight: '600', color: config.textColor }}>
                                                                    ${rate.netCpm.toFixed(2)}
                                                                </span>
                                                            </div>
                                                            <div style={{ 
                                                                display: 'flex', 
                                                                justifyContent: 'space-between', 
                                                                alignItems: 'center',
                                                                padding: '8px 12px',
                                                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                                borderRadius: '8px',
                                                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                                                flex: isMobile ? 1 : 'none'
                                                            }}>
                                                                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Click</span>
                                                                <span style={{ fontSize: '14px', fontWeight: '700', color: '#22c55e' }}>
                                                                    ${rate.earningPerClick.toFixed(4)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ 
                        backgroundColor: 'rgba(30, 41, 59, 0.5)', 
                        border: '1px solid #334155', 
                        borderRadius: '16px',
                        padding: '48px',
                        textAlign: 'center'
                    }}>
                        <p style={{ color: '#94a3b8' }}>Unable to load CPM rates</p>
                    </div>
                )}

                {/* Pro Tips */}
                <div style={{ 
                    marginTop: isMobile ? '20px' : '32px',
                    padding: isMobile ? '16px' : '24px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
                    borderRadius: '16px',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                    <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'flex-start', gap: '16px', flexDirection: isMobile ? 'column' : 'row' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <TrendingUp style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600', color: '#ffffff', margin: '0 0 8px' }}>
                                💡 Tips to maximize earnings
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', lineHeight: '1.8', fontSize: isMobile ? '14px' : '16px' }}>
                                <li>
                                    Share links on platforms with <span style={{ color: '#eab308', fontWeight: '600' }}>Tier 1 audience</span>
                                </li>
                                <li>
                                    Post during <span style={{ color: '#22c55e', fontWeight: '600' }}>peak hours</span> (9 AM - 9 PM local time)
                                </li>
                                <li>
                                    Use <span style={{ color: '#8b5cf6', fontWeight: '600' }}>social media</span> popular in high-paying countries
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default CpmRates;