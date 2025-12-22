import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Link2, DollarSign, Globe, ChevronDown, ChevronUp, 
    TrendingUp, Info, Loader2, ArrowLeft, Shield,
    BarChart3, Wallet, User, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

function CpmRates() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [cpmRates, setCpmRates] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedTier, setExpandedTier] = useState('tier1'); // Domyślnie rozwinięty Tier 1

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(userData));
        fetchCpmRates();
    }, [navigate]);

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

    // Helper: flaga kraju
    const getFlagEmoji = (countryCode) => {
        if (!countryCode || countryCode === 'XX') return '🌍';
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    };

    // Helper: średnia stawka
    const getAverageRate = (tierRates) => {
        if (!tierRates || !tierRates.length) return '0.00';
        const sum = tierRates.reduce((acc, r) => acc + r.netCpm, 0);
        return (sum / tierRates.length).toFixed(2);
    };

    // Helper: max stawka
    const getMaxRate = (tierRates) => {
        if (!tierRates || !tierRates.length) return '0.00';
        return Math.max(...tierRates.map(r => r.netCpm)).toFixed(2);
    };

    // Helper: min stawka
    const getMinRate = (tierRates) => {
        if (!tierRates || !tierRates.length) return '0.00';
        return Math.min(...tierRates.map(r => r.netCpm)).toFixed(2);
    };

    // Tier config
    const tierConfig = {
        tier1: {
            name: 'Tier 1',
            label: 'Premium Countries',
            description: 'Highest paying countries with premium ad rates',
            emoji: '🥇',
            textColor: '#eab308',
            bgColor: 'rgba(234, 179, 8, 0.1)',
            borderColor: 'rgba(234, 179, 8, 0.3)',
            gradientFrom: '#eab308',
            gradientTo: '#f59e0b'
        },
        tier2: {
            name: 'Tier 2',
            label: 'Good Countries',
            description: 'Good earning potential with decent ad rates',
            emoji: '🥈',
            textColor: '#94a3b8',
            bgColor: 'rgba(148, 163, 184, 0.1)',
            borderColor: 'rgba(148, 163, 184, 0.3)',
            gradientFrom: '#64748b',
            gradientTo: '#94a3b8'
        },
        tier3: {
            name: 'Tier 3',
            label: 'Other Countries',
            description: 'Standard rates for other regions',
            emoji: '🥉',
            textColor: '#f97316',
            bgColor: 'rgba(249, 115, 22, 0.1)',
            borderColor: 'rgba(249, 115, 22, 0.3)',
            gradientFrom: '#ea580c',
            gradientTo: '#f97316'
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
                backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                position: 'sticky', 
                top: 0, 
                zIndex: 50,
                backdropFilter: 'blur(8px)'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                            <Link2 style={{ width: '32px', height: '32px', color: '#0ea5e9' }} />
                            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>AngoraLinks</span>
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Saldo</p>
                                <p style={{ fontWeight: '600', color: '#0ea5e9', margin: 0 }}>
                                    ${user?.balance?.toFixed(4) || '0.0000'}
                                </p>
                            </div>
                            {user?.isAdmin && (
                                <Link
                                    to="/admin"
                                    style={{ padding: '8px', color: '#ef4444', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                                    title="Panel Admina"
                                >
                                    <Shield style={{ width: '20px', height: '20px' }} />
                                </Link>
                            )}
                            <Link
                                to="/stats"
                                style={{ padding: '8px', color: '#94a3b8', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                                title="Statystyki"
                            >
                                <BarChart3 style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <Link
                                to="/cpm-rates"
                                style={{ padding: '8px', color: '#22c55e', borderRadius: '8px', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                                title="Stawki CPM"
                            >
                                <Globe style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <Link
                                to="/payouts"
                                style={{ padding: '8px', color: '#94a3b8', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                                title="Wypłaty"
                            >
                                <Wallet style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <Link
                                to="/profile"
                                style={{ padding: '8px', color: '#94a3b8', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
                                title="Profil"
                            >
                                <User style={{ width: '20px', height: '20px' }} />
                            </Link>
                            <button
                                onClick={handleLogout}
                                style={{ padding: '8px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                title="Wyloguj"
                            >
                                <LogOut style={{ width: '20px', height: '20px' }} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
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
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ 
                                width: '56px', 
                                height: '56px', 
                                background: 'linear-gradient(135deg, #22c55e, #10b981)', 
                                borderRadius: '16px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }}>
                                <Globe style={{ width: '28px', height: '28px', color: '#ffffff' }} />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>CPM Rates</h1>
                                <p style={{ fontSize: '16px', color: '#94a3b8', margin: 0 }}>
                                    Your earnings per 1000 views by country
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
                                border: '1px solid #334155'
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
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '16px', 
                        marginBottom: '32px' 
                    }}>
                        {Object.entries(cpmRates.tiers).map(([tierKey, tierRates]) => {
                            const config = tierConfig[tierKey];
                            return (
                                <div 
                                    key={tierKey}
                                    style={{ 
                                        backgroundColor: config.bgColor,
                                        border: `1px solid ${config.borderColor}`,
                                        borderRadius: '16px',
                                        padding: '20px',
                                        textAlign: 'center'
                                    }}
                                >
                                    <span style={{ fontSize: '32px' }}>{config.emoji}</span>
                                    <h3 style={{ 
                                        fontSize: '18px', 
                                        fontWeight: '600', 
                                        color: config.textColor,
                                        margin: '8px 0 4px'
                                    }}>
                                        {config.name}
                                    </h3>
                                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', margin: '8px 0' }}>
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
                                            padding: '20px 24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            background: config.bgColor,
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'inherit'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <span style={{ fontSize: '36px' }}>{config.emoji}</span>
                                            <div style={{ textAlign: 'left' }}>
                                                <h4 style={{ 
                                                    fontSize: '20px', 
                                                    fontWeight: '600', 
                                                    color: config.textColor,
                                                    margin: 0
                                                }}>
                                                    {config.name} - {config.label}
                                                </h4>
                                                <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0' }}>
                                                    {config.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>
                                                    ${getMinRate(tierRates)} - ${getMaxRate(tierRates)}
                                                </p>
                                                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                                                    CPM Range • {tierRates.length} countries
                                                </p>
                                            </div>
                                            {isExpanded ? (
                                                <ChevronUp style={{ width: '24px', height: '24px', color: '#94a3b8' }} />
                                            ) : (
                                                <ChevronDown style={{ width: '24px', height: '24px', color: '#94a3b8' }} />
                                            )}
                                        </div>
                                    </button>

                                    {/* Expanded Countries Grid */}
                                    {isExpanded && (
                                        <div style={{ 
                                            borderTop: '1px solid rgba(71, 85, 105, 0.3)',
                                            padding: '24px',
                                            backgroundColor: 'rgba(15, 23, 42, 0.3)'
                                        }}>
                                            <div style={{ 
                                                display: 'grid', 
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                                gap: '16px'
                                            }}>
                                                {tierRates
                                                    .sort((a, b) => b.netCpm - a.netCpm)
                                                    .map((rate) => (
                                                    <div 
                                                        key={rate.countryCode}
                                                        style={{
                                                            backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                                            borderRadius: '12px',
                                                            padding: '16px',
                                                            border: '1px solid #334155',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                            <span style={{ fontSize: '28px' }}>
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
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            <div style={{ 
                                                                display: 'flex', 
                                                                justifyContent: 'space-between', 
                                                                alignItems: 'center',
                                                                padding: '8px 12px',
                                                                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                                                                borderRadius: '8px'
                                                            }}>
                                                                <span style={{ fontSize: '13px', color: '#94a3b8' }}>CPM</span>
                                                                <span style={{ 
                                                                    fontSize: '16px', 
                                                                    fontWeight: '600', 
                                                                    color: config.textColor 
                                                                }}>
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
                                                                border: '1px solid rgba(34, 197, 94, 0.2)'
                                                            }}>
                                                                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Per click</span>
                                                                <span style={{ 
                                                                    fontSize: '16px', 
                                                                    fontWeight: '700', 
                                                                    color: '#22c55e' 
                                                                }}>
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
                    marginTop: '32px',
                    padding: '24px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
                    borderRadius: '16px',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
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
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: '0 0 8px' }}>
                                💡 Tips to maximize earnings
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', lineHeight: '1.8' }}>
                                <li>
                                    Share links on platforms with <span style={{ color: '#eab308', fontWeight: '600' }}>Tier 1 audience</span> (US, UK, Germany, Canada)
                                </li>
                                <li>
                                    Post during <span style={{ color: '#22c55e', fontWeight: '600' }}>peak hours</span> in target countries (9 AM - 9 PM local time)
                                </li>
                                <li>
                                    Use <span style={{ color: '#8b5cf6', fontWeight: '600' }}>social media</span> platforms popular in high-paying countries
                                </li>
                                <li>
                                    Create <span style={{ color: '#0ea5e9', fontWeight: '600' }}>engaging content</span> that attracts international audience
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