// ReferralSection.jsx - Sekcja referali w Dashboard
import { useState, useEffect } from 'react';
import { 
    Users, 
    DollarSign, 
    Copy, 
    Check, 
    Gift,
    TrendingUp,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Loader2,
    AlertCircle,
    Share2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

function ReferralSection({ isMobile = false }) {
    const [stats, setStats] = useState(null);
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showReferrals, setShowReferrals] = useState(false);
    const [showCommissions, setShowCommissions] = useState(false);
    const [loadingCommissions, setLoadingCommissions] = useState(false);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/referrals/stats');
            setStats(response.data);
        } catch (err) {
            console.error('Failed to load referral stats:', err);
            setError('Nie udało się załadować statystyk referali');
        } finally {
            setLoading(false);
        }
    };

    const loadCommissions = async () => {
        if (commissions.length > 0) return;
        
        setLoadingCommissions(true);
        try {
            const response = await api.get('/referrals/commissions?limit=20');
            setCommissions(response.data.commissions || []);
        } catch (err) {
            console.error('Failed to load commissions:', err);
            toast.error('Błąd ładowania prowizji');
        } finally {
            setLoadingCommissions(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(stats?.referralLink);
            setCopied(true);
            toast.success('Skopiowano link polecający!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback dla starszych przeglądarek
            const textArea = document.createElement('textarea');
            textArea.value = stats?.referralLink;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            toast.success('Skopiowano link polecający!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareLink = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Dołącz do AngoraLinks',
                    text: 'Zarejestruj się przez mój link i zacznij zarabiać na skracaniu linków!',
                    url: stats?.referralLink
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    copyToClipboard();
                }
            }
        } else {
            copyToClipboard();
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatMoney = (amount) => {
        return `$${parseFloat(amount || 0).toFixed(4)}`;
    };

    // Styles
    const styles = {
        container: {
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid #334155',
            borderRadius: isMobile ? '12px' : '16px',
            overflow: 'hidden',
            marginBottom: isMobile ? '16px' : '24px'
        },
        header: {
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            padding: isMobile ? '16px' : '24px',
            color: '#ffffff'
        },
        headerTitle: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: 'bold',
            marginBottom: '4px'
        },
        headerSubtitle: {
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)'
        },
        section: {
            padding: isMobile ? '16px' : '24px',
            borderBottom: '1px solid #334155'
        },
        label: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#94a3b8',
            marginBottom: '8px'
        },
        linkContainer: {
            display: 'flex',
            gap: '8px',
            flexDirection: isMobile ? 'column' : 'row'
        },
        linkInput: {
            flex: 1,
            backgroundColor: '#0f172a',
            border: '1px solid #475569',
            borderRadius: '8px',
            padding: '12px 14px',
            color: '#f8fafc',
            fontSize: isMobile ? '13px' : '14px',
            fontFamily: 'monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        buttonGroup: {
            display: 'flex',
            gap: '8px'
        },
        copyButton: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            backgroundColor: copied ? '#22c55e' : '#7c3aed',
            color: '#ffffff',
            padding: isMobile ? '12px 16px' : '12px 20px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '500',
            fontSize: '14px',
            cursor: 'pointer',
            minWidth: isMobile ? 'auto' : '120px',
            transition: 'background-color 0.2s'
        },
        shareButton: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#334155',
            color: '#f8fafc',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            minWidth: '44px'
        },
        codeInfo: {
            marginTop: '8px',
            fontSize: '13px',
            color: '#64748b'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '12px' : '16px',
            padding: isMobile ? '16px' : '24px'
        },
        statCard: {
            textAlign: 'center',
            padding: '12px'
        },
        statValue: {
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: 'bold',
            marginBottom: '4px'
        },
        statLabel: {
            fontSize: '12px',
            color: '#94a3b8'
        },
        toggleButton: {
            width: '100%',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: '1px solid #334155',
            color: '#f8fafc',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '500'
        },
        tableContainer: {
            overflowX: 'auto',
            padding: '0 16px 16px'
        },
        table: {
            width: '100%',
            fontSize: '13px',
            borderCollapse: 'collapse'
        },
        th: {
            textAlign: 'left',
            padding: '12px 8px',
            color: '#94a3b8',
            fontWeight: '500',
            borderBottom: '1px solid #334155',
            whiteSpace: 'nowrap'
        },
        td: {
            padding: '12px 8px',
            borderBottom: '1px solid #1e293b',
            color: '#f8fafc'
        },
        infoBox: {
            padding: isMobile ? '16px' : '24px',
            backgroundColor: 'rgba(124, 58, 237, 0.1)'
        },
        infoContent: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
        },
        infoIcon: {
            width: '20px',
            height: '20px',
            color: '#a855f7',
            flexShrink: 0,
            marginTop: '2px'
        },
        infoTitle: {
            fontWeight: '600',
            color: '#a855f7',
            marginBottom: '4px',
            fontSize: '14px'
        },
        infoText: {
            fontSize: '13px',
            color: '#94a3b8',
            lineHeight: '1.5'
        },
        badge: {
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '500'
        },
        activeBadge: {
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            color: '#22c55e'
        },
        inactiveBadge: {
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            color: '#9ca3af'
        },
        emptyState: {
            padding: '32px 16px',
            textAlign: 'center',
            color: '#64748b'
        },
        errorState: {
            padding: '24px',
            textAlign: 'center',
            color: '#ef4444',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
        },
        retryButton: {
            backgroundColor: '#334155',
            color: '#f8fafc',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
        }
    };

    // Loading state
    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{ ...styles.header, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
                    <Loader2 className="animate-spin" style={{ width: '32px', height: '32px' }} />
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.errorState}>
                    <AlertCircle style={{ width: '32px', height: '32px' }} />
                    <p>{error}</p>
                    <button onClick={loadStats} style={styles.retryButton}>
                        Spróbuj ponownie
                    </button>
                </div>
            </div>
        );
    }

    // No referral code (should not happen, but just in case)
    if (!stats?.referralCode) {
        return (
            <div style={styles.container}>
                <div style={styles.emptyState}>
                    <Gift style={{ width: '32px', height: '32px', marginBottom: '12px', opacity: 0.5 }} />
                    <p>System referali jest niedostępny</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerTitle}>
                    <Gift style={{ width: '24px', height: '24px' }} />
                    Program Poleceń
                </div>
                <p style={styles.headerSubtitle}>
                    Zarabiaj 10% prowizji od zarobków poleconych użytkowników!
                </p>
            </div>

            {/* Referral Link */}
            <div style={styles.section}>
                <label style={styles.label}>Twój link polecający</label>
                <div style={styles.linkContainer}>
                    <input
                        type="text"
                        value={stats?.referralLink || ''}
                        readOnly
                        style={styles.linkInput}
                    />
                    <div style={styles.buttonGroup}>
                        <button onClick={copyToClipboard} style={styles.copyButton}>
                            {copied ? (
                                <>
                                    <Check style={{ width: '16px', height: '16px' }} />
                                    {!isMobile && 'Skopiowano'}
                                </>
                            ) : (
                                <>
                                    <Copy style={{ width: '16px', height: '16px' }} />
                                    {!isMobile && 'Kopiuj'}
                                </>
                            )}
                        </button>
                        <button onClick={shareLink} style={styles.shareButton} title="Udostępnij">
                            <Share2 style={{ width: '18px', height: '18px' }} />
                        </button>
                    </div>
                </div>
                <p style={styles.codeInfo}>
                    Twój kod: <strong style={{ color: '#a855f7', fontFamily: 'monospace' }}>{stats?.referralCode}</strong>
                </p>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: '#f8fafc' }}>
                        {stats?.stats?.totalReferrals || 0}
                    </div>
                    <div style={styles.statLabel}>Poleconych</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: '#22c55e' }}>
                        {stats?.stats?.activeReferrals || 0}
                    </div>
                    <div style={styles.statLabel}>Aktywnych</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: '#a855f7' }}>
                        {formatMoney(stats?.stats?.totalEarnings)}
                    </div>
                    <div style={styles.statLabel}>Zarobione łącznie</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statValue, color: '#0ea5e9' }}>
                        {formatMoney(stats?.stats?.last30DaysEarnings)}
                    </div>
                    <div style={styles.statLabel}>Ostatnie 30 dni</div>
                </div>
            </div>

            {/* Referrals List Toggle */}
            {stats?.stats?.totalReferrals > 0 && (
                <>
                    <button
                        onClick={() => setShowReferrals(!showReferrals)}
                        style={styles.toggleButton}
                    >
                        <span>Twoi poleceni ({stats?.stats?.totalReferrals})</span>
                        {showReferrals ? (
                            <ChevronUp style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
                        ) : (
                            <ChevronDown style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
                        )}
                    </button>

                    {showReferrals && (
                        <div style={styles.tableContainer}>
                            {stats?.referrals?.length > 0 ? (
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Email</th>
                                            <th style={styles.th}>Dołączył</th>
                                            <th style={{ ...styles.th, textAlign: 'right' }}>Zarobił</th>
                                            <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.referrals.map((ref) => (
                                            <tr key={ref.id}>
                                                <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '12px' }}>
                                                    {ref.email}
                                                </td>
                                                <td style={{ ...styles.td, color: '#94a3b8' }}>
                                                    {formatDate(ref.joinedAt)}
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'right', fontWeight: '500' }}>
                                                    {formatMoney(ref.totalEarned)}
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                                    <span style={{
                                                        ...styles.badge,
                                                        ...(ref.isActive ? styles.activeBadge : styles.inactiveBadge)
                                                    }}>
                                                        {ref.isActive ? 'Aktywny' : 'Nieaktywny'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={styles.emptyState}>
                                    <p>Brak poleconych użytkowników</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Commissions History Toggle */}
            {stats?.stats?.totalCommissions > 0 && (
                <>
                    <button
                        onClick={() => {
                            setShowCommissions(!showCommissions);
                            if (!showCommissions) loadCommissions();
                        }}
                        style={styles.toggleButton}
                    >
                        <span>Historia prowizji ({stats?.stats?.totalCommissions})</span>
                        {showCommissions ? (
                            <ChevronUp style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
                        ) : (
                            <ChevronDown style={{ width: '20px', height: '20px', color: '#94a3b8' }} />
                        )}
                    </button>

                    {showCommissions && (
                        <div style={styles.tableContainer}>
                            {loadingCommissions ? (
                                <div style={{ padding: '24px', textAlign: 'center' }}>
                                    <Loader2 className="animate-spin" style={{ width: '24px', height: '24px', color: '#a855f7' }} />
                                </div>
                            ) : commissions.length > 0 ? (
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Od</th>
                                            <th style={styles.th}>Data</th>
                                            <th style={{ ...styles.th, textAlign: 'right' }}>Zarobek poleconego</th>
                                            <th style={{ ...styles.th, textAlign: 'right' }}>Twoja prowizja</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {commissions.map((c) => (
                                            <tr key={c.id}>
                                                <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '12px' }}>
                                                    {c.referredEmail}
                                                </td>
                                                <td style={{ ...styles.td, color: '#94a3b8' }}>
                                                    {formatDate(c.createdAt)}
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'right', color: '#94a3b8' }}>
                                                    {formatMoney(c.referredEarning)}
                                                </td>
                                                <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600', color: '#22c55e' }}>
                                                    +{formatMoney(c.commission)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={styles.emptyState}>
                                    <p>Brak prowizji</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Info Box */}
            <div style={styles.infoBox}>
                <div style={styles.infoContent}>
                    <TrendingUp style={styles.infoIcon} />
                    <div>
                        <div style={styles.infoTitle}>Jak to działa?</div>
                        <p style={styles.infoText}>
                            Udostępnij swój link polecający znajomym. Gdy ktoś się zarejestruje 
                            i zacznie zarabiać na swoich linkach, Ty otrzymujesz <strong style={{ color: '#a855f7' }}>10% prowizji</strong> od 
                            ich zarobków. Prowizja jest dożywotnia - im więcej zarabiają Twoi 
                            poleceni, tym więcej zarabiasz Ty!
                        </p>
                    </div>
                </div>
            </div>

            {/* Referred by info */}
            {stats?.referredBy && (
                <div style={{ 
                    padding: '12px 16px', 
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    borderTop: '1px solid #334155',
                    fontSize: '13px',
                    color: '#94a3b8'
                }}>
                    Zostałeś polecony przez: <span style={{ color: '#0ea5e9' }}>{stats.referredBy.email}</span>
                </div>
            )}
        </div>
    );
}

export default ReferralSection;